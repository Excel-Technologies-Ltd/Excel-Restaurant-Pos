import frappe
from frappe.utils import get_url
@frappe.whitelist(allow_guest=True)
def test():
    return "test"

@frappe.whitelist(allow_guest=True)
def get_category_list():
    query = """
        SELECT name, image
        FROM `tabItem Group`
        WHERE is_restaurant_pos = 1
    """
    return frappe.db.sql(query, as_dict=True)



# @frappe.whitelist(allow_guest=True)
# def get_food_item_list(category=None):
#     # Set default category to "All" if not provided
#     if not category:
#         category = "All"
    
#     # Determine the categories to query
#     if category == "All":
#         category_list = get_category_list_with_array()  # Assuming this function returns a list of categories
#     else:
#         category_list = [category]
    
#     # Fetch items using the Frappe API
#     item_list = frappe.get_all(
#         'Item',
#         filters={
#             'item_group': ['in', category_list],  # Filter by category list
#             'variant_of': ""  # Exclude variants
#         },
#         fields=['item_name', 'item_code', 'item_group', 'image',"has_variants"],
#         order_by='creation',
#         limit_page_length=100  # You can adjust this to limit the number of items fetched
#     )
    
#     # Fetch price information for each item
#     for item in item_list:
#         if item['has_variants']:
#             variant_item = frappe.db.get_value('Item', {'variant_of': item['item_code'],'default_variant':1},['item_code'])
#             if not variant_item:
#                 item['price'] = 0
#             price=frappe.db.get_value('Item Price', {'item_code':variant_item,'price_list':'Standard Selling'},'price_list_rate')
#             item['price'] = price if price else 0
#         else:
#             price = frappe.db.get_value('Item Price', 
#                                     {'item_code': item['item_code'], 'price_list': 'Standard Selling'}, 
#                                     'price_list_rate')
#             item['price'] = price if price else 0
    
#     return item_list

@frappe.whitelist(allow_guest=True)
def get_food_item_list(category=None):
    # Set default category to "All" if not provided
    if not category:
        category = "All"
    
    # Determine the categories to query
    if category == "All":
        category_list = get_category_list_with_array()  # Assuming this function returns a list of categories
    else:
        category_list = [category]
    
    # Fetch items using the Frappe API
    item_list = frappe.get_all(
        'Item',
        filters={
            'item_group': ['in', category_list],  # Filter by category list
            'variant_of': ""  # Exclude variants
        },
        fields=['item_name', 'item_code', 'item_group', 'image', 'has_variants','description'],
        order_by='creation',
        limit_page_length=100  # Adjust this to limit the number of items fetched
    )

    # Separate items with and without variants
    variant_items = [item['item_code'] for item in item_list if item['has_variants']]
    non_variant_items = [item['item_code'] for item in item_list if not item['has_variants']]
    
    # Get default variant items in batch for items with variants
    default_variants = frappe.get_all(
        'Item',
        filters={'variant_of': ['in', variant_items], 'default_variant': 1},
        fields=['variant_of', 'item_code']
    )
    # Map each parent item to its default variant
    default_variant_map = {variant['variant_of']: variant['item_code'] for variant in default_variants}
    
    # Fetch prices in batch for all items (both default variants and non-variants)
    all_item_codes = non_variant_items + list(default_variant_map.values())
    prices = frappe.get_all(
        'Item Price',
        filters={
            'item_code': ['in', all_item_codes],
            'price_list': 'Standard Selling'
        },
        fields=['item_code', 'price_list_rate']
    )
    # Create a dictionary of item prices for quick lookup
    price_map = {price['item_code']: price['price_list_rate'] for price in prices}

    # Attach price to each item in the list
    for item in item_list:
        if item['has_variants']:
            # Use default variant price if available
            variant_code = default_variant_map.get(item['item_code'])
            item['price'] = price_map.get(variant_code, 0) if variant_code else 0
        else:
            # Non-variant item price
            item['price'] = price_map.get(item['item_code'], 0)

    return item_list




@frappe.whitelist(allow_guest=True)
def get_single_food_item_details(item_code):
    item_details = frappe.get_doc("Item", item_code)
    item_name = item_details.item_name
    image = item_details.image
    has_variants = bool(item_details.has_variants)
    if has_variants:
        variant_item_list = get_variant_item_list(item_code)
        default_variant = next((variant for variant in variant_item_list if variant.get('default_variant') == True), None)
        if default_variant:
            price = default_variant['price']
        else:
            price = variant_item_list[0]['price']
    else:
        variant_item_list = []
        price = frappe.db.get_value('Item Price', {'item_code': item_code, 'price_list': 'Standard Selling'}, 'price_list_rate')
    add_ons_item_list = get_add_ons_list(item_code)
    response={
        "item_code": item_code,
         "item_name": item_name,
        "image": image,
        "has_variants": has_variants,
        "price": price,
        "add_ons_item_list": add_ons_item_list,
        "description":item_details.description
    }
    if has_variants:
        response["variant_item_list"] = variant_item_list
    return response
    



