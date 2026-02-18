"""Uber Eats Marketplace API client.

Handles OAuth token management and API calls for:
- Order management (get, list, accept, deny, cancel)
- Menu management (get, upsert, update item)
- Store management (list, details, status, holiday hours)
"""

import hmac
import hashlib
import requests

import frappe
from frappe import cache

# API endpoints by environment
ENDPOINTS = {
    "Sandbox": {
        "auth": "https://sandbox-login.uber.com/oauth/v2/token",
        "api": "https://test-api.uber.com",
    },
    "Production": {
        "auth": "https://auth.uber.com/oauth/v2/token",
        "api": "https://api.uber.com",
    },
}

CACHE_KEY = "uber_eats_access_token"
TOKEN_TTL = 86400 * 25  # 25 days (token lasts 30 days, refresh early)


def get_settings():
    """Get Uber Eats settings from ArcPOS Settings."""
    settings = frappe.get_single("ArcPOS Settings")
    if not settings.uber_eats_enabled:
        frappe.throw("Uber Eats integration is not enabled")
    return settings


def clear_token_cache():
    """Clear the cached OAuth access token, forcing a fresh token on next request."""
    cache().delete_value(CACHE_KEY)


def get_access_token():
    """Get cached or fresh OAuth access token."""
    cached = cache().get_value(CACHE_KEY)
    if cached:
        return cached

    settings = get_settings()
    env = settings.uber_eats_environment or "Sandbox"
    auth_url = ENDPOINTS[env]["auth"]

    response = requests.post(
        auth_url,
        data={
            "client_id": settings.uber_eats_client_id,
            "client_secret": settings.get_password("uber_eats_client_secret"),
            "grant_type": "client_credentials",
            "scope": "eats.store eats.order eats.store.orders.read eats.store.orders.cancel eats.store.status.write eats.report eats.store.orders.restaurantdelivery.status",
        },
        timeout=30,
    )

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Auth Error",
            f"Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to get Uber Eats access token: {response.status_code} - {response.text}")

    data = response.json()
    token = data["access_token"]
    cache().set_value(CACHE_KEY, token, expires_in_sec=TOKEN_TTL)
    return token


def _get_api_base():
    """Get the API base URL based on environment setting."""
    settings = get_settings()
    env = settings.uber_eats_environment or "Sandbox"
    return ENDPOINTS[env]["api"]


def _api_headers():
    """Get headers with Bearer token for API calls."""
    return {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json",
    }


def verify_webhook_signature(raw_body, signature):
    """Verify the X-Uber-Signature HMAC-SHA256 signature.

    Args:
        raw_body: Raw request body as bytes
        signature: Value of X-Uber-Signature header

    Returns:
        True if signature is valid
    """
    if not signature:
        return False

    settings = frappe.get_single("ArcPOS Settings")
    secret = settings.get_password("uber_eats_signing_key")
    expected = hmac.new(
        secret.encode("utf-8"),
        raw_body if isinstance(raw_body, bytes) else raw_body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


def get_order_details(order_id):
    """Fetch full order details from Uber Eats.

    Args:
        order_id: Uber Eats order UUID

    Returns:
        Order details dict
    """
    base = _get_api_base()
    url = f"{base}/v2/eats/order/{order_id}"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Order Error",
            f"Order: {order_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch Uber Eats order {order_id}: {response.status_code} - {response.text}")

    return response.json()


def accept_order(order_id, external_reference_id=None):
    """Accept an order on Uber Eats.

    Args:
        order_id: Uber Eats order UUID
        external_reference_id: POS invoice name to link back
    """
    base = _get_api_base()
    url = f"{base}/v1/eats/orders/{order_id}/accept_pos_order"

    payload = {
        "reason": "Accepted by ArcPOS",
    }
    if external_reference_id:
        payload["external_reference_id"] = external_reference_id

    response = requests.post(
        url, json=payload, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Accept Order Error",
            f"Order: {order_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to accept Uber Eats order {order_id}: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats order {order_id} accepted successfully")


def deny_order(order_id, reason_code="OTHER", explanation="Order denied by restaurant"):
    """Deny an order on Uber Eats.

    Args:
        order_id: Uber Eats order UUID
        reason_code: One of STORE_CLOSED, POS_NOT_READY, POS_OFFLINE,
                     ITEM_AVAILABILITY, MISSING_ITEM, MISSING_INFO,
                     PRICING, CAPACITY, ADDRESS, SPECIAL_INSTRUCTIONS, OTHER
        explanation: Human-readable denial reason
    """
    base = _get_api_base()
    url = f"{base}/v1/eats/orders/{order_id}/deny_pos_order"

    payload = {
        "reason": {
            "explanation": explanation,
            "code": reason_code,
        }
    }

    response = requests.post(
        url, json=payload, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Deny Order Error",
            f"Order: {order_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to deny Uber Eats order {order_id}: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats order {order_id} denied: {reason_code}")


def _default_store_id(store_id=None):
    """Return store_id or fall back to the configured default."""
    if store_id:
        return store_id
    settings = get_settings()
    sid = settings.uber_eats_store_id
    if not sid:
        frappe.throw("No Uber Eats store ID configured in ArcPOS Settings")
    return sid


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

