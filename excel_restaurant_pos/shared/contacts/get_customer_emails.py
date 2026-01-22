import frappe


def get_customer_emails(customer_code: str) -> list:
    """Get the customer emails for a given customer code."""
    # get the dynamic link
    all_links = frappe.get_all(
        "Dynamic Link",
        filters={"link_doctype": "Customer", "link_name": customer_code},
        fields=["parent", "parenttype"],
    )

    # get the contact names
    contact_names = [link.parent for link in all_links if link.parenttype == "Contact"]

    # get the emails from the contacts
    if contact_names:
        emails = frappe.get_all(
            "Contact Email",
            filters=[["parent", "in", contact_names]],
            fields=["email_id", "is_primary"],
        )
    else:
        emails = []

    # return the result
    return emails