def get_category_list_with_array():
    category_list = get_category_list()
    return [category['name'] for category in category_list]
# def get_add_ons_list(item_code):
#     query = """
#         SELECT category, icon
#         FROM `tabFood Category`
#         WHERE parenttype = 'Restaurant Settings' 
#           AND parentfield = 'categories'
#         ORDER BY creation
#     """
    
def get_add_ons_list(item_code):
    query = """
        SELECT fi.item_id as item_code ,i.item_name as item_name,i.image as image,COALESCE(ip.price_list_rate, 0) as price
        FROM `tabFood Item List` as fi
        LEFT JOIN `tabItem` as i ON fi.item_id = i.item_code
        LEFT JOIN `tabItem Price` as ip ON fi.item_id = ip.item_code and ip.price_list = "Standard Selling"
        WHERE fi.parent = %s and fi.parentfield= "add_ons_item_list" and fi.parenttype= "Item"
    """
    return frappe.db.sql(query, (item_code,), as_dict=True)

def get_variant_item_list(item_code):
    query = """
        SELECT i.default_variant as default_variant,i.item_code as item_code ,i.item_name as item_name,i.image as image,COALESCE(ip.price_list_rate, 0) as price
        FROM `tabItem` as i
        LEFT JOIN `tabItem Price` as ip ON i.item_code = ip.item_code and ip.price_list = "Standard Selling"
        WHERE i.variant_of = %s
    """
    return frappe.db.sql(query, (item_code,), as_dict=True)

# your_app/your_app/api.py

import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def make_as_ready_item(body):
    try:
        data=frappe.parse_json(body)
        # Fetch the order document using the order_id
        order_doc = frappe.get_doc("Table Order", data["order_id"])

        # Loop through the items in the order
        for item in order_doc.item_list:
            # Check if the item matches the name
            if item.name.lower() == data["item_name"].lower():  # Case-insensitive match
                item.is_ready = 1  # Mark the item as Ready
                order_doc.save(ignore_permissions=True)  # Save the order document
                frappe.db.commit()  # Commit the transaction
                return {
                    "status": "success",
                }

        # If the item wasn't found, return failure response
        return {
            "status": "failed",
        }

    except Exception as e:
        # Log error and return failure message
        return {
            "status": "failure",
            "message": "An error occurred while processing your request."
        }


@frappe.whitelist(allow_guest=True)  # Makes the endpoint publicly accessible
def create_order(data):
    user = frappe.session.user
    """
    Public API endpoint to create or update a 'Table Order' in ERPNext.
    
    :param data: JSON dictionary with required fields to create the order.
    :return: JSON response with success status or error message.
    """
    try:
        # Parse incoming data
        order_data = frappe.parse_json(data)
        settings = frappe.get_doc("Restaurant Settings")
        
        existing_order_name=''
        # Check for existing order
        if order_data["table"]:
            existing_order_name = frappe.db.exists(
                "Table Order",
                {
                    "table": order_data["table"],
                    "status": ["not in", ["Completed", "Canceled"]]
                }
            )
        print(existing_order_name)

        if existing_order_name:
            print('working')
            # Fetch the existing order using the name returned by frappe.db.exists()
            order_doc = frappe.get_doc("Table Order", existing_order_name)
            print(order_doc)
            # Corrected here
            existing_items = order_doc.item_list
            new_items = order_data.get("item_list", [])
            
            # Add new items to the existing order
            for item in new_items:
                order_doc.append("item_list", item)

            
            # Update amounts
            order_doc.amount =  float (order_doc.amount )+float(order_data.get("amount", 0))  # Safely cast to float
            order_doc.total_amount = float( order_doc.total_amount) + float(order_data.get("total_amount", 0))  # Safely cast to float
            order_doc.discount = float(order_doc.discount) + float(order_data.get("discount", 0))  # Safely cast to float
            order_doc.status = "Work in progress" if order_doc.status != 'Order Placed' else "Order Placed" # Update order status to work in progress
            order_doc.remarks = order_data.get("remarks")

            # Save and commit the changes to the existing order
            order_doc.save(ignore_permissions=True)
            frappe.db.commit()
            
            return {
                "status": "success",
                "message": "Order updated successfully",
                "order_name": order_doc.name
            }

        # Mandatory fields check
        required_fields = ["amount", "total_amount", "item_list"]
        for field in required_fields:
            if not order_data.get(field):
                return {"status": "error", "message": _("Field '{0}' is required.").format(field)}

        # Create a new 'Table Order' document if no existing order
        order_doc = frappe.get_doc({
            "doctype": "Table Order",
            "customer": settings.customer,
            "table": order_data["table"],
            "amount": float(order_data["amount"]),
            "total_amount": float(order_data["total_amount"]),
            "item_list": order_data["item_list"],
            # Optional fields with default values
            "floor": order_data.get("floor"),
            "address": order_data.get("address") or "Test Address",  # Corrected typo from "adresss"
            "tax": order_data.get("tax") or 0,
            "discount": order_data.get("discount") or 0,
            "discount_type": order_data.get("discount_type") ,
            "company": order_data.get("company"),
            "customer_name": order_data.get("customer_name") or "Test User",
            "remarks": order_data.get("remarks"),
            "status": order_data.get("status", "Order Placed"),
            "docstatus":1 if order_data.get("status")== 'Completed' else 0,
            'is_paid': 1 if order_data.get("is_paid") else 0
            # Default to "Order Placed"
        })

        # Insert the document into the database
        order_doc.insert(ignore_permissions=True)
        
        # Commit the transaction
        frappe.db.commit()
        
        return {
            "status": "success",
            "message": "Order created successfully",
            "order_name": order_doc.name
        }
    
    except frappe.ValidationError as e:
        print("validation error")
        print(e)
        frappe.log_error(frappe.get_traceback(), _("Order Creation Error"))
        return {"status": "error", "message": str(e)}
    
    except Exception as e:
        print("exce")
        print(e)
        frappe.log_error(frappe.get_traceback(), _("Unknown Error in Order Creation"))
        return {"status": "error", "message": str(e)}

