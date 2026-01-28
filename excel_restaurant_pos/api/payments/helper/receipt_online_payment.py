import frappe


def receipt_online_payment(payment_data: dict):
    """
    Receipt online payment
    """
    # get payment data
    payment_data = frappe.form_dict.get("payment_data")
    if not payment_data:
        frappe.throw("Payment data is required")

    # get payment data
    payment_data = frappe.form_dict.get("payment_data")
