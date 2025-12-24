import frappe


@frappe.whitelist(allow_guest=True)
def get_customer_address() -> dict:
    """
    Get customer address
    """

    # validate customer code
    customer_code = frappe.form_dict.pop("customer_code", None)
    if not customer_code:
        frappe.throw("Customer code is required")

    # get the dynamic link
    dynamic_links = frappe.get_all(
        "Dynamic Link",
        fields=["parent", "link_doctype", "link_name"],
        filters=[
            ["link_doctype", "=", "Customer"],
            ["link_name", "=", customer_code],
        ],
    )

    # get the addresses
    link_names = [dynamic_link.parent for dynamic_link in dynamic_links]

    # manipulate default form dictionary
    if frappe.form_dict.get("cmd"):
        frappe.form_dict.pop("cmd")
    # get the filters
    filters = frappe.form_dict.get("filters")
    # if filters are provided, extend them with the link names
    if filters:
        filters = frappe.parse_json(filters)
        filters.extend([["name", "in", link_names]])
    else:
        filters = [["name", "in", link_names]]

    # set the filters
    frappe.form_dict["filters"] = filters

    # get the addresses
    addresses_doclist = frappe.get_all("Address", **frappe.form_dict)

    # return the addresses
    return addresses_doclist
