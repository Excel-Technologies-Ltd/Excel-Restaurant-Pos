"""Document event handlers for Sales Invoice after save."""

import frappe

from excel_restaurant_pos.doc_event.shared import handle_table_occupy


def after_save_sales_invoice(doc, method: str):
    """
    After save sales invoice
    """
    table_name = doc.custom_linked_table
    order_from = None
    if doc.custom_order_from:
        order_from = doc.custom_order_from.lower()

    # if the sales invoice is linked to a table and the order is from a table, enqueue the table occupy
    # enqueue_after_commit=True so the job runs only after the Sales Invoice is committed (avoids "Could not find Running Order")
    if table_name and order_from == "table":
        args = {"table_name": table_name, "sales_invoice": doc.name}
        frappe.enqueue(
            handle_table_occupy,
            queue="short",
            enqueue_after_commit=True,
            **args,
        )
