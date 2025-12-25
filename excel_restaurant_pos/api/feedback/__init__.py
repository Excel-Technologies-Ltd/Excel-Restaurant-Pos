from .get_feedback import get_feedback
from .test import test
from .update_feedback import update_feedback

__all__ = [
    "get_feedback",
    "test",
    "update_feedback",
]

feedback_api_routes = {
    "api.feedbacks.test": "excel_restaurant_pos.api.feedback.test",
    "api.feedbacks.get": "excel_restaurant_pos.api.feedback.get_feedback",
    "api.feedbacks.update": "excel_restaurant_pos.api.feedback.update_feedback",
}
