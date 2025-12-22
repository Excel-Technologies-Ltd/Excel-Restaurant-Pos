import frappe

@frappe.whitelist(allow_guest=True)
def test():
    return "From Item Group API"

@frappe.whitelist(allow_guest=True)
def get_item_group_list():
    """
    Get distinct item group list that have items
    """
    item_filters = [["variant_of", "is", "not set"], ["disabled", "=", 0]]

    # Get all item groups (may contain duplicates)
    item_groups = frappe.get_all("Item", filters=item_filters, pluck="item_group")
    
    # item groups
    if frappe.form_dict.get("cmd"):
        frappe.form_dict.pop("cmd")

    # update filters
    filters = frappe.form_dict.get("filters")   
    default_filters =[["name", "in", item_groups]]

    # Convert filters to list format if needed
    if not filters:
        filters = default_filters
    else:
        filters = frappe.parse_json(filters)
        filters.extend(default_filters)
    
    # Update form_dict with modified filters
    frappe.form_dict["filters"] = filters

    item_group_list = frappe.get_all("Item Group", **frappe.form_dict)

    return item_group_list