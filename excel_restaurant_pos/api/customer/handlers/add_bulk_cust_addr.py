"""Handlers for adding bulk customer addresses."""

import frappe

from excel_restaurant_pos.api.address import add_address_with_link


def add_bulk_cust_addr(customer_code: str, addresses: list[dict]):
    """Add bulk customer addresses."""
    # validate addresses
    if not addresses:
        frappe.throw("Addresses are required", frappe.MandatoryError)

    # validate customer code
    if not customer_code:
        frappe.throw("Customer code is required", frappe.MandatoryError)

    # add addresses
    new_addresses = []
    for address in addresses:
        new_address = add_address_with_link(address, "Customer", customer_code)
        new_addresses.append(new_address)

    # return success message
    return {
        "message": "Addresses added successfully",
        "addresses": new_addresses,
    }
