import frappe


@frappe.whitelist(allow_guest=True)
def test():
    return "From Settings API"
