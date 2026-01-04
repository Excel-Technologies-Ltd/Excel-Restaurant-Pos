import frappe
from frappe.utils import nowdate
from excel_restaurant_pos.shared.sales_invoice import (
    get_receivable_account,
    get_mode_of_payment_account,
)


def create_payment_entry(sales_invoice):
    doc = frappe.get_doc("Sales Invoice", sales_invoice)

    # Get required accounts
    receivable_account = get_receivable_account(doc.company)
    if not receivable_account:
        frappe.throw(f"Receivable account not found for company {doc.company}")

    payment_account = get_mode_of_payment_account("Cash", doc.company)
    if not payment_account:
        frappe.throw(f"Payment account not found for company {doc.company}")

    # payments
    payments = doc.payments
    for payment in payments:

        # Create Payment Entry
        payment_entry = frappe.new_doc("Payment Entry")
        payment_entry.payment_type = "Receive"
        payment_entry.posting_date = nowdate()
        payment_entry.mode_of_payment = payment.mode_of_payment
        payment_entry.party_type = "Customer"
        payment_entry.party = doc.customer
        payment_entry.company = doc.company

        payment_entry.target_exchange_rate = 1
        payment_entry.paid_from = receivable_account
        payment_entry.paid_to = payment_account
        payment_entry.paid_amount = payment.amount
        payment_entry.received_amount = payment.amount

        # Add reference to the Sales Invoice with allocated amount
        payment_entry.append(
            "references",
            {
                "reference_doctype": "Sales Invoice",
                "reference_name": doc.name,
                "allocated_amount": payment.amount,
            },
        )

        payment_entry.insert(ignore_permissions=True)
        payment_entry.submit()
