"""Customer creation API endpoints."""

import frappe


from .handlers.add_bulk_cust_addr import add_bulk_cust_addr
from .handlers.validate_addresses import validate_addresses
from .handlers.add_bulk_cust_cnct import add_bulk_cust_cnct


@frappe.whitelist(allow_guest=False, methods=["POST"])
def create_customer():
    """Create a new customer with default values."""

    customer_info: dict = {}

    # required fields
    required_fields = ["customer_name", "customer_type", "territory"]
    for field in required_fields:
        if not frappe.form_dict.get(field):
            frappe.throw(f"{field} is required", frappe.MandatoryError)
        customer_info[field] = frappe.form_dict.get(field)

    # optional fields
    optional_fields = ["payment_terms", "is_frozen", "disabled"]
    for field in optional_fields:
        if frappe.form_dict.get(field):
            customer_info[field] = frappe.form_dict.get(field)

    # create customer
    customer = frappe.get_doc({"doctype": "Customer", **customer_info})

    # add credit limits
    credit_limit_fields = ["company", "credit_limit"]
    credit_limits = frappe.form_dict.get("credit_limits", [])
    for credit_limit in credit_limits:
        for field in credit_limit_fields:
            if not credit_limit.get(field):
                frappe.throw(f"{field} is required", frappe.MandatoryError)
            customer.append("credit_limits", {field: credit_limit.get(field)})

    # insert customer
    customer.insert(ignore_permissions=True)
    frappe.db.commit()

    # validate addresses
    addresses = frappe.form_dict.get("addresses", [])
    validated_addresses = validate_addresses(addresses)

    # add customer addresses
    frappe.enqueue(
        add_bulk_cust_addr,
        queue="short",
        customer_code=customer.name,
        addresses=validated_addresses,
    )

    # add customer contacts
    emails = frappe.form_dict.get("emails", [])
    phones = frappe.form_dict.get("phones", [])

    contacts = [{"email_ids": emails, "phone_nos": phones}]
    frappe.enqueue(
        add_bulk_cust_cnct,
        queue="short",
        customer_code=customer.name,
        contacts=contacts,
    )
    # return customer
    return {
        "message": "Customer created successfully",
        "customer": customer.as_dict(),
    }
