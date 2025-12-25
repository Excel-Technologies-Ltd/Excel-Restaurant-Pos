from .get_menu_list import get_menu_list
from .test import test

__all__ = [
    "get_menu_list",
    "test",
]

menu_api_routes = {
    "api.menus.test": "excel_restaurant_pos.api.menu.test",
    "api.menus.list": "excel_restaurant_pos.api.menu.get_menu_list",
}