@frappe.whitelist()
def get_running_order_list():
    order_list = frappe.get_all("Table Order",fields=["*"],filters=[["status","!=","Completed"],["status","!=","Canceled"]],order_by="creation desc")
    for order in order_list:
        order["item_list"] = get_order_item_list(order.name)
    return order_list

@frappe.whitelist(allow_guest=True)
def get_running_order_item_list(table_id):
    order_list = frappe.get_all("Table Order",fields=["*"],filters=[["status","!=","Completed"],["status","!=","Canceled"],["table", "=", table_id]],order_by="creation desc")
    for order in order_list:
        order["item_list"] = get_order_item_list(order.name)
    if len(order_list) > 0:
        return order_list[0].item_list
    else:
        return []
@frappe.whitelist(allow_guest=True)
def get_tax_rate():
    settings = frappe.get_doc("Restaurant Settings")
    return int(settings.tax_rate)/100
@frappe.whitelist()
def get_order_list(status=None):
    if status:
        print(status)
        order_list = frappe.get_all("Table Order",fields=["*"],filters=[["status","in",[status]]],order_by="creation desc")
    else:
        order_list = frappe.get_all("Table Order",fields=["*"],order_by="creation desc")
    for order in order_list:
        order["item_list"] = get_order_item_list(order.name)
    return order_list
@frappe.whitelist()
def get_chef_order_list():
    # Define the filters correctly using "or" condition
    filters = [
        ["status", "=", "Work in progress"],
        ["status", "=", "Ready to Serve"]
    ]
    
    # Get the table orders using the OR condition with "|"
    order_list = frappe.get_all("Table Order", fields=["*"], or_filters= filters, order_by="creation desc")
    
    # Add item list to each order
    for order in order_list:
        order["item_list"] = get_order_item_list(order.name)
    
    return order_list



@frappe.whitelist()
def get_order_item_list(order_id):
    return frappe.get_all("Table Order Item",filters={"parent":order_id},fields=['item','qty','amount','rate',"is_parcel","is_ready","name","parent"],order_by="creation desc")

@frappe.whitelist(allow_guest=True)
def get_roles(user):
    roles = frappe.db.sql("""
        SELECT `tabHas Role`.`role` AS `Role`
        FROM `tabHas Role`
        JOIN `tabUser` ON `tabUser`.`name` = `tabHas Role`.`parent`
        WHERE `tabUser`.`name` = %(user)s
    """, {"user": user}, as_dict=True)
    
    return roles

@frappe.whitelist(allow_guest=True)
def check_coupon_code(data):
    coupon_code = frappe.parse_json(data).get("coupon_code")
    if not coupon_code:
        return {'status':'error',"message":"Invalid"}
    try:
        if frappe.session.user == "Guest":
            result = frappe.db.get_value(
                "Restaurant Coupon", {'is_active': 1, 'is_public': 1, "coupon_code": coupon_code}, ['discount_type', 'amount']
            )
            if result and len(result) == 2:  # Ensure result is a tuple with two elements
                discount_type, amount = result
                return {'status':'success',"discount_type": discount_type, "amount": amount}
            else:
                return {'status':'error',"message":"Invalid"}
        
        # Check for logged-in user
        result = frappe.db.get_value(
            "Restaurant Coupon", {'is_active': 1, "coupon_code": coupon_code}, ['discount_type', 'amount']
        )
        if result and len(result) == 2:  # Ensure result is a tuple with two elements
            discount_type, amount = result
            return {'status':'success',"discount_type": discount_type, "amount": amount}
        else:
            return {'status':'error',"message":"Invalid"}

    except Exception as e:
        frappe.log_error(f"Error in check_coupon_code: {str(e)}")
        return "An error occurred while checking the coupon code."
    
    





@frappe.whitelist(allow_guest=True)
def get_logo_and_title():
    hostname= get_url()
    settings = frappe.get_doc("Restaurant Settings")
    return {
        "logo": f"{settings.logo}",
        "title": settings.title
    }