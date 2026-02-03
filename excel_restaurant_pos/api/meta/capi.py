"""
Meta Conversions API (CAPI) Implementation for tracking e-commerce events.

This module provides endpoints to send server-side events to Meta (Facebook)
for better tracking and attribution of e-commerce activities.

Events supported:
- AddToCart: When a user adds an item to cart
- ViewContent: When a user views a product
- Search: When a user searches for products
- Purchase: When a user completes a purchase
- InitiateCheckout: When a user starts checkout
- AddPaymentInfo: When a user adds payment information
"""

import frappe
from frappe import _
import hashlib
import time
import requests
import json


def get_meta_settings():
    """
    Get Meta CAPI settings from ArcPOS Settings.
    Returns pixel_id and access_token.
    """
    if not frappe.db.exists("ArcPOS Settings", "ArcPOS Settings"):
        return None, None

    settings = frappe.get_doc("ArcPOS Settings", "ArcPOS Settings")

    pixel_id = settings.get("pixel_id")
    access_token = settings.get("capi_access_token")

    return pixel_id, access_token


def hash_user_data(value):
    """
    Hash user data using SHA256 as required by Meta CAPI.
    """
    if not value:
        return None
    return hashlib.sha256(str(value).lower().strip().encode()).hexdigest()


def get_client_ip():
    """Get client IP address from request."""
    return frappe.local.request.remote_addr if frappe.local.request else None


def get_user_agent():
    """Get user agent from request."""
    if frappe.local.request:
        return frappe.local.request.headers.get("User-Agent")
    return None


def build_user_data(email=None, phone=None, first_name=None, last_name=None,
                    city=None, state=None, country=None, zip_code=None,
                    external_id=None, fbp=None, fbc=None):
    """
    Build user_data object for Meta CAPI with properly hashed values.

    Args:
        email: User's email address
        phone: User's phone number
        first_name: User's first name
        last_name: User's last name
        city: User's city
        state: User's state/region
        country: User's country (2-letter ISO code)
        zip_code: User's zip/postal code
        external_id: Your internal user ID
        fbp: Facebook browser pixel cookie (_fbp)
        fbc: Facebook click ID cookie (_fbc)

    Returns:
        dict: Properly formatted user_data for Meta CAPI
    """
    user_data = {}

    # Hash PII data
    if email:
        user_data["em"] = [hash_user_data(email)]
    if phone:
        # Remove non-numeric characters and hash
        clean_phone = "".join(filter(str.isdigit, str(phone)))
        user_data["ph"] = [hash_user_data(clean_phone)]
    if first_name:
        user_data["fn"] = [hash_user_data(first_name)]
    if last_name:
        user_data["ln"] = [hash_user_data(last_name)]
    if city:
        user_data["ct"] = [hash_user_data(city)]
    if state:
        user_data["st"] = [hash_user_data(state)]
    if country:
        user_data["country"] = [hash_user_data(country)]
    if zip_code:
        user_data["zp"] = [hash_user_data(zip_code)]
    if external_id:
        user_data["external_id"] = [hash_user_data(external_id)]

    # Non-hashed data
    if fbp:
        user_data["fbp"] = fbp
    if fbc:
        user_data["fbc"] = fbc

    # Add client info
    client_ip = get_client_ip()
    user_agent = get_user_agent()

    if client_ip:
        user_data["client_ip_address"] = client_ip
    if user_agent:
        user_data["client_user_agent"] = user_agent

    return user_data


