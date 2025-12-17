import frappe

def template_by_name(template_name):
    return frappe.get_doc("Email Template", template_name)
