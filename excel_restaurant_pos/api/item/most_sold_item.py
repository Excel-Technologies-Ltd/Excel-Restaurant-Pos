import frappe
from frappe.utils import add_months, today


# get most sold item
@frappe.whitelist(allow_guest=True)
def get_most_sold_item():
    """
    Get most sold item
    """

    # date befor 60 days
    date_before_60_days = add_months(today(), -2)

    # get sales invoice item
    sales_invoice_item = frappe.get_all(
        "Item",
        filters={"creation": ["<=", date_before_60_days]},
        fields=["item_code", "qty"],
    )
    return sales_invoice_item
