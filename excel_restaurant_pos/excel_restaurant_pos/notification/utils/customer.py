"""Utility functions for customer notifications."""

import frappe


def get_customer_primary_email(customer_name):
    """Get the primary email address for a customer.

    Args:
        customer_name: The name of the customer
    """
    email_list = get_customer_email_list(customer_name)
    primary_email = None

    # loop through the email list
    for email in email_list:
        if email.is_primary:
            primary_email = email.email_id
            break
    return primary_email


def get_customer_email_list(customer_name):
    """Get the email list for a customer.

    Args:
        customer_name: The name of the customer
    """
    customer_links = frappe.get_all(
        "Dynamic Link",
        filters={
            "link_doctype": "Customer",
            "link_name": customer_name,
            "parenttype": "Contact",
        },
        fields=["parent", "parenttype"],
    )

    contact_names = [link.parent for link in customer_links]

    email_list = frappe.get_all(
        "Contact Email",
        filters=[["parent", "in", contact_names]],
        fields=["email_id"],
    )

    return email_list
