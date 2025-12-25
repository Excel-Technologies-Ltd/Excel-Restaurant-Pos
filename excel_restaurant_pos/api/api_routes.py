# territory apies
territory_api_routes = {
    "api.territories.test": "excel_restaurant_pos.api.territory.test",
    "api.territories.default": "excel_restaurant_pos.api.territory.get_default_territory",
}

address_api_routes = {
    "api.addresses.test": "excel_restaurant_pos.api.address.test",
    "api.addresses.customer": "excel_restaurant_pos.api.address.get_customer_address",
    "api.addresses.add": "excel_restaurant_pos.api.address.add_customer_address",
}

feedback_api_routes = {
    "api.feedbacks.test": "excel_restaurant_pos.api.feedback.test",
    "api.feedbacks.get": "excel_restaurant_pos.api.feedback.get_feedback",
    "api.feedbacks.update": "excel_restaurant_pos.api.feedback.update_feedback",
}

settings_api_routes = {
    "api.settings.test": "excel_restaurant_pos.api.settings.test",
    "api.settings.get": "excel_restaurant_pos.api.settings.get_settings",
    "api.settings.get_system": "excel_restaurant_pos.api.settings.get_system_settings",
}

item_group_api_routes = {
    "api.item_groups.test": "excel_restaurant_pos.api.item_group.test",
    "api.item_groups.list": "excel_restaurant_pos.api.item_group.get_item_group_list",
}

menu_api_routes = {
    "api.menus.test": "excel_restaurant_pos.api.menu.test",
    "api.menus.list": "excel_restaurant_pos.api.menu.get_menu_list",
}

item_api_routes = {
    "api.items.test": "excel_restaurant_pos.api.item.test",
    "api.items.list": "excel_restaurant_pos.api.item.get_item_list",
    "api.items.details": "excel_restaurant_pos.api.item.get_item_details",
}

api_routes = {
    **territory_api_routes,
    **address_api_routes,
    **feedback_api_routes,
    **settings_api_routes,
    **item_group_api_routes,
    **menu_api_routes,
    **item_api_routes,
}
