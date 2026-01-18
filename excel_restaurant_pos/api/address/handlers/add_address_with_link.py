"""Handlers for adding addresses to links."""

import frappe


def add_address_with_link(address: dict, link_doctype: str, link_name: str) -> dict:
    """Add an address to a link."""

    # get the address Link First
    address_links = frappe.get_all(
        "Dynamic Link",
        filters={
            "parenttype": "Address",
            "link_doctype": link_doctype,
            "link_name": link_name,
        },
        fields=["parent"],
    )

    # Check if address with same type already exists for this link
    address_type = address.get("address_type")
    for link in address_links:
        addr_type = frappe.db.get_value("Address", link.parent, "address_type")
        if addr_type == address_type:
            frappe.throw(
                f"Address with type {address_type} already exists for this link",
                frappe.DuplicateEntryError,
            )

    new_address = frappe.get_doc({"doctype": "Address", **address})
    new_address.append("links", {"link_doctype": link_doctype, "link_name": link_name})

    new_address.insert(ignore_permissions=True)
    frappe.db.commit()
    return new_address.as_dict()
