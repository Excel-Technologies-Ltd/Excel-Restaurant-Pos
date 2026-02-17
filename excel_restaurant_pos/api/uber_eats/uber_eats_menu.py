"""Whitelisted API endpoints for Uber Eats menu management."""

import json

import frappe


@frappe.whitelist()
def get_uber_eats_menu(store_id=None):
    """Get the current menu from Uber Eats.

    Args:
        store_id: Optional store UUID, defaults to configured store
    """
    from .uber_eats_api import get_menu

    return get_menu(store_id=store_id)


@frappe.whitelist()
def upload_menu(menu_data, store_id=None):
    """Upload / replace the full menu on Uber Eats.

    Args:
        menu_data: Complete menu payload (JSON string or dict)
        store_id: Optional store UUID, defaults to configured store
    """
    if not menu_data:
        frappe.throw("menu_data is required")

    if isinstance(menu_data, str):
        menu_data = json.loads(menu_data)

    from .uber_eats_api import upsert_menu

    return upsert_menu(menu_data, store_id=store_id)


@frappe.whitelist()
def update_item(item_id, item_data, store_id=None):
    """Update a single menu item on Uber Eats.

    Use this to toggle item availability, change price, etc.

    Args:
        item_id: Uber Eats menu item UUID
        item_data: Item update payload (JSON string or dict)
        store_id: Optional store UUID, defaults to configured store
    """
    if not item_id:
        frappe.throw("item_id is required")
    if not item_data:
        frappe.throw("item_data is required")

    if isinstance(item_data, str):
        item_data = json.loads(item_data)

    from .uber_eats_api import update_menu_item

    return update_menu_item(item_id, item_data, store_id=store_id)
