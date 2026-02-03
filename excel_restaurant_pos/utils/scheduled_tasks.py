from excel_restaurant_pos.api.payments.helper.check_receipt import check_receipt
import frappe
from frappe.utils import now_datetime
from datetime import timedelta
from excel_restaurant_pos.doc_event.sales_invoice.handlers.create_payment_entry import (
    create_payment_entry,
)


def delete_marked_invoices():
    """
    Delete Sales Invoices that are marked as deleted.
    Runs daily at midnight.

    Condition: docstatus = 0 (Draft) AND custom_is_deleted = 1
    """
    invoices = frappe.get_all(
        "Sales Invoice",
        filters={
            "docstatus": 0,
            "custom_is_deleted": 1,
        },
        pluck="name",
    )

    for invoice_name in invoices:
        try:
            frappe.delete_doc("Sales Invoice", invoice_name, force=True)
            frappe.db.commit()
        except Exception as e:
            frappe.log_error(
                message=f"Failed to delete Sales Invoice {invoice_name}: {str(e)}",
                title="Scheduled Invoice Deletion Error",
            )

    if invoices:
        frappe.logger().info(
            f"Deleted {len(invoices)} marked-as-deleted draft invoices"
        )


def _delete_sales_invoice(invoice_name):
    try:
        frappe.delete_doc("Sales Invoice", invoice_name, force=True)
        frappe.db.commit()
    except Exception as e:
        frappe.log_error(
            message=f"Failed to delete Sales Invoice {invoice_name}: {str(e)}",
            title="Scheduled Invoice Deletion Error",
        )
    return True


def delete_stale_website_orders():
    """
    Delete stale website orders that have been in draft status for more than 20 minutes.
    Runs every 20 minutes.

    Condition: custom_order_from = "Website" AND docstatus = 0 (Draft) AND creation > 20 minutes ago
    """
    cutoff_time = now_datetime() - timedelta(minutes=20)

    invoices = frappe.get_all(
        "Sales Invoice",
        filters={
            "docstatus": 0,
            "custom_order_from": "Website",
            "creation": ["<", cutoff_time],
        },
        pluck="name",
    )

    for invoice_name in invoices:
        # if payment is done create payment entry manually
        try:
            invoice = frappe.get_doc("Sales Invoice", invoice_name)
        except Exception as e:
            frappe.log_error(
                message=f"Failed to get Sales Invoice {invoice_name}: {str(e)}",
                title="Scheduled Website Order Deletion Error",
            )
            continue

        # get payment ticket (get first record matching invoice_no)
        payment_ticket = None
        try:
            payment_ticket_names = frappe.get_all(
                "Payment Ticket",
                filters={"invoice_no": invoice_name},
                limit=1,
                pluck="name",
            )
            if payment_ticket_names:
                payment_ticket = frappe.get_doc(
                    "Payment Ticket", payment_ticket_names[0]
                )
        except Exception as e:
            frappe.log_error(
                message=f"Failed to get Payment Ticket for invoice {invoice_name}: {str(e)}",
                title="Scheduled Website Order Deletion Error",
            )

        if not payment_ticket:
            _delete_sales_invoice(invoice_name)
            continue

        # check receipt status info
        receipt_status = check_receipt(payment_ticket.ticket)

        # define required values for validation
        receipt_result = receipt_status.get("receipt", {}).get("result", "")
        success_result = receipt_status.get("success", "false")

        # check payment is successful and the receipt is approved
        if success_result != "true" or receipt_result != "a":
            _delete_sales_invoice(invoice_name)
            continue

        # validate order number
        order_number = receipt_status.get("request", {}).get("order_no")
        if order_number != invoice.name:
            _delete_sales_invoice(invoice_name)
            continue

        # submit sales invoice
        try:
            invoice.docstatus = 1
            invoice.save(ignore_permissions=True)

            # get mode of payment configured for website (get first record)
            filters = {"custom_default_website": 1}
            mode_of_payment_names = frappe.get_all(
                "Mode of Payment", filters=filters, limit=1, pluck="mode_of_payment"
            )
            mode_of_payment = (
                mode_of_payment_names[0] if len(mode_of_payment_names) > 0 else None
            )

            # if mode of payment is no configured
            if not mode_of_payment:
                msg = "No mode of payment configured for website"
                frappe.log_error("No Mode Of payment", msg)

            # create payment entry manually
            payments = [
                {
                    "mode_of_payment": mode_of_payment or "Cash",
                    "amount": invoice.grand_total,
                }
            ]

            # enqueue payment entry creation
            args = {"sales_invoice": invoice.name, "payments": payments}
            create_payment_entry(**args)

        except Exception as e:
            frappe.log_error(
                message=f"Failed to delete stale website order {invoice_name}: {str(e)}",
                title="Scheduled Website Order Deletion Error",
            )

    if invoices:
        frappe.logger().info(
            f"Deleted {len(invoices)} stale website orders older than 20 minutes"
        )
