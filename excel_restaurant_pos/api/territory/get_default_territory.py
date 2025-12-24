import frappe


@frappe.whitelist(allow_guest=True)
def get_default_territory():
    """
    Get default territory
    """
    selling_settings = frappe.get_single("Selling Settings")
    if not selling_settings:
        frappe.throw("Selling Settings is not set")

    if not selling_settings.territory:
        frappe.throw("Territory is not set in Selling Settings")

    territory = frappe.get_doc("Territory", selling_settings.territory)
    if not territory:
        frappe.throw("Territory is not found")

    return territory.as_dict()
