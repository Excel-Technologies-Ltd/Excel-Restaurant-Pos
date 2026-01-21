from .get_item_list import get_item_list
from .get_item_details import get_item_details
from .most_sold_item import get_most_sold_item
from .item import *
from .test import test

__all__ = [
    "get_item_list",
    "get_item_details",
    "get_most_sold_item",
    "test",
]

item_api_routes = {
    "api.items.test": "excel_restaurant_pos.api.item.test",
    "api.items.list": "excel_restaurant_pos.api.item.get_item_list",
    "api.items.details": "excel_restaurant_pos.api.item.get_item_details",
    "api.items.most_sold": "excel_restaurant_pos.api.item.get_most_sold_item",
}
