from .get_payment_ticket import get_payment_ticket
from .check_receipt_status import check_receipt_status

__all__ = ["get_payment_ticket", "check_receipt_status"]

payments_api_routes = {
    "api.payments.get_ticket": "excel_restaurant_pos.api.payments.get_payment_ticket",
    "api.payments.check_receipt": "excel_restaurant_pos.api.payments.check_receipt_status",
}
