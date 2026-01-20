import frappe


@frappe.whitelist(allow_guest=False, methods=["POST"])
def add_item():
    """Add a new item to the database."""

    # item info
    item_info: dict = {}

    # required fields
    required_fields = ["item_name", "item_group", "stock_uom", "description"]
    for field in required_fields:
        if not frappe.form_dict.get(field):
            frappe.throw(f"{field} is required", frappe.MandatoryError)
        item_info[field] = frappe.form_dict.get(field)

    # optional fields
    optional_fields = [
        "custom_available_in_menus",
        "has_variants",
        "variant_based_on",
        "variant_of",
    ]
    for field in optional_fields:
        if frappe.form_dict.get(field):
            item_info[field] = frappe.form_dict.get(field)

    # create item
    item = frappe.get_doc({"doctype": "Item", **item_info})

    # item variants
    variant_fields = ["variant_of", "attribute", "attribute_value"]
    attributes = frappe.form_dict.get("attributes", [])
    for attribute in attributes:
        for field in variant_fields:
            if not attribute.get(field):
                frappe.throw(f"{field} is required", frappe.MandatoryError)
        item.append("attributes", {field: attribute.get(field)})

    item.insert(ignore_permissions=True)
    frappe.db.commit()

    return item
