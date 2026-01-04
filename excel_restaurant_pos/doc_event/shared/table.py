import frappe


def handle_table_occupy(**kwargs):
    """
    Handle table occupy
    """
    # get the table name and sales invoice from the kwargs
    table_name = kwargs.get("table_name", None)
    sales_invoice = kwargs.get("sales_invoice", None)

    # get the table document
    if not table_name or not sales_invoice:
        msg = f"Table name: {table_name}, Sales invoice: {sales_invoice}"
        frappe.log_error(msg, title="Table Availability Error")
        return

    # update the table status and website url
    table = frappe.get_doc("Restaurant Table", table_name)
    table.status = "Occupied"
    table.website_url = sales_invoice
    table.save(ignore_permissions=True)

    print(f"Table {table_name} status updated to Occupied")


def handle_table_release(**kwargs):
    """
    Handle table release
    """
    # get the table name and sales invoice from the kwargs
    table_name = kwargs.get("table_name", None)
    sales_invoice = kwargs.get("sales_invoice", None)

    if not table_name or not sales_invoice:
        msg = f"Table name: {table_name}, Sales invoice: {sales_invoice}"
        frappe.log_error(msg, title="Table Availability Error")
        return

    # get the table document
    table = frappe.get_doc("Restaurant Table", table_name)
    table.status = "Available"
    table.website_url = None
    table.save(ignore_permissions=True)

    print(f"Table {table_name} status updated to Available")
