from .get_kitchen_orders import get_kitchen_orders

__all__ = [
    "get_kitchen_orders",
]

kitchen_orders_api_routes = {
    "api.kitchen_orders.list": "excel_restaurant_pos.api.kitchen_orders.get_kitchen_orders",
}
