from .uber_eats import webhook
from .uber_eats_orders import (
    get_orders,
    get_order,
    cancel_uber_eats_order,
    accept_uber_eats_order,
    deny_uber_eats_order,
    update_uber_eats_order_status,
)
from .uber_eats_menu import get_uber_eats_menu, upload_menu, update_item
from .uber_eats_store import (
    get_stores,
    get_store,
    get_status,
    set_status,
    get_holiday_hours,
    set_holiday_hours,
)

__all__ = [
    "webhook",
    "get_orders",
    "get_order",
    "cancel_uber_eats_order",
    "accept_uber_eats_order",
    "deny_uber_eats_order",
    "update_uber_eats_order_status",
    "get_uber_eats_menu",
    "upload_menu",
    "update_item",
    "get_stores",
    "get_store",
    "get_status",
    "set_status",
    "get_holiday_hours",
    "set_holiday_hours",
]

_base = "excel_restaurant_pos.api.uber_eats"

uber_eats_api_routes = {
    # Webhook
    "api.uber_eats.webhook": f"{_base}.uber_eats.webhook",
    # Orders
    "api.uber_eats.orders": f"{_base}.uber_eats_orders.get_orders",
    "api.uber_eats.order": f"{_base}.uber_eats_orders.get_order",
    "api.uber_eats.cancel_order": f"{_base}.uber_eats_orders.cancel_uber_eats_order",
    "api.uber_eats.accept_order": f"{_base}.uber_eats_orders.accept_uber_eats_order",
    "api.uber_eats.deny_order": f"{_base}.uber_eats_orders.deny_uber_eats_order",
    "api.uber_eats.update_order_status": f"{_base}.uber_eats_orders.update_uber_eats_order_status",
    # Menu
    "api.uber_eats.menu": f"{_base}.uber_eats_menu.get_uber_eats_menu",
    "api.uber_eats.upload_menu": f"{_base}.uber_eats_menu.upload_menu",
    "api.uber_eats.update_item": f"{_base}.uber_eats_menu.update_item",
    # Store
    "api.uber_eats.stores": f"{_base}.uber_eats_store.get_stores",
    "api.uber_eats.store": f"{_base}.uber_eats_store.get_store",
    "api.uber_eats.store_status": f"{_base}.uber_eats_store.get_status",
    "api.uber_eats.set_store_status": f"{_base}.uber_eats_store.set_status",
    "api.uber_eats.holiday_hours": f"{_base}.uber_eats_store.get_holiday_hours",
    "api.uber_eats.set_holiday_hours": f"{_base}.uber_eats_store.set_holiday_hours",
}
