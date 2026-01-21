import frappe


def get_customer_contacts(customer_code: str) -> list:
    """Get the customer contacts for a given customer code."""

    # get the dynamic link
    all_links = frappe.get_all(
        "Dynamic Link",
        filters={"link_doctype": "Customer", "link_name": customer_code},
        fields=["parent", "parenttype"],
    )

    # get the contact names
    contact_names = [link.parent for link in all_links if link.parenttype == "Contact"]

    # get the phones and emails from the contacts
    if contact_names:
        phone_list = frappe.get_all(
            "Contact Phone",
            filters=[["parent", "in", contact_names]],
            fields=["phone", "is_primary_phone", "is_primary_mobile_no"],
        )
        email_list = frappe.get_all(
            "Contact Email",
            filters=[["parent", "in", contact_names]],
            fields=["email_id", "is_primary"],
        )
    else:
        phone_list = []
        email_list = []

    # return the result
    return {"phones": phone_list, "emails": email_list}
