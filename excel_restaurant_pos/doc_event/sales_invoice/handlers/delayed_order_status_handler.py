import frappe


def delayed_order_status_handler(invoice_name: str):
    """
    Handle delayed order status
    """

    invoice = frappe.get_doc("Sales Invoice", invoice_name)
    if not invoice:
        frappe.log_error("Invoice not found", f"Invoice {invoice_name} not found")
        return

    # get order status
    invoice.custom_order_status = "In kitchen"
    for item in invoice.items:
        item.custom_order_item_status = "In kitchen"
        item.save(ignore_permissions=True)

    # log the order status change
    msg = f"Order status changed to {invoice.custom_order_status}"
    frappe.logger().info("Delayed order status change", msg)

    # save the invoice
    invoice.save(ignore_permissions=True)
