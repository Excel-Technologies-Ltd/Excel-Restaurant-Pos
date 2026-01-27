import re
import frappe
from datetime import datetime

def validate_required_yyyy_mm_dd(field_label: str, value) -> str:
    if value is None or str(value).strip() == "":
        frappe.throw(
            frappe._("{0} is required").format(field_label),
            frappe.MandatoryError,
        )

    value = str(value).strip()

    # Enforce strict format like 2026-01-25
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        frappe.throw(
            frappe._("{0} must be in YYYY-MM-DD format").format(field_label),
            frappe.ValidationError,
        )

    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        frappe.throw(
            frappe._("{0} is not a valid date").format(field_label),
            frappe.ValidationError,
        )

    return value


def validate_start_end_date(start_date: str, end_date: str) -> None:
    if datetime.strptime(start_date, "%Y-%m-%d").date() > datetime.strptime(
        end_date, "%Y-%m-%d"
    ).date():
        frappe.throw(
            frappe._("Start Date cannot be after End Date"),
            frappe.ValidationError,
        )


def validate_required_string(field_label: str, value) -> str:
    if value is None or str(value).strip() == "":
        frappe.throw(
            frappe._("{0} is required").format(field_label),
            frappe.MandatoryError,
        )
    return str(value).strip()


def normalize_optional_string(value):
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def as_int(name: str, value, default: int) -> int:
    if value is None or str(value).strip() == "":
        return default
    try:
        return int(value)
    except Exception:
        frappe.throw(
            frappe._("{0} must be an integer").format(name),
            frappe.ValidationError,
        )
