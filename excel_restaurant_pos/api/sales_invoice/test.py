import frappe


@frappe.whitelist(allow_guest=True)
def test():
    return "Test From Sales Invoice Test Module"
