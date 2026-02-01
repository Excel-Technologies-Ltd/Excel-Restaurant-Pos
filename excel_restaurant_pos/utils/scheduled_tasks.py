import frappe
from frappe.utils import now_datetime
from datetime import timedelta


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
        try:
            frappe.delete_doc("Sales Invoice", invoice_name, force=True)
            frappe.db.commit()
        except Exception as e:
            frappe.log_error(
                message=f"Failed to delete stale website order {invoice_name}: {str(e)}",
                title="Scheduled Website Order Deletion Error",
            )

    if invoices:
        frappe.logger().info(
            f"Deleted {len(invoices)} stale website orders older than 20 minutes"
        )
