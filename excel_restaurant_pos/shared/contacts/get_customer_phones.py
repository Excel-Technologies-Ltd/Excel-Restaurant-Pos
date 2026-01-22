import frappe


def get_customer_phones(customer_code: str) -> list:
    """Get the customer phones for a given customer code."""
    # get the dynamic link
    all_links = frappe.get_all(
        "Dynamic Link",
        filters={"link_doctype": "Customer", "link_name": customer_code},
        fields=["parent", "parenttype"],
    )

    # get the contact names
    contact_names = [link.parent for link in all_links if link.parenttype == "Contact"]

    # get the phones from the contacts
    if contact_names:
        phones = frappe.get_all(
            "Contact Phone",
            filters=[["parent", "in", contact_names]],
            fields=["phone", "is_primary_phone", "is_primary_mobile_no"],
        )
    else:
        phones = []

    # return the result
    return phones
