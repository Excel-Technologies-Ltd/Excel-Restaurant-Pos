import frappe

from excel_restaurant_pos.doc_event.shared import handle_table_release


def order_change_handler(invoice_name: str):
    """
    Handle order change
    """

    invoice = frappe.get_doc("Sales Invoice", invoice_name)
    if not invoice:
        frappe.log_error("Invoice not found", f"Invoice {invoice_name} not found")
        return

    # validate order status
    status = invoice.custom_order_status
    if status not in ["Closed", "Rejected"]:
        msg = f"Invalid order status {status} for invoice {invoice_name}, expected: Closed or Rejected"
        frappe.log_error("Invalid order status", msg)
        return

    # table release logic
    table_name = invoice.get("custom_linked_table", None)
    if not table_name:
        msg = f"Table name not found for invoice {invoice_name}"
        frappe.log_error("Table name not found", msg)
        return

    order_from = invoice.get("custom_order_from", "").lower()
    if "table" not in order_from:
        msg = f"Order from {order_from} is not a table, expected: table"
        frappe.log_error("Order from not a table", msg)
        return

    # table release logic
    args = {"table_name": table_name, "sales_invoice": invoice.name}
    frappe.enqueue(handle_table_release, queue="short", **args)
