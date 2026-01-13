"""Notification context for order closed (dine-in, takeout) emails."""

# pylint: disable=invalid-name
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

    # define the primary email
    primary_email = None

    if doc.customer == default_customer:
        primary_email = doc.custom_email_address
    else:
        primary_email = get_customer_primary_email(doc.customer)

    # Don't send notification if no primary email is found
    if not primary_email:
        raise ValueError("No primary email found - skipping notification")

    doc.custom_email_send_to = primary_email
