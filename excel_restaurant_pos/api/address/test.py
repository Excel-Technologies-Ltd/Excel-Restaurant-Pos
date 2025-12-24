import frappe


@frappe.whitelist(allow_guest=True)
def test():
    """
    Test function
    """
    return "Test Address API"
