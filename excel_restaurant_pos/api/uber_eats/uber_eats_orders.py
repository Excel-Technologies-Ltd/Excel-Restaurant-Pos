"""Whitelisted API endpoints for Uber Eats order management."""

import frappe


@frappe.whitelist()
def get_orders(store_id=None):
    """Get active (CREATED) orders from Uber Eats.

    Args:
        store_id: Optional store UUID, defaults to configured store
    """
    from .uber_eats_api import get_active_orders

    return get_active_orders(store_id=store_id)


@frappe.whitelist()
def get_order(order_id):
    """Get full order details from Uber Eats.

    Args:
        order_id: Uber Eats order UUID
    """
    if not order_id:
        frappe.throw("order_id is required")

    from .uber_eats_api import get_order_details

    return get_order_details(order_id)


@frappe.whitelist()
def cancel_uber_eats_order(order_id, reason="CANNOT_COMPLETE", details=""):
    """Cancel an accepted order on Uber Eats.

    Args:
        order_id: Uber Eats order UUID
        reason: Cancel reason code
        details: Human-readable explanation
    """
    if not order_id:
        frappe.throw("order_id is required")

    from .uber_eats_api import cancel_order

    cancel_order(order_id, reason=reason, details=details)
    return {"status": "cancelled", "order_id": order_id}


@frappe.whitelist()
def accept_uber_eats_order(order_id, external_reference_id=None):
    """Accept an order on Uber Eats.

    Args:
        order_id: Uber Eats order UUID
        external_reference_id: Optional POS invoice name to link back
    """
    if not order_id:
        frappe.throw("order_id is required")

    from .uber_eats_api import accept_order

    accept_order(order_id, external_reference_id=external_reference_id)
    return {"status": "accepted", "order_id": order_id}


@frappe.whitelist()
def deny_uber_eats_order(order_id, reason_code="OTHER", explanation="Order denied by restaurant"):
    """Deny/reject an order on Uber Eats.

    Args:
        order_id: Uber Eats order UUID
        reason_code: One of STORE_CLOSED, POS_NOT_READY, POS_OFFLINE,
                     ITEM_AVAILABILITY, MISSING_ITEM, MISSING_INFO,
                     PRICING, CAPACITY, ADDRESS, SPECIAL_INSTRUCTIONS, OTHER
        explanation: Human-readable denial reason
    """
    if not order_id:
        frappe.throw("order_id is required")

    from .uber_eats_api import deny_order

    deny_order(order_id, reason_code=reason_code, explanation=explanation)
    return {"status": "denied", "order_id": order_id}


@frappe.whitelist()
def update_uber_eats_order_status(order_id, status):
    """Update restaurant delivery status on Uber Eats.

    Use this to mark an order as ready for pickup by the courier.

    Args:
        order_id: Uber Eats order UUID
        status: One of PREPARING, READY_FOR_PICKUP, PICKED_UP
    """
    if not order_id:
        frappe.throw("order_id is required")
    if not status:
        frappe.throw("status is required")

    from .uber_eats_api import update_delivery_status

    update_delivery_status(order_id, status=status)
    return {"status": status, "order_id": order_id}
