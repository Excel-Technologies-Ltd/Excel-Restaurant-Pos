from .get_item_group_list import get_item_group_list
from .test import test

__all__ = [
    "get_item_group_list",
    "test",
]

item_group_api_routes = {
    "api.item_groups.test": "excel_restaurant_pos.api.item_group.test",
    "api.item_groups.list": "excel_restaurant_pos.api.item_group.get_item_group_list",
}
