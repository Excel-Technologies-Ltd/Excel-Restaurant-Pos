from .get_tips import get_tips
from .test import test

__all__ = ["get_tips", "test"]

tips_api_routes = {
    "api.tips.test": "excel_restaurant_pos.api.tips.test",
    "api.tips.get": "excel_restaurant_pos.api.tips.get_tips",
}