def send_event_to_meta(event_name, event_data, user_data, custom_data=None,
                       event_source_url=None, event_id=None, test_event_code=None):
    """
    Send an event to Meta Conversions API.

    Args:
        event_name: Name of the event (e.g., "AddToCart", "Purchase")
        event_data: Additional event data
        user_data: User identification data (hashed)
        custom_data: Custom data specific to the event
        event_source_url: URL where the event occurred
        event_id: Unique event ID for deduplication
        test_event_code: Test event code for testing (from Events Manager)

    Returns:
        dict: Response from Meta API
    """
    pixel_id, access_token = get_meta_settings()

    if not pixel_id or not access_token:
        return {
            "success": False,
            "error": "Meta Pixel ID or Access Token not configured in ArcPOS Settings"
        }

    # Build the event payload
    event = {
        "event_name": event_name,
        "event_time": int(time.time()),
        "action_source": "website",
        "user_data": user_data,
    }

    if custom_data:
        event["custom_data"] = custom_data

    if event_source_url:
        event["event_source_url"] = event_source_url

    if event_id:
        event["event_id"] = event_id

    # Build request payload
    payload = {
        "data": [event],
        "access_token": access_token,
    }

    if test_event_code:
        payload["test_event_code"] = test_event_code

    # Send to Meta API
    url = f"https://graph.facebook.com/v18.0/{pixel_id}/events"

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=30
        )

        result = response.json()

        if response.status_code == 200:
            # Log successful event
            frappe.logger("meta_capi").info(
                f"Meta CAPI Event sent: {event_name}, Response: {result}"
            )
            return {
                "success": True,
                "event_name": event_name,
                "events_received": result.get("events_received", 0),
                "messages": result.get("messages", []),
                "fbtrace_id": result.get("fbtrace_id")
            }
        else:
            # Log error
            frappe.log_error(
                message=f"Event: {event_name}\nPayload: {json.dumps(event)}\nResponse: {json.dumps(result)}",
                title="Meta CAPI Error"
            )
            return {
                "success": False,
                "error": result.get("error", {}).get("message", "Unknown error"),
                "error_code": result.get("error", {}).get("code")
            }

    except requests.exceptions.Timeout:
        frappe.log_error(
            message=f"Timeout sending {event_name} event to Meta CAPI",
            title="Meta CAPI Timeout"
        )
        return {"success": False, "error": "Request timeout"}

    except Exception as e:
        frappe.log_error(
            message=f"Error sending {event_name} event: {str(e)}",
            title="Meta CAPI Error"
        )
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=True)
def track_view_content():
    """
    Track ViewContent event when a user views a product.

    Required parameters:
    - content_id: Product/Item ID
    - content_name: Product name

    Optional parameters:
    - content_type: Type of content (default: "product")
    - content_category: Product category
    - value: Product price
    - currency: Currency code (default: from settings or "USD")
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    content_id = frappe.form_dict.get("content_id")
    content_name = frappe.form_dict.get("content_name")
    content_type = frappe.form_dict.get("content_type", "product")
    content_category = frappe.form_dict.get("content_category")
    value = frappe.form_dict.get("value")
    currency = frappe.form_dict.get("currency")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Validate required parameters
    if not content_id:
        frappe.throw(_("content_id is required"))

    # Get default currency if not provided
    if not currency:
        currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "content_ids": [str(content_id)],
        "content_type": content_type,
    }

    if content_name:
        custom_data["content_name"] = content_name
    if content_category:
        custom_data["content_category"] = content_category
    if value:
        custom_data["value"] = float(value)
        custom_data["currency"] = currency

    # Send event
    result = send_event_to_meta(
        event_name="ViewContent",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_add_to_cart():
    """
    Track AddToCart event when a user adds an item to cart.

    Required parameters:
    - content_id: Product/Item ID
    - value: Cart value/price
    - currency: Currency code

    Optional parameters:
    - content_name: Product name
    - content_type: Type of content (default: "product")
    - content_category: Product category
    - quantity: Number of items added
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    content_id = frappe.form_dict.get("content_id")
    content_name = frappe.form_dict.get("content_name")
    content_type = frappe.form_dict.get("content_type", "product")
    content_category = frappe.form_dict.get("content_category")
    value = frappe.form_dict.get("value")
    currency = frappe.form_dict.get("currency")
    quantity = frappe.form_dict.get("quantity", 1)

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Validate required parameters
    if not content_id:
        frappe.throw(_("content_id is required"))

    # Get default currency if not provided
    if not currency:
        currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "content_ids": [str(content_id)],
        "content_type": content_type,
        "currency": currency,
    }

    if content_name:
        custom_data["content_name"] = content_name
    if content_category:
        custom_data["content_category"] = content_category
    if value:
        custom_data["value"] = float(value)
    if quantity:
        custom_data["num_items"] = int(quantity)

    # Build contents array
    custom_data["contents"] = [{
        "id": str(content_id),
        "quantity": int(quantity),
    }]

    if value and quantity:
        custom_data["contents"][0]["item_price"] = float(value) / int(quantity)

    # Send event
    result = send_event_to_meta(
        event_name="AddToCart",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_search():
    """
    Track Search event when a user searches for products.

    Required parameters:
    - search_string: The search query

    Optional parameters:
    - content_ids: JSON array of product IDs in search results
    - content_category: Category being searched
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    search_string = frappe.form_dict.get("search_string")
    content_ids = frappe.form_dict.get("content_ids")
    content_category = frappe.form_dict.get("content_category")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Validate required parameters
    if not search_string:
        frappe.throw(_("search_string is required"))

    # Parse content_ids if string
    if content_ids and isinstance(content_ids, str):
        content_ids = frappe.parse_json(content_ids)

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "search_string": search_string,
    }

    if content_ids and isinstance(content_ids, list):
        custom_data["content_ids"] = [str(cid) for cid in content_ids]
        custom_data["content_type"] = "product"

    if content_category:
        custom_data["content_category"] = content_category

    # Send event
    result = send_event_to_meta(
        event_name="Search",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_purchase():
    """
    Track Purchase event when a user completes a purchase.

    Required parameters:
    - value: Total purchase value
    - currency: Currency code
    - content_ids: JSON array of product IDs purchased

    Optional parameters:
    - contents: JSON array of {id, quantity, item_price} objects
    - content_type: Type of content (default: "product")
    - order_id: Your order/invoice ID
    - num_items: Total number of items
    - email: User's email for matching
    - phone: User's phone for matching
    - first_name: User's first name
    - last_name: User's last name
    - city: User's city
    - state: User's state
    - country: User's country code
    - zip_code: User's zip code
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    value = frappe.form_dict.get("value")
    currency = frappe.form_dict.get("currency")
    content_ids = frappe.form_dict.get("content_ids")
    contents = frappe.form_dict.get("contents")
    content_type = frappe.form_dict.get("content_type", "product")
    order_id = frappe.form_dict.get("order_id")
    num_items = frappe.form_dict.get("num_items")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    first_name = frappe.form_dict.get("first_name")
    last_name = frappe.form_dict.get("last_name")
    city = frappe.form_dict.get("city")
    state = frappe.form_dict.get("state")
    country = frappe.form_dict.get("country")
    zip_code = frappe.form_dict.get("zip_code")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Validate required parameters
    if not value:
        frappe.throw(_("value is required"))

    # Get default currency if not provided
    if not currency:
        currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

    # Parse JSON parameters
    if content_ids and isinstance(content_ids, str):
        content_ids = frappe.parse_json(content_ids)

    if contents and isinstance(contents, str):
        contents = frappe.parse_json(contents)

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        first_name=first_name,
        last_name=last_name,
        city=city,
        state=state,
        country=country,
        zip_code=zip_code,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "value": float(value),
        "currency": currency,
        "content_type": content_type,
    }

    if content_ids and isinstance(content_ids, list):
        custom_data["content_ids"] = [str(cid) for cid in content_ids]

    if contents and isinstance(contents, list):
        custom_data["contents"] = contents

    if order_id:
        custom_data["order_id"] = str(order_id)

    if num_items:
        custom_data["num_items"] = int(num_items)

    # Send event
    result = send_event_to_meta(
        event_name="Purchase",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id or order_id,  # Use order_id as event_id for deduplication
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_initiate_checkout():
    """
    Track InitiateCheckout event when a user starts the checkout process.

    Required parameters:
    - value: Cart value
    - currency: Currency code

    Optional parameters:
    - content_ids: JSON array of product IDs in cart
    - contents: JSON array of {id, quantity, item_price} objects
    - content_type: Type of content (default: "product")
    - num_items: Total number of items
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    value = frappe.form_dict.get("value")
    currency = frappe.form_dict.get("currency")
    content_ids = frappe.form_dict.get("content_ids")
    contents = frappe.form_dict.get("contents")
    content_type = frappe.form_dict.get("content_type", "product")
    num_items = frappe.form_dict.get("num_items")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Get default currency if not provided
    if not currency:
        currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

    # Parse JSON parameters
    if content_ids and isinstance(content_ids, str):
        content_ids = frappe.parse_json(content_ids)

    if contents and isinstance(contents, str):
        contents = frappe.parse_json(contents)

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "content_type": content_type,
        "currency": currency,
    }

    if value:
        custom_data["value"] = float(value)

    if content_ids and isinstance(content_ids, list):
        custom_data["content_ids"] = [str(cid) for cid in content_ids]

    if contents and isinstance(contents, list):
        custom_data["contents"] = contents

    if num_items:
        custom_data["num_items"] = int(num_items)

    # Send event
    result = send_event_to_meta(
        event_name="InitiateCheckout",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_add_payment_info():
    """
    Track AddPaymentInfo event when a user adds payment information.

    Optional parameters:
    - value: Cart value
    - currency: Currency code
    - content_ids: JSON array of product IDs
    - content_type: Type of content (default: "product")
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    value = frappe.form_dict.get("value")
    currency = frappe.form_dict.get("currency")
    content_ids = frappe.form_dict.get("content_ids")
    content_type = frappe.form_dict.get("content_type", "product")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Get default currency if not provided
    if not currency:
        currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

    # Parse JSON parameters
    if content_ids and isinstance(content_ids, str):
        content_ids = frappe.parse_json(content_ids)

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "content_type": content_type,
        "currency": currency,
    }

    if value:
        custom_data["value"] = float(value)

    if content_ids and isinstance(content_ids, list):
        custom_data["content_ids"] = [str(cid) for cid in content_ids]

    # Send event
    result = send_event_to_meta(
        event_name="AddPaymentInfo",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_add_to_wishlist():
    """
    Track AddToWishlist event when a user adds an item to wishlist.

    Required parameters:
    - content_id: Product/Item ID

    Optional parameters:
    - content_name: Product name
    - content_type: Type of content (default: "product")
    - content_category: Product category
    - value: Product price
    - currency: Currency code
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    content_id = frappe.form_dict.get("content_id")
    content_name = frappe.form_dict.get("content_name")
    content_type = frappe.form_dict.get("content_type", "product")
    content_category = frappe.form_dict.get("content_category")
    value = frappe.form_dict.get("value")
    currency = frappe.form_dict.get("currency")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Validate required parameters
    if not content_id:
        frappe.throw(_("content_id is required"))

    # Get default currency if not provided
    if not currency:
        currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {
        "content_ids": [str(content_id)],
        "content_type": content_type,
        "currency": currency,
    }

    if content_name:
        custom_data["content_name"] = content_name
    if content_category:
        custom_data["content_category"] = content_category
    if value:
        custom_data["value"] = float(value)

    # Send event
    result = send_event_to_meta(
        event_name="AddToWishlist",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_find_location():
    """
    Track FindLocation event when a user searches for store locations.

    Optional parameters:
    - search_string: Location search query
    - city: City being searched
    - state: State/region being searched
    - country: Country being searched
    - zip_code: Zip/postal code being searched
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    search_string = frappe.form_dict.get("search_string")
    search_city = frappe.form_dict.get("city")
    search_state = frappe.form_dict.get("state")
    search_country = frappe.form_dict.get("country")
    search_zip = frappe.form_dict.get("zip_code")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Build custom data
    custom_data = {}

    if search_string:
        custom_data["search_string"] = search_string
    if search_city:
        custom_data["city"] = search_city
    if search_state:
        custom_data["state"] = search_state
    if search_country:
        custom_data["country"] = search_country
    if search_zip:
        custom_data["zip"] = search_zip

    # Send event
    result = send_event_to_meta(
        event_name="FindLocation",
        event_data={},
        user_data=user_data,
        custom_data=custom_data,
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result


@frappe.whitelist(allow_guest=True)
def track_custom_event():
    """
    Track a custom event with Meta CAPI.

    Required parameters:
    - event_name: Name of the custom event

    Optional parameters:
    - custom_data: JSON object with custom data
    - email: User's email for matching
    - phone: User's phone for matching
    - external_id: Your internal user ID
    - fbp: Facebook browser pixel cookie
    - fbc: Facebook click ID cookie
    - event_source_url: URL where event occurred
    - event_id: Unique event ID for deduplication
    - test_event_code: Test event code for testing
    """
    # Get parameters
    event_name = frappe.form_dict.get("event_name")
    custom_data = frappe.form_dict.get("custom_data")

    # User data parameters
    email = frappe.form_dict.get("email")
    phone = frappe.form_dict.get("phone")
    external_id = frappe.form_dict.get("external_id")
    fbp = frappe.form_dict.get("fbp")
    fbc = frappe.form_dict.get("fbc")

    # Event parameters
    event_source_url = frappe.form_dict.get("event_source_url")
    event_id = frappe.form_dict.get("event_id")
    test_event_code = frappe.form_dict.get("test_event_code")

    # Validate required parameters
    if not event_name:
        frappe.throw(_("event_name is required"))

    # Parse custom_data if string
    if custom_data and isinstance(custom_data, str):
        custom_data = frappe.parse_json(custom_data)

    # Build user data
    user_data = build_user_data(
        email=email,
        phone=phone,
        external_id=external_id,
        fbp=fbp,
        fbc=fbc
    )

    # Send event
    result = send_event_to_meta(
        event_name=event_name,
        event_data={},
        user_data=user_data,
        custom_data=custom_data or {},
        event_source_url=event_source_url,
        event_id=event_id,
        test_event_code=test_event_code
    )

    return result
