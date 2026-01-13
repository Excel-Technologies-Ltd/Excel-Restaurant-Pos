import frappe
from excel_restaurant_pos.doc_event.shared import handle_table_release


def change_sales_invoice(doc, method=None):
    """
    Validate Sales Invoice
    """
    table_name = doc.custom_linked_table
    order_from = None
    if doc.custom_order_from:
        order_from = doc.custom_order_from.lower()

    # generate args
    args = {"table_name": table_name, "sales_invoice": doc.name}

    # if the sales invoice is paid and the order is from a table, enqueue the table release
    if doc.status == "Paid":
        frappe.db.set_value("Sales Invoice", doc.name, "custom_order_status", "Closed")
        if table_name and order_from == "table":
            frappe.enqueue(handle_table_release, queue="short", **args)

    release_status = ["Closed", "Rejected"]
    if doc.custom_order_status in release_status:
        if table_name and order_from == "table":
            frappe.enqueue(handle_table_release, queue="short", **args)
