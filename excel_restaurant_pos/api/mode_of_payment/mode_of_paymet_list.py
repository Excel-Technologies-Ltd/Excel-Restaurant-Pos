import frappe


@frappe.whitelist(allow_guest=True)
def get_mode_of_payment_list():
    """
    Get list of enabled Mode of Payment records.
    Supports filters and fields via form_dict (similar to item_group API).
    """

    # Handle form_dict (remove cmd if present)
    if frappe.form_dict.get("cmd"):
        frappe.form_dict.pop("cmd")

    mode_of_payment_list = frappe.get_all("Mode of Payment", **frappe.form_dict)

    return mode_of_payment_list
