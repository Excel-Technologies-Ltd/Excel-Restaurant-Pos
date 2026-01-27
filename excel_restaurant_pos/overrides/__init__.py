from .item import override_item_doctype
import frappe.twofactor
from excel_restaurant_pos.overrides.twofactor import send_token_via_email

__all__ = ["override_item_doctype"]

# Override 2FA email function
frappe.twofactor.send_token_via_email = send_token_via_email