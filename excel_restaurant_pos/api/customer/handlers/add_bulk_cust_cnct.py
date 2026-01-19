"""Handler for adding bulk customer contacts."""

import frappe

from excel_restaurant_pos.api.contact import add_contact_with_link


def add_bulk_cust_cnct(customer_code: str, contacts: list[dict]):
    """Add bulk customer contacts."""

    # validate contacts
    if not contacts:
        frappe.throw("Contacts are required", frappe.MandatoryError)

    # validate customer code
    if not customer_code:
        frappe.throw("Customer code is required", frappe.MandatoryError)

    # add contacts
    new_contacts = []
    for contact in contacts:
        new_contact = add_contact_with_link(
            contact_info=contact, link_doctype="Customer", link_name=customer_code
        )
        new_contacts.append(new_contact)

    # return success message
    return {
        "message": "Contacts added successfully",
        "contacts": new_contacts,
    }
