import frappe

from excel_restaurant_pos.api.sales_invoice.add_or_update_invoice import _add_payments
from .helper.check_receipt import check_receipt


@frappe.whitelist(allow_guest=True)
def receipt_payment():
    """
    Receipt a payment ticket.
    """

    # validate ticket
    ticket = frappe.form_dict.get("ticket")
    invoice_name = frappe.form_dict.get("order_no")
    if not ticket or not invoice_name:
        frappe.throw("Ticket and order number are required")

    # get ticket details
    invoice_no = frappe.db.get_value("Payment Ticket", {"ticket": ticket}, "invoice_no")
    if not invoice_no:
        frappe.throw("Ticket not found")

    # check receipt status
    receipt_status = check_receipt(ticket)
    receipt_result = receipt_status.get("receipt", {})
    success_result = receipt_status.get("success", "false")
    if success_result != "true" or receipt_result != "a":
        frappe.throw("Invalid or expired payment ticket", frappe.ValidationError)

    # validate order number
    order_number = receipt_status.get("request", {}).get("order_no")
    if order_number != invoice_name:
        frappe.throw("Order number mismatch", frappe.ValidationError)

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

    # update order invoice satus and also each item status
    if invoice.custom_service_type and invoice.custom_service_type == "Delivery":
        invoice.custom_order_status = "In kitchen"
        for item in invoice.items:
            item.custom_order_item_status = "In kitchen"

    # set requird properties to create payment entry, while submit invoice
    invoice.is_pos = 1
    invoice.custom_with_arcpos_payment = 1

    # submit sales invoice with payment data
    invoice.save(ignore_permissions=True)
    invoice.submit(ignore_permissions=True)

    # return True
    return {"success": True}
