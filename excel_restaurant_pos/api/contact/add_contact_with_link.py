"""Contact creation handler with link support."""

import frappe

from .handlers.validate_emails import validate_emails
from .handlers.validate_phone import validate_phone


def add_contact_with_link(contact_info: dict, link_doctype: str, link_name: str):
    """Add contact with link."""

    email_ids = contact_info.get("email_ids", [])
    phone_nos = contact_info.get("phone_nos", [])

    # validate email ids and phone numbers
    validated_email_ids = validate_emails(email_ids)
    validated_phone_nos = validate_phone(phone_nos)

    # create new contact with basic fields (excluding child tables)
    contact_dict = {
        k: v for k, v in contact_info.items() if k not in ["email_ids", "phone_nos"]
    }
    new_contact = frappe.get_doc({"doctype": "Contact", **contact_dict})

    # append email ids (child table)
    for email_data in validated_email_ids:
        new_contact.append("email_ids", email_data)

    # append phone numbers (child table)
    for phone_data in validated_phone_nos:
        new_contact.append("phone_nos", phone_data)

    # append link to contact
    new_contact.append("links", {"link_doctype": link_doctype, "link_name": link_name})

    # insert contact
    new_contact.insert(ignore_permissions=True)
    frappe.db.commit()

    # return contact
    return new_contact.as_dict()
