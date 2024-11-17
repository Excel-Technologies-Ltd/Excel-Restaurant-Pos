
import frappe
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

@frappe.whitelist(allow_guest=True)  # Makes the endpoint publicly accessible
def create_order(data):
    """
    Public API endpoint to create a 'Table Order' in ERPNext.
    
    :param data: JSON dictionary with required fields to create the order.
    :return: JSON response with success status or error message.
    """
    try:
        # Parse incoming JSON data
        order_data = frappe.parse_json(data)
        
        # Mandatory fields check
        required_fields = ["customer", "table", "amount", "total_amount", "item_list"]
        for field in required_fields:
            if not order_data.get(field):
                return {"status": "error", "message": _("Field '{0}' is required.").format(field)}

        # Create a new 'Table Order' document
        order_doc = frappe.get_doc({
            "doctype": "Table Order",
            "customer": order_data["customer"],
            "doc_status": "0",
            "table": order_data["table"],
            # "pos_profile": order_data["pos_profile"],
            "amount": order_data["amount"],
            "total_amount": order_data["total_amount"],
            "item_list": order_data["item_list"],
            # Optional fields
            "floor": order_data.get("floor"),
            "adresss": order_data.get("adresss") or "Test Address",
            "tax": order_data.get("tax") or 0,
            "discount": order_data.get("discount") or 0,
            "discount_type": order_data.get("discount_type") or "percentage",
            "tax_and_charges": order_data.get("tax_and_charges") or "Sales Tax",
            "company": order_data.get("company"),
            "customer_name": order_data.get("customer_name") or "Test User",
            "remarks": order_data.get("remarks"),
            "status": order_data.get("status", "Order Placed")  # Default to "Draft" status
        })

        # Insert the document into the database
        order_doc.insert(ignore_permissions=True)
        
        # Commit the transaction to ensure data is saved
        frappe.db.commit()
        
        return {"status": "success", "message": "Order created successfully", "order_name": order_doc.name}
    
    except frappe.ValidationError as e:
        frappe.log_error(frappe.get_traceback(), _("Order Creation Error"))
        return {"status": "error", "message": str(e)}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Unknown Error in Order Creation"))
        print("error",e)
        return {"status": "error", "message": _("An error occurred while creating the order")}

@frappe.whitelist()
def get_order_list():
    order_list = frappe.get_all("Table Order",fields=["*"],filters=[["status","!=","Completed"],["status","!=","Canceled"]],order_by="creation desc")
    for order in order_list:
        order["item_list"] = get_order_item_list(order.name)
    return order_list

@frappe.whitelist()
def get_order_item_list(order_id):
    return frappe.get_all("Table Order Item",filters={"parent":order_id},fields=['item','qty','amount','rate'],order_by="creation desc")

@frappe.whitelist()
def get_roles():
    roles = frappe.get_roles()
    print(roles)
    return roles