import frappe


def handle_table_occupy(**kwargs):
    """
    Handle table occupy
    """
    table_name = kwargs.get("table_name", None)
    sales_invoice = kwargs.get("sales_invoice", None)

    if not table_name or not sales_invoice:
        msg = f"Table name: {table_name}, Sales invoice: {sales_invoice}"
        frappe.log_error(msg, title="Table Availability Error")
        return

    # Ensure Sales Invoice exists (avoids race when job runs before commit)
    if not frappe.db.exists("Sales Invoice", sales_invoice):
        frappe.log_error(
            f"Sales Invoice {sales_invoice} not found when occupying table {table_name}",
            title="Table Occupy - Invoice Not Found",
        )
        return

    # Use db.set_value to avoid link validation race and document modified conflicts
    try:
        frappe.db.set_value(
            "Restaurant Table", table_name, "status", "Occupied"
        )
        frappe.db.set_value(
            "Restaurant Table", table_name, "running_order", sales_invoice
        )
        frappe.db.commit()
    except Exception as e:
        frappe.log_error(
            f"Error occupying table {table_name}: {str(e)}",
            title="Table Occupy Error",
        )
        return


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
    table.running_order = None
    table.save(ignore_permissions=True)

    print(f"Table {table_name} status updated to Available")
