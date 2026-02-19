"""Whitelisted API endpoints for Uber Eats store management."""

import json

import frappe


@frappe.whitelist()
def clear_token_cache():
    """Clear the cached Uber Eats OAuth token to force a fresh one."""
    from .uber_eats_api import clear_token_cache as _clear_token_cache

    _clear_token_cache()
    return {"status": "ok", "message": "Token cache cleared"}


@frappe.whitelist()
def get_stores():
    """List all stores linked to this Uber Eats app."""
    from .uber_eats_api import get_stores as _get_stores

    return _get_stores()


@frappe.whitelist()
def get_store(store_id=None):
    """Get details for a specific store.

    Args:
        store_id: Optional store UUID, defaults to configured store
    """
    from .uber_eats_api import get_store_details

    return get_store_details(store_id=store_id)


@frappe.whitelist()
def get_status(store_id=None):
    """Get the online/offline status of a store.

    Args:
        store_id: Optional store UUID, defaults to configured store
    """
    from .uber_eats_api import get_store_status

    return get_store_status(store_id=store_id)


@frappe.whitelist()
def set_status(status, store_id=None):
    """Set the online/offline/paused status of a store.

    Args:
        status: One of ONLINE, OFFLINE, PAUSED
        store_id: Optional store UUID, defaults to configured store
    """
    if not status:
        frappe.throw("status is required")

    valid = ("ONLINE", "OFFLINE", "PAUSED")
    if status.upper() not in valid:
        frappe.throw(f"Invalid status '{status}'. Must be one of: {', '.join(valid)}")

    from .uber_eats_api import set_store_status

    set_store_status(status.upper(), store_id=store_id)
    return {"status": status.upper(), "message": "Store status updated"}


@frappe.whitelist()
def get_holiday_hours(store_id=None):
    """Get holiday hours configuration for a store.

    Args:
        store_id: Optional store UUID, defaults to configured store
    """
    from .uber_eats_api import get_holiday_hours as _get_holiday_hours

    return _get_holiday_hours(store_id=store_id)


@frappe.whitelist()
def set_holiday_hours(holiday_hours, store_id=None):
    """Set holiday hours for a store.

    Args:
        holiday_hours: Holiday hours payload (JSON string or dict)
        store_id: Optional store UUID, defaults to configured store
    """
    if not holiday_hours:
        frappe.throw("holiday_hours is required")

    if isinstance(holiday_hours, str):
        holiday_hours = json.loads(holiday_hours)

    from .uber_eats_api import set_holiday_hours as _set_holiday_hours

    _set_holiday_hours(holiday_hours, store_id=store_id)
    return {"status": "ok", "message": "Holiday hours updated"}
