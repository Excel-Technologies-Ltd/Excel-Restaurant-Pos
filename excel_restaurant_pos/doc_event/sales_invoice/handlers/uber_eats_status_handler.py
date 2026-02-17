"""Handler for syncing order status changes to Uber Eats API.

When a Sales Invoice with custom_order_from='UberEats' has its
custom_order_status changed, this handler calls the appropriate
Uber Eats API endpoint.
"""

import re

import frappe
from excel_restaurant_pos.api.uber_eats.uber_eats_api import deny_order


def _extract_uber_eats_order_id(remarks):
    """Extract Uber Eats order ID from invoice remarks.

    Args:
        remarks: Sales Invoice remarks field

    Returns:
        Uber Eats order UUID or None
    """
    if not remarks:
        return None

    match = re.search(r"uber_eats_order_id:([a-f0-9-]+)", remarks)
    return match.group(1) if match else None


def uber_eats_status_handler(invoice_name):
    """Sync order status change to Uber Eats.

    Called as a background job when custom_order_status changes
    on an UberEats order.

    Args:
        invoice_name: Name of the Sales Invoice
    """
    invoice = frappe.get_doc("Sales Invoice", invoice_name)

    # Only handle UberEats orders
    if invoice.custom_order_from != "UberEats":
        return

    order_id = _extract_uber_eats_order_id(invoice.remarks)
    if not order_id:
        frappe.log_error(
            "Uber Eats Status Sync",
            f"Could not find Uber Eats order ID in invoice {invoice_name}",
        )
        return

    order_status = (invoice.custom_order_status or "").lower()

    try:
        if order_status == "rejected":
            deny_order(
                order_id,
                reason_code="CAPACITY",
                explanation="Order rejected by restaurant",
            )
            frappe.logger().info(
                f"Uber Eats order {order_id} denied (invoice {invoice_name})"
            )
        else:
            frappe.logger().info(
                f"Uber Eats status '{order_status}' for order {order_id} - no API action needed"
            )

    except Exception as e:
        frappe.log_error(
            "Uber Eats Status Sync Error",
            f"Order {order_id}, Invoice {invoice_name}, Status {order_status}: {e}",
        )
