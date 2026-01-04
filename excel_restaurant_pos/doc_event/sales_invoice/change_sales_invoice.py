import frappe


def change_sales_invoice(doc, method=None):
    """
    Validate Sales Invoice
    """
    if doc.status == "Paid":
        frappe.db.set_value("Sales Invoice", doc.name, "custom_order_status", "Closed")

    if doc.custom_order_status == "Closed":
        frappe.msgprint(f"From sales invoice validate function, doc: {doc.name}")
        # frappe.db.set_value("Sales Order", doc.custom_order_name, "status", "Closed")
