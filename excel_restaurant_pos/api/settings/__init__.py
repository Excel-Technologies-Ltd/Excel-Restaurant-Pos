from .get_settings import get_settings
from .get_system_settings import get_system_settings
from .system_settings import system_settings
from .test import test

__all__ = [
    "get_settings",
    "get_system_settings",
    "system_settings",
    "test",
]

settings_api_routes = {
    "api.settings.test": "excel_restaurant_pos.api.settings.test",
    "api.settings.get": "excel_restaurant_pos.api.settings.get_settings",
    "api.settings.get_system": "excel_restaurant_pos.api.settings.get_system_settings",
    "api.settings.system_settings": "excel_restaurant_pos.api.settings.system_settings",
}
