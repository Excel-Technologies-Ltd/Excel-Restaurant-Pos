import frappe


@frappe.whitelist(allow_guest=True)
def get_settings():
    """
    Get settings
    """
    settings = frappe.get_single("ArcPOS Settings")

    # get the customer
    default_customer_code = settings.customer
    customer_info = None

    if not default_customer_code:
        return {
            "settings": settings.as_dict(),
            "customer": None,
        }

    # if default customer code is provided, get the customer info
    customer = frappe.get_doc("Customer", default_customer_code)
    customer_info = {
        "name": customer.name,
        "customer_name": customer.customer_name,
        "image": customer.image,
    }

    # return result
    return {
        "settings": settings.as_dict(),
        "customer": customer_info,
    }
