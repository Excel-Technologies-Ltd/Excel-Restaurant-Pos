import frappe
from frappe import _


def rate_limit_guest(endpoint, limit=5, seconds=60):
    """
    Apply rate limiting for guest endpoints.

    Args:
        endpoint: The endpoint identifier
        limit: Maximum number of requests allowed
        seconds: Time window in seconds

    Raises:
        frappe.ValidationError: If rate limit is exceeded
    """
    key = f"guest:{endpoint}"
    cache = frappe.cache()

    # Get current count
    current_count = cache.get_value(key) or 0

    if current_count >= limit:
        frappe.throw(
            _("Too many requests. Please try again later."), exc=frappe.ValidationError
        )

    # Increment count and set expiry
    cache.set_value(key, current_count + 1, expires_in_sec=seconds)
