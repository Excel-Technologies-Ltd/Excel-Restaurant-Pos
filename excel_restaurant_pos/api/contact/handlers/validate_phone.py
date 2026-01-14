import frappe


def validate_phone(phone_nos: list[dict]) -> list[dict]:
    """Validate phone numbers."""
    phone_fields = ["phone", "is_primary_phone"]
    validated_phone_nos = []
    for phone_no in phone_nos:
        # phone number info
        phone_no_info: dict = {}

        # validate phone number
        for field in phone_fields:
            if not phone_no.get(field):
                frappe.throw(f"{field} is required", frappe.MandatoryError)
            phone_no_info[field] = phone_no.get(field, "")

        # add phone number to validated phone numbers
        validated_phone_nos.append(phone_no_info)
    # return validated phone numbers
    return validated_phone_nos