def get_active_orders(store_id=None):
    """Get orders in CREATED state for a store.

    Args:
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        List of created order summaries
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/stores/{store_id}/created-orders"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Active Orders Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch active orders from Uber Eats: {response.status_code} - {response.text}")

    return response.json()


def get_canceled_orders(store_id=None):
    """Get canceled orders for a store from Uber Eats.

    Args:
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        List of canceled order summaries
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/stores/{store_id}/canceled-orders"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Canceled Orders Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch canceled orders from Uber Eats: {response.status_code} - {response.text}")

    return response.json()


def cancel_order(order_id, reason="OTHER", details=""):
    """Cancel an already-accepted order on Uber Eats.

    Args:
        order_id: Uber Eats order UUID
        reason: Cancel reason code
        details: Human-readable explanation
    """
    base = _get_api_base()
    url = f"{base}/v1/eats/orders/{order_id}/cancel"

    payload = {"reason": reason}
    if details:
        payload["details"] = details

    response = requests.post(
        url, json=payload, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Cancel Order Error",
            f"Order: {order_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to cancel Uber Eats order {order_id}: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats order {order_id} cancelled: {reason}")


def update_delivery_status(order_id, status="READY_FOR_PICKUP"):
    """Update the restaurant delivery status for an order.

    Args:
        order_id: Uber Eats order UUID
        status: One of PREPARING, READY_FOR_PICKUP, PICKED_UP
    """
    base = _get_api_base()
    url = f"{base}/v1/eats/orders/{order_id}/restaurantdelivery/status"

    payload = {"status": status}

    response = requests.post(
        url, json=payload, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Update Delivery Status Error",
            f"Order: {order_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to update delivery status for order {order_id}: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats order {order_id} delivery status set to {status}")


# ---------------------------------------------------------------------------
# Menu
# ---------------------------------------------------------------------------

def get_menu(store_id=None):
    """Get the current menu for a store.

    Args:
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        Menu data dict
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v2/eats/stores/{store_id}/menus"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Menu Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch menu from Uber Eats: {response.status_code} - {response.text}")

    return response.json()


def upsert_menu(menu_data, store_id=None):
    """Upload / replace the full menu for a store.

    Args:
        menu_data: Complete menu payload (dict)
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        API response dict
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v2/eats/stores/{store_id}/menus"

    response = requests.put(
        url, json=menu_data, headers=_api_headers(), timeout=60
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Upsert Menu Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to upsert menu on Uber Eats: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats menu upserted for store {store_id}")
    return response.json() if response.content else {"status": "ok"}


def update_menu_item(item_id, item_data, store_id=None):
    """Update a single menu item (e.g. availability, price).

    Args:
        item_id: Uber Eats menu item UUID
        item_data: Item update payload (dict)
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        API response dict
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v2/eats/stores/{store_id}/menus/items/{item_id}"

    response = requests.post(
        url, json=item_data, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Update Menu Item Error",
            f"Store: {store_id}, Item: {item_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to update menu item {item_id} on Uber Eats: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats menu item {item_id} updated for store {store_id}")
    return response.json() if response.content else {"status": "ok"}


# ---------------------------------------------------------------------------
# Store
# ---------------------------------------------------------------------------

def get_stores():
    """List all stores linked to this app.

    Returns:
        List of store summaries
    """
    base = _get_api_base()
    url = f"{base}/v1/eats/stores"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Stores Error",
            f"Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch stores from Uber Eats: {response.status_code} - {response.text}")

    return response.json()


def get_store_details(store_id=None):
    """Get details for a specific store.

    Args:
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        Store details dict
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/stores/{store_id}"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Store Details Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch store details for {store_id}: {response.status_code} - {response.text}")

    return response.json()


def get_store_status(store_id=None):
    """Get the online/offline status of a store.

    Args:
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        Store status dict
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/store/{store_id}/status"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Store Status Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch store status for {store_id}: {response.status_code} - {response.text}")

    return response.json()


def set_store_status(status, store_id=None):
    """Set the online/offline/paused status of a store.

    Args:
        status: One of ONLINE, OFFLINE, PAUSED
        store_id: Uber Eats store UUID (defaults to settings)
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/store/{store_id}/status"

    payload = {"status": status}

    response = requests.post(
        url, json=payload, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Set Store Status Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to set store status for {store_id}: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats store {store_id} status set to {status}")


def get_holiday_hours(store_id=None):
    """Get holiday hours configuration for a store.

    Args:
        store_id: Uber Eats store UUID (defaults to settings)

    Returns:
        Holiday hours dict
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/stores/{store_id}/holiday-hours"

    response = requests.get(url, headers=_api_headers(), timeout=30)

    if response.status_code != 200:
        frappe.log_error(
            "Uber Eats Get Holiday Hours Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to fetch holiday hours for {store_id}: {response.status_code} - {response.text}")

    return response.json()


def set_holiday_hours(holiday_hours, store_id=None):
    """Set holiday hours for a store.

    Args:
        holiday_hours: Holiday hours payload (dict)
        store_id: Uber Eats store UUID (defaults to settings)
    """
    store_id = _default_store_id(store_id)
    base = _get_api_base()
    url = f"{base}/v1/eats/stores/{store_id}/holiday-hours"

    response = requests.post(
        url, json=holiday_hours, headers=_api_headers(), timeout=30
    )

    if response.status_code not in (200, 204):
        frappe.log_error(
            "Uber Eats Set Holiday Hours Error",
            f"Store: {store_id}, Status: {response.status_code}, Body: {response.text}",
        )
        frappe.throw(f"Failed to set holiday hours for {store_id}: {response.status_code} - {response.text}")

    frappe.logger().info(f"Uber Eats holiday hours updated for store {store_id}")
