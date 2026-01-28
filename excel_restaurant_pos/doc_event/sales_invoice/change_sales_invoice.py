"""Document event handlers for Sales Invoice changes."""

import frappe

from .handlers.payment_change_handler import payment_change_handler
from .handlers.order_change_handler import order_change_handler
from .handlers.order_cancel_handler import order_cancel_handler


def change_sales_invoice(doc, method: str):
    """
    Validate Sales Invoice
    """

    # payment change logic
    if doc.has_value_changed("status") and doc.status == "Paid":
        frappe.log_error("Status changed", f"Status changed to {doc.status}")
        frappe.enqueue(payment_change_handler, queue="default", invoice_name=doc.name)

    # cancelled status logic
    if doc.has_value_changed("status") and doc.status == "Cancelled":
        msg = f"Status changed to {doc.status}"
        frappe.log_error("Status changed", msg)
        frappe.enqueue(order_cancel_handler, queue="default", invoice_name=doc.name)

    # order status change logic
    if doc.has_value_changed("custom_order_status"):
        msg = f"Order status changed to {doc.custom_order_status}"
        frappe.log_error("Order status changed", msg)
        frappe.enqueue(order_change_handler, queue="default", invoice_name=doc.name)

    # table realease logic here
    # table_name = doc.custom_linked_table
    # order_from = None
    # if doc.custom_order_from:
    #     order_from = doc.custom_order_from.lower()

    # # generate args
    # args = {"table_name": table_name, "sales_invoice": doc.name}

    # # if the sales invoice is paid and the order is from a table, enqueue the table release
    # if doc.status == "Paid":
    #     frappe.db.set_value("Sales Invoice", doc.name, "custom_order_status", "Closed")
    #     if table_name and order_from == "table":
    #         frappe.enqueue(handle_table_release, queue="short", **args)

    # release_status = ["Closed", "Rejected"]
    # if doc.custom_order_status in release_status:
    #     if table_name and order_from == "table":
    #         frappe.enqueue(handle_table_release, queue="short", **args)
