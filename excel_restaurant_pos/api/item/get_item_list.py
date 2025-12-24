import frappe


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
    frappe.form_dict.setdefault("order_by", "creation")

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
        filters={"item_code": ["in", item_codes], "price_list": "Standard Selling"},
        fields=["item_code", "price_list_rate"],
    )
    price_map = {price.item_code: price.price_list_rate for price in prices}

    # attach price to item list
    for item in item_list:
        item.price = price_map.get(item.item_code, 0)

    # return item list
    return item_list
