"""Notification context for order accepted emails."""

# pylint: disable=invalid-name
import frappe
from excel_restaurant_pos.excel_restaurant_pos.notification.utils import (
    get_customer_primary_email,
)


def customer_change_handler(doc):
    """Set the primary email recipient for order accepted (not from table) notifications.

    Args:
        context: Dictionary containing the document context
    """
    default_customer = frappe.db.get_single_value("ArcPOS Settings", "customer")

    # define the primary email
    primary_email = None

    # if bill on default customer
    if doc.customer == default_customer:
        primary_email = doc.custom_email_address
    else:
        primary_email = get_customer_primary_email(doc.customer)

    # if no primary email is found, set the custom email send to to empty string
    if not primary_email:
        msg = f"No primary email found for Sales Invoice {doc.name} (Customer: {doc.customer})"
        frappe.log_error("No Email Address", msg)
        doc.custom_email_send_to = ""
        return

    doc.custom_email_send_to = primary_email
