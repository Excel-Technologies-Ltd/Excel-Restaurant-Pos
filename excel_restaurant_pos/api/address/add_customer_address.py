import frappe


@frappe.whitelist(allow_guest=True)
def add_customer_address():
    """
    Add a new customer address
    """
    # validate customer code
    customer_code = frappe.form_dict.get("customer_code")
    if not customer_code:
        return frappe.throw("Customer code is required")

    # get customer
    customer = frappe.get_doc("Customer", customer_code)
    if not customer:
        return frappe.throw("Customer not found")

    # append address to customer
    new_address = frappe.new_doc("Address")
    new_address.address_title = customer.customer_name
    new_address.address_type = frappe.form_dict.get("address_type", "Billing")
    new_address.address_line1 = frappe.form_dict.get("address_line1", "")
    new_address.address_line2 = frappe.form_dict.get("address_line2", "")
    new_address.city = frappe.form_dict.get("city", "")
    new_address.state = frappe.form_dict.get("state", "")
    new_address.country = frappe.form_dict.get("country", "Canada")
    new_address.pincode = frappe.form_dict.get("pincode", None)
    new_address.email_id = frappe.form_dict.get("email_id", None)
    new_address.phone = frappe.form_dict.get("phone", None)

    # append link to address
    new_address.append(
        "links",
        {
            "link_doctype": "Customer",
            "link_name": customer.name,
        },
    )

    # save address
    new_address.save({"ignore_permissions": True})

    # return address
    return new_address.as_dict()
