import frappe

from excel_restaurant_pos.doc_event.shared import handle_table_release


def change_delete_handler(invoice_name: str):

    # check invoice has linked table
    doc = frappe.get_doc("Sales Invoice", invoice_name)
    if not doc:
        msg = f"Sales Invoice {invoice_name} not found"
        frappe.log_error("Sales Invoice Not Found", msg)
        return

    # check invoice has linked table
    linked_table = doc.get("custom_linked_table", None)
    if linked_table is None:
        msg = f"Sales Invoice {invoice_name} has no linked table"
        frappe.log_error("No Linked Table", msg)
        return

    # call release table funcation
    args = {"table_name": linked_table, "sales_invoice": invoice_name}
    handle_table_release(**args)

    # update invoice linked table to none
    doc.custom_linked_table = None
    doc.save(ignore_permissions=True)
