"""Document event handler for Sales Invoice deletion."""

import frappe


def on_trash_sales_invoice(doc: frappe.Document, method: str):
    """
    Document event handler for Sales Invoice trash.
    Args:
        doc: The Sales Invoice document.
        method: The method being called.
    """
    frappe.msgprint("I am from on trash sales invoice")
