"""Item Price API endpoints."""

from .create_bulk_price import create_bulk_price

__all__ = ["create_bulk_price"]

item_price_api_routes = {
    "api.item_prices.create_bulk_price": "excel_restaurant_pos.api.item_price.create_bulk_price",
}
