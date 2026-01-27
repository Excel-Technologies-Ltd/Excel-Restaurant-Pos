from .get_payment_ticket import get_payment_ticket
from .check_receipt_status import check_receipt_status
from .receipt_payment import receipt_payment
from .cancel_payment import cancel_payment

__all__ = [
    "get_payment_ticket",
    "check_receipt_status",
    "receipt_payment",
    "cancel_payment",
]

payments_api_routes = {
    "api.payments.get_ticket": "excel_restaurant_pos.api.payments.get_payment_ticket",
    "api.payments.check_receipt": "excel_restaurant_pos.api.payments.check_receipt_status",
    "api.payments.receipt_payment": "excel_restaurant_pos.api.payments.receipt_payment",
    "api.payments.cancel_payment": "excel_restaurant_pos.api.payments.cancel_payment",
}
