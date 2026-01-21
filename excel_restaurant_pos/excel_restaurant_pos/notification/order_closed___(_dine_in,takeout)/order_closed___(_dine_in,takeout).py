"""Notification context for order closed (dine-in, takeout) emails."""

import frappe

from excel_restaurant_pos.excel_restaurant_pos.notification.utils import (
    get_customer_primary_email,
)


def get_context(context):
    """Set the primary email recipient for order closed notifications.

    Args:
        context: Dictionary containing the document context
    """
    doc = context.get("doc")
    default_customer = frappe.db.get_single_value("ArcPOS Settings", "customer")

    # Get feedback document by sales_invoice_no
    feedback_name = frappe.db.get_value(
        "ArcPOS Feedback", {"sales_invoice_no": doc.name}, "name"
    )

    if feedback_name:
        doc.feedback_name = feedback_name

    # define the primary email
    primary_email = None

    if doc.customer == default_customer:
        primary_email = doc.custom_email_address
    else:
        primary_email = get_customer_primary_email(doc.customer)

    # Don't send notification if no primary email is found
    if not primary_email:
        frappe.log_error(
            message=f"No primary email found for Sales Invoice {doc.name} (Customer: {doc.customer}) - skipping notification",
            title="Notification Skipped: No Email Address",
        )
        # Set empty string to prevent notification from being sent
        doc.custom_email_send_to = ""
        return

    doc.custom_email_send_to = primary_email
