"""Address validation handlers for customer API."""

import frappe


def validate_addresses(addresses: list[dict]) -> list[dict]:
    """Validate addresses."""

    # required fields
    address_fields = ["address_type", "address_line1", "city", "country"]
    validated_addresses = []

    # validate addresses
    for address in addresses:
        # address info
        address_info: dict = {}

        # validate required fields
        for field in address_fields:
            if not address.get(field):
                frappe.throw(f"{field} is required", frappe.MandatoryError)
            address_info[field] = address.get(field)

        # add address to validated addresses
        validated_addresses.append(address_info)

    # return validated addresses
    return validated_addresses
