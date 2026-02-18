"""Uber Eats webhook endpoint and order processing.

Receives webhook events from Uber Eats, creates Sales Invoices,
auto-accepts orders, and handles cancellation / store events.
"""

import json
from html import unescape

import frappe
from frappe.utils import now_datetime, get_time

from .uber_eats_api import (
    verify_webhook_signature,
    get_order_details,
    accept_order,
)


@frappe.whitelist(allow_guest=True)
def webhook():
    """Receive Uber Eats webhook notifications.

    Supported event types:
    - orders.notification: New order placed
    - orders.scheduled.notification: Scheduled order placed
    - orders.cancel: Order cancelled by customer/Uber
    - store.provisioned: Store linked to this app
    - store.deprovisioned: Store unlinked from this app
    """
    raw_body = frappe.request.get_data()

    print("\n\n order_payload: ",raw_body,"\n\n")

    # Verify signature
    signature = frappe.request.headers.get("X-Uber-Signature", "")
    if not verify_webhook_signature(raw_body, signature):
        frappe.log_error(
            "Uber Eats Webhook - Signature Mismatch",
            f"Received sig: {signature}\n"
            f"Body bytes ({len(raw_body)}): {raw_body[:500]}"
        )
        frappe.throw("Invalid signature", frappe.AuthenticationError)

    # Parse the event
    try:
        data = json.loads(raw_body)
    except Exception:
        frappe.log_error("Uber Eats Webhook", "Failed to parse JSON body")
        frappe.throw("Invalid JSON body")

    event_type = data.get("event_type")
    event_id = data.get("event_id")

    frappe.logger().info(f"Uber Eats webhook received: {event_type} ({event_id})")

    meta = data.get("meta", {})
    order_id = meta.get("resource_id")
    store_id = meta.get("user_id")

    if event_type in ("orders.notification", "orders.scheduled.notification"):
        _handle_order_notification(event_type, event_id, order_id, store_id)

    elif event_type == "orders.cancel":
        _handle_order_cancel(order_id)

    elif event_type == "store.provisioned":
        frappe.logger().info(
            f"Uber Eats store provisioned: store={store_id}"
        )

    elif event_type == "eats.report.success":
        _handle_report_success(data)

    elif event_type == "store.deprovisioned":
        frappe.log_error(
            "Uber Eats Store Deprovisioned",
            f"Store {store_id} was disconnected from this app",
        )

    else:
        frappe.logger().info(f"Uber Eats webhook event '{event_type}' not handled")

    return {"status": "received"}


def _handle_order_notification(event_type, event_id, order_id, store_id):
    """Handle orders.notification and orders.scheduled.notification."""
    if not order_id:
        frappe.log_error("Uber Eats Webhook", "Missing resource_id in webhook")
        return

    # Check for duplicate (idempotency using event_id)
    if frappe.db.exists(
        "Sales Invoice",
        {"remarks": ["like", f"%uber_eats_event:{event_id}%"]},
    ):
        frappe.logger().info(f"Duplicate webhook event {event_id}, skipping")
        return

    is_scheduled = event_type == "orders.scheduled.notification"

    # Process order asynchronously
    frappe.enqueue(
        process_uber_eats_order,
        queue="default",
        order_id=order_id,
        store_id=store_id,
        event_id=event_id,
        is_scheduled=is_scheduled,
    )


def _handle_order_cancel(order_id):
    """Handle orders.cancel - customer or Uber cancelled the order."""
    if not order_id:
        frappe.log_error("Uber Eats Webhook", "Missing resource_id in cancel event")
        return

    frappe.enqueue(
        _process_order_cancel,
        queue="default",
        order_id=order_id,
    )


def _process_order_cancel(order_id):
    """Background job: Mark the Sales Invoice as cancelled when Uber cancels."""
    try:
        invoice = frappe.db.get_value(
            "Sales Invoice",
            {"remarks": ["like", f"%uber_eats_order_id:{order_id}%"]},
            "name",
        )

        if not invoice:
            frappe.logger().info(
                f"Uber Eats cancel event for order {order_id} - no matching invoice found"
            )
            return

        frappe.db.set_value(
            "Sales Invoice", invoice, "custom_order_status", "Cancelled"
        )
        frappe.db.commit()
        frappe.logger().info(
            f"Uber Eats order {order_id} cancelled -> Invoice {invoice}"
        )

    except Exception as e:
        frappe.log_error(
            "Uber Eats Cancel Processing Error",
            f"Order {order_id}: {e}",
        )


def _handle_report_success(data):
    """Handle eats.report.success - report is ready for download."""
    report_type = data.get("report_type", "")
    workflow_id = data.get("job_id", "") or data.get("workflow_id", "")
    metadata = data.get("report_metadata", {})
    sections = metadata.get("sections", [])

    download_urls = []
    for section in sections:
        url = section.get("download_url", "")
        if url:
            download_urls.append(unescape(url))

    frappe.logger().info(
        f"Uber Eats report ready: type={report_type}, "
        f"workflow={workflow_id}, downloads={len(download_urls)}"
    )

    # Store the report result for retrieval via the API
    doc = frappe.new_doc("Comment")
    doc.comment_type = "Info"
    doc.reference_doctype = "ArcPOS Settings"
    doc.reference_name = "ArcPOS Settings"
    doc.content = json.dumps({
        "event": "eats.report.success",
        "report_type": report_type,
        "workflow_id": workflow_id,
        "download_urls": download_urls,
        "raw": data,
    })
    doc.save(ignore_permissions=True)
    frappe.db.commit()


