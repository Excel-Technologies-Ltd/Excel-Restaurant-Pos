import frappe
from .helper.check_receipt import check_receipt


@frappe.whitelist(allow_guest=True)
def check_receipt_status():
    """
    Check the receipt status of a payment ticket.
    """

    # validate ticket
    ticket = frappe.form_dict.get("ticket")
    if not ticket:
        frappe.throw("Ticket is required")

    # check receipt status
    receipt_status = check_receipt(ticket)

    return receipt_status
