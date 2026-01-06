import frappe


@frappe.whitelist(allow_guest=True)
def get_table():
    table_name = frappe.form_dict.get("table_name", None)

    if not table_name:
        frappe.throw("Table name is required", frappe.ValidationError)

    table = frappe.db.get_doc("Table", table_name)
    return table.as_dict()
