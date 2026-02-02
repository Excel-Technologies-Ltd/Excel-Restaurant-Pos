import frappe
from frappe.utils import today, getdate


# get item list
@frappe.whitelist(allow_guest=True)
def get_item_list():
    """
    Get item list
    filters:
        - variant_of: is not set (exclude item variants)
        - disabled: 0 (exclude disabled items)
    """

    # pop cmd
    if frappe.form_dict.get("cmd"):
        frappe.form_dict.pop("cmd")

    # set default value
    frappe.form_dict.setdefault("limit", 10)
    frappe.form_dict.setdefault("limit_page_length", 10)

    # Use creation desc with item_code as secondary sort for consistent ordering
    if not frappe.form_dict.get("order_by"):
        frappe.form_dict["order_by"] = "creation desc, item_code asc"

    # update filters
    filters = frappe.form_dict.get("filters")
    default_filters = [["variant_of", "is", "not set"], ["disabled", "=", 0]]

    # Convert filters to list format if needed
    if not filters:
        filters = default_filters
    else:
        filters = frappe.parse_json(filters)
        filters.extend(default_filters)

    # Update form_dict with modified filters
    frappe.form_dict["filters"] = filters

    # get item list
    item_list = frappe.get_all("Item", **frappe.form_dict)

    item_codes = [item.item_code for item in item_list]

    # get item prices
    prices = frappe.get_all(
        "Item Price",
        filters={"item_code": ["in", item_codes], "selling": 1},
        fields=["item_code", "price_list", "price_list_rate", "valid_upto"],
    )

    # Group prices by item_code (handle multiple prices per item)
    # Filter out prices with expired valid_upto dates
    today_date = getdate(today())
    price_map = {}
    for price in prices:
        # Skip if valid_upto is set and has passed
        if price.valid_upto:
            valid_upto_date = getdate(price.valid_upto)
            if valid_upto_date < today_date:
                continue  # Price is expired, skip it

        # only valid item is included
        item_code = price.item_code
        if item_code not in price_map:
            price_map[item_code] = []
        price_map[item_code].append(price)

    # attach price to item list
    for item in item_list:
        item["prices"] = price_map.get(item.item_code, [])

    # return item list
    return item_list
