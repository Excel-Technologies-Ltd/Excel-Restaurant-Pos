from .tips import tips_api_routes
from .address import address_api_routes
from .feedback import feedback_api_routes
from .item import item_api_routes
from .item_group import item_group_api_routes
from .menu import menu_api_routes
from .sales_invoice import sales_invoice_api_routes
from .settings import settings_api_routes
from .territory import territory_api_routes
from .file import file_api_routes


api_routes = {
    **tips_api_routes,
    **address_api_routes,
    **feedback_api_routes,
    **item_api_routes,
    **item_group_api_routes,
    **menu_api_routes,
    **sales_invoice_api_routes,
    **settings_api_routes,
    **territory_api_routes,
    **file_api_routes,
}
