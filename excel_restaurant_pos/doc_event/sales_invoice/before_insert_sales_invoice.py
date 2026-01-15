"""Document event handler for Sales Invoice validation."""

import frappe


def before_insert_sales_invoice(doc, method: str):
    """
    Validate Sales Invoice
    Args:
        doc: The Sales Invoice document.
        method: The method being called.
    """
    order_from = None
    status = None

    if doc.custom_order_from:
        order_from = doc.custom_order_from.lower()

    if order_from and doc.custom_linked_table:
        table_name = doc.custom_linked_table
        status = frappe.db.get_value("Restaurant Table", table_name, "status")

    if status != "Available":
        frappe.throw(f"{table_name} is already occupied or unavailable")
