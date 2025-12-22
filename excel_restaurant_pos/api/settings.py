import frappe

@frappe.whitelist(allow_guest=True)
def test():
    return "From Settings API"

@frappe.whitelist(allow_guest=True)
def get_settings():
    """
    Get settings
    """
    settings = frappe.get_single("ArcPOS Settings")
    return settings.as_dict()

@frappe.whitelist(allow_guest=True)
def get_system_settings():
    """
    Get system settings
    """
    settings = frappe.get_single("ArcPOS System Settings")
    return settings.as_dict()