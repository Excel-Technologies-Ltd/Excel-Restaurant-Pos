import frappe


def create_add_on_item(doc, method):

    # Ensure the item_group is not empty to avoid errors
    if not doc.item_group:
        frappe.msgprint("Item Group is not specified.")
        return

    # Check if the item group has add-ons enabled
    check_add_ons = frappe.db.get_value(
        "Item Group",
        {"name": doc.item_group, "is_add_ons": 1},  # Set proper filter for item_group
        "is_add_ons",
    )

    if not check_add_ons:
        return
    check_add_ons_item = frappe.db.get_value(
        "Add Ons Item", {"item_code": doc.item_code}, "item_code"
    )
    frappe.msgprint("From created add ons items")
    if check_add_ons_item:
        return
    item_code = doc.item_code
    item_name = doc.item_name
    frappe.get_doc(
        {
            "doctype": "Add Ons Item",
            "item_code": item_code,
            "item_name": item_name,
        }
    ).insert()
    frappe.db.commit()
