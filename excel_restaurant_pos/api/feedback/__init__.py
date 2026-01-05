from .get_feedback import get_feedback
from .test import test
from .update_feedback import update_feedback
from .get_feedback_by_invoice import get_feedback_by_invoice

__all__ = [
    "get_feedback",
    "test",
    "update_feedback",
    "get_feedback_by_invoice",
]

feedback_api_routes = {
    "api.feedbacks.test": "excel_restaurant_pos.api.feedback.test",
    "api.feedbacks.get": "excel_restaurant_pos.api.feedback.get_feedback",
    "api.feedbacks.update": "excel_restaurant_pos.api.feedback.update_feedback",
    "api.feedbacks.get_by_invoice": "excel_restaurant_pos.api.feedback.get_feedback_by_invoice",
}
