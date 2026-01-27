import frappe
from excel_restaurant_pos.shared.sales_invoice import delete_invoice_from_db


@frappe.whitelist(allow_guest=True)
def cancel_payment():
    """
    Cancel a payment ticket.
    """

    # validate ticket
    ticket = frappe.form_dict.get("ticket")
    if not ticket:
        frappe.throw("Ticket is required")

    # get ticket details
    invoice_no = frappe.db.get_value("Payment Ticket", {"ticket": ticket}, "invoice_no")
    if not invoice_no:
        frappe.throw("Invoice not found")

    # get invoice
    invoice = frappe.get_doc("Sales Invoice", invoice_no)
    if not invoice:
        frappe.throw("Invoice not found")

    # if invoice is in draft, delete the invoice
    if invoice.docstatus == 0:
        delete_invoice_from_db(invoice_no)
        frappe.throw("Invoice deleted successfully", frappe.ValidationError)

    # return True
    return {"success": True}
