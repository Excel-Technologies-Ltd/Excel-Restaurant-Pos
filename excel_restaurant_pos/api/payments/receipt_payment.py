import frappe

from excel_restaurant_pos.api.sales_invoice.add_or_update_invoice import _add_payments


@frappe.whitelist(allow_guest=True)
def receipt_payment():
    """
    Receipt a payment ticket.
    """

    # validate ticket
    ticket = frappe.form_dict.get("ticket")
    if not ticket:
        frappe.throw("Ticket is required")

    # get ticket details
    invoice_no = frappe.db.get_value("Payment Ticket", {"ticket": ticket}, "invoice_no")
    if not invoice_no:
        frappe.throw("Ticket not found")

    # get invoice
    invoice = frappe.get_doc("Sales Invoice", invoice_no)
    if not invoice:
        frappe.throw("Invoice not found")

    # check receipt payment
    payments = frappe.form_dict.get("payments", [])
    if not payments:
        frappe.throw("Payments are required")

    # add payments to invoice
    _add_payments(invoice, payments)

    # submit sales invoice with payment data
    invoice.is_pos = 1
    invoice.custom_with_arcpos_payment = 1
    invoice.save()
    invoice.submit()

    # return True
    return {"success": True}
