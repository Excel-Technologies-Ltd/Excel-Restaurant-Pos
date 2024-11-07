
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
        fields=['item_name', 'item_code', 'item_group', 'image', 'has_variants'],
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
    print(item_code)



def get_category_list_with_array():
    category_list = get_category_list()
    return [category['name'] for category in category_list]
def get_add_ons_list(item_code):
    query = """
        SELECT category, icon
        FROM `tabFood Category`
        WHERE parenttype = 'Restaurant Settings' 
          AND parentfield = 'categories'
        ORDER BY creation
    """