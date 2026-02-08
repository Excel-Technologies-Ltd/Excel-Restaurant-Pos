from .capi import (
    track_view_content,
    track_add_to_cart,
    track_search,
    track_purchase,
    track_initiate_checkout,
    track_add_payment_info,
    track_add_to_wishlist,
    track_find_location,
    track_custom_event,
)

from .catalog import (
    create_catalog_item_api,
    update_catalog_item_api,
    delete_catalog_item_api,
)

__all__ = [
    "track_view_content",
    "track_add_to_cart",
    "track_search",
    "track_purchase",
    "track_initiate_checkout",
    "track_add_payment_info",
    "track_add_to_wishlist",
    "track_find_location",
    "track_custom_event",
    "create_catalog_item_api",
    "update_catalog_item_api",
    "delete_catalog_item_api",
]

meta_api_routes = {
    "api.meta.view_content": "excel_restaurant_pos.api.meta.capi.track_view_content",
    "api.meta.add_to_cart": "excel_restaurant_pos.api.meta.capi.track_add_to_cart",
    "api.meta.search": "excel_restaurant_pos.api.meta.capi.track_search",
    "api.meta.purchase": "excel_restaurant_pos.api.meta.capi.track_purchase",
    "api.meta.initiate_checkout": "excel_restaurant_pos.api.meta.capi.track_initiate_checkout",
    "api.meta.add_payment_info": "excel_restaurant_pos.api.meta.capi.track_add_payment_info",
    "api.meta.add_to_wishlist": "excel_restaurant_pos.api.meta.capi.track_add_to_wishlist",
    "api.meta.find_location": "excel_restaurant_pos.api.meta.capi.track_find_location",
    "api.meta.custom_event": "excel_restaurant_pos.api.meta.capi.track_custom_event",
    "api.meta.create_catalog_item": "excel_restaurant_pos.api.meta.create_catalog_item_api",
    "api.meta.update_catalog_item": "excel_restaurant_pos.api.meta.update_catalog_item_api",
    "api.meta.delete_catalog_item": "excel_restaurant_pos.api.meta.delete_catalog_item_api",
}