def process_uber_eats_order(order_id, store_id, event_id, is_scheduled=False):
    """Background job: Fetch order details, create invoice, accept order.

    Args:
        order_id: Uber Eats order UUID
        store_id: Uber Eats store UUID
        event_id: Webhook event UUID for idempotency
        is_scheduled: True if this is a scheduled order
    """
    try:
        # Fetch full order details from Uber Eats
        order = get_order_details(order_id)

        # Get settings
        settings = frappe.get_single("ArcPOS Settings")

        # Create the Sales Invoice
        invoice = _create_sales_invoice(
            order, settings, event_id, is_scheduled=is_scheduled
        )

        # Auto-accept the order on Uber Eats
        try:
            accept_order(order_id, external_reference_id=invoice.name)
        except Exception as e:
            frappe.log_error(
                "Uber Eats Accept Error",
                f"Order {order_id}, Invoice {invoice.name}: {e}",
            )

        frappe.logger().info(
            f"Uber Eats order {order_id} processed -> Invoice {invoice.name}"
        )

    except Exception as e:
        frappe.log_error(
            "Uber Eats Order Processing Error",
            f"Order {order_id}: {e}",
        )


def _create_sales_invoice(order, settings, event_id, is_scheduled=False):
    """Create a Sales Invoice from Uber Eats order data.

    Args:
        order: Full order details from Uber Eats API
        settings: ArcPOS Settings document
        event_id: Webhook event ID for idempotency tracking
        is_scheduled: True if this is a scheduled order

    Returns:
        Saved Sales Invoice document
    """
    store = order.get("store", {})
    eater = order.get("eater", {})
    cart = order.get("cart", {})
    items = cart.get("items", [])
    payment = order.get("payment", {})

    # Determine service type from order type
    order_type = order.get("type", "DELIVERY_BY_UBER")
    if "PICKUP" in order_type.upper():
        service_type = "Pickup"
    else:
        service_type = "Delivery"

    # Build customer name
    first_name = eater.get("first_name", "")
    last_name = eater.get("last_name", "")
    customer_name = f"{first_name} {last_name}".strip() or "Uber Eats Customer"

    # Build remarks with tracking info
    remarks = (
        f"Uber Eats Order ID: {order.get('id', '')}\n"
        f"uber_eats_event:{event_id}\n"
        f"uber_eats_order_id:{order.get('id', '')}\n"
        f"Display ID: {order.get('display_id', '')}\n"
        f"Customer: {customer_name}"
    )

    # Initial status
    order_status = "Scheduled" if is_scheduled else "In kitchen"

    si = frappe.new_doc("Sales Invoice")
    si.customer = settings.uber_eats_default_customer
    si.company = settings.company
    si.naming_series = "UE-.YY.-.#####"
    si.posting_date = frappe.utils.today()
    si.posting_time = get_time(now_datetime())
    si.due_date = frappe.utils.today()
    si.remarks = remarks

    # Custom fields
    si.custom_order_from = "UberEats"
    si.custom_order_status = order_status
    si.custom_service_type = service_type
    si.custom_order_type = "Pay First"
    si.custom_customer_full_name = customer_name
    si.custom_mobile_no = eater.get("phone", {}).get("number", "")

    # Delivery address
    dropoff = order.get("dropoff", {})
    if dropoff:
        si.custom_address_line1 = dropoff.get("location", {}).get("address", "")
        si.custom_delivery_location = dropoff.get("location", {}).get("address", "")

    # Add items
    warehouse = settings.uber_eats_warehouse if settings.uber_eats_warehouse else None
    for uber_item in items:
        title = uber_item.get("title", "Uber Eats Item")
        quantity = uber_item.get("quantity", 1)
        price_info = uber_item.get("price", {})

        # Price from Uber comes in minor units (cents)
        unit_price = price_info.get("unit_price", {})
        amount = int(unit_price.get("amount", 0)) / 100.0

        # Build description with modifiers/special instructions
        desc_parts = [title]
        for modifier_group in uber_item.get("selected_modifier_groups", []):
            for modifier in modifier_group.get("selected_items", []):
                mod_title = modifier.get("title", "")
                mod_qty = modifier.get("quantity", 1)
                if mod_title:
                    desc_parts.append(f"  + {mod_title} x{mod_qty}")

        special = uber_item.get("special_instructions", "")
        if special:
            desc_parts.append(f"  Note: {special}")

        description = "\n".join(desc_parts)

        item_row = {
            "item_code": settings.uber_eats_default_item or "Uber Eats Order Item",
            "item_name": title,
            "qty": quantity,
            "rate": amount,
            "description": description,
        }
        if warehouse:
            item_row["warehouse"] = warehouse

        si.append("items", item_row)

    si.save(ignore_permissions=True)
    frappe.db.commit()

    return si
