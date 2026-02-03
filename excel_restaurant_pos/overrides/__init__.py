from .item import override_item_doctype
import frappe.twofactor
import frappe.utils.pdf
from excel_restaurant_pos.overrides.twofactor import send_token_via_email
from excel_restaurant_pos.overrides.pdf import prepare_options

__all__ = ["override_item_doctype"]

# Override 2FA email function
frappe.twofactor.send_token_via_email = send_token_via_email

# Override PDF prepare_options to use custom margins (5mm left/right)
frappe.utils.pdf.prepare_options = prepare_options