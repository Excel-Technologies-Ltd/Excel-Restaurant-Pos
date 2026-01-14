"""Handlers for adding addresses to links."""

import frappe


def add_address_with_link(address: dict, link_doctype: str, link_name: str) -> dict:
    """Add an address to a link."""

    # Check if address with same type already exists for this link
    address_type = address.get("address_type")
    existing_address_name = frappe.db.get_value(
        "Address",
        filters={
            "address_type": address_type,
            "link_doctype": link_doctype,
            "link_name": link_name,
        },
        fieldname="name",
    )

    # if exists, update it
    if existing_address_name:
        existing_address = frappe.get_doc("Address", existing_address_name)

        # Update fields individually
        for field, value in address.items():
            if field != "links":  # Skip links, handle separately
                setattr(existing_address, field, value)

        # Update links if needed (ensure link exists)
        link_exists = any(
            link.link_doctype == link_doctype and link.link_name == link_name
            for link in existing_address.links
        )
        if not link_exists:
            existing_address.append(
                "links", {"link_doctype": link_doctype, "link_name": link_name}
            )

        # save address
        existing_address.save(ignore_permissions=True)
        frappe.db.commit()

        return existing_address.as_dict()

    # create new address
    new_address = frappe.get_doc({"doctype": "Address", **address})

    # append link to address
    new_address.append("links", {"link_doctype": link_doctype, "link_name": link_name})

    # insert address
    new_address.insert(ignore_permissions=True)
    frappe.db.commit()

    # return address
    return new_address.as_dict()
