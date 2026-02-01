import frappe


@frappe.whitelist(allow_guest=True)
def system_settings():
    """
    Get ArcPOS System Settings as a dictionary.
    Returns all fields from the single ArcPOS System Settings doctype.
    """
    settings = frappe.get_single("System Settings")
    return settings.as_dict()
