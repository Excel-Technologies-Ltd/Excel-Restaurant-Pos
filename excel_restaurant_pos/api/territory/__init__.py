from .get_default_territory import get_default_territory
from .test import test

__all__ = [
    "get_default_territory",
    "test",
]

territory_api_routes = {
    "api.territories.test": "excel_restaurant_pos.api.territory.test",
    "api.territories.default": "excel_restaurant_pos.api.territory.get_default_territory",
}
