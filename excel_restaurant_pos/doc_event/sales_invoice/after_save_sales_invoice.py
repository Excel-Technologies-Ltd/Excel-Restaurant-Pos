import frappe


def after_save_sales_invoice(doc, method=None):
    """
    After save sales invoice
    """
    frappe.msgprint("From after save sales invoice.")
