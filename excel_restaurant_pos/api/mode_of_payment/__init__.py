from .mode_of_paymet_list import get_mode_of_payment_list

__all__ = [
    "get_mode_of_payment_list",
]

mode_of_payment_api_routes = {
    "api.mode_of_payments.list": "excel_restaurant_pos.api.mode_of_payment.get_mode_of_payment_list",
}
