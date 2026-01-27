import frappe


def delete_invoice_from_db(invoice_no: str):
    """
    Delete the invoice from the database.
    Args:
        invoice_no: The invoice number to delete
    Returns:
        bool: True if successful
    """
    # validate the invoice number
    if not invoice_no:
        frappe.throw("Invoice number is required", frappe.ValidationError)

    # validate the invoice exists
    if not frappe.db.exists("Sales Invoice", {"name": invoice_no}):
        frappe.throw("Invoice not found", frappe.DoesNotExistError)

    # delete the invoice
    frappe.db.delete("Sales Invoice", {"name": invoice_no})
    frappe.db.commit()

    # return True if successful
    return True
