"""Customer API endpoints."""

from .create_customer import create_customer

__all__ = [
    "create_customer",
]

customer_api_routes = {
    "api.customers.create": "excel_restaurant_pos.api.customer.create_customer",
}
