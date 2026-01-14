"""Email validation handlers for contact API."""

import frappe


def validate_emails(email_ids: list[dict]) -> list[dict]:
    """Validate email ids."""

    email_fields = ["email_id", "is_primary"]
    validated_email_ids = []
    # validate email ids
    for email_id in email_ids:
        # email id info
        email_id_info: dict = {}
        for field in email_fields:
            if not email_id.get(field):
                frappe.throw(f"{field} is required", frappe.MandatoryError)
            email_id_info[field] = email_id.get(field, "")
        # add email id to validated email ids
        validated_email_ids.append(email_id_info)

    # return validated email ids
    return validated_email_ids
