import frappe


def payment_change_handler(invoice_name: str):
    """
    Handle payment change.
    """

    invoice = frappe.get_doc("Sales Invoice", invoice_name)

    # existance check
    if not invoice:
        frappe.log_error("Invoice not found", f"Invoice {invoice_name} not found")
        return

    # status check
    if invoice.status != "Paid":
        frappe.log_error("Invoice not paid", f"Invoice {invoice_name} is not paid")
        return

    # table realease logic here
    s_type = invoice.get("custom_service_type", None)
    o_type = invoice.get("custom_order_type", None)
    o_from = invoice.get("custom_order_from", "").lower()

    # status update logic
    if s_type in ["Dine-in", "Takeout"]:
        invoice.custom_order_status = "Closed"
        for item in invoice.items:
            item.custom_order_item_status = "Served"
            item.save(ignore_permissions=True)

    elif s_type == "Pickup" and o_type == "Pay Later":
        invoice.custom_order_status = "Picked Up"
        for item in invoice.items:
            item.custom_order_item_status = "Picked Up"
            item.save(ignore_permissions=True)

    elif s_type == "Pickup" and o_type == "Pay First":
        invoice.custom_order_status = "In kitchen"
        for item in invoice.items:
            item.custom_order_item_status = "In kitchen"
            item.save(ignore_permissions=True)

    elif s_type == "Delivery" and o_type == "Pay Later" and "store" in o_from:
        invoice.custom_order_status = "Delivered"
        for item in invoice.items:
            item.custom_order_item_status = "Delivered"
            item.save(ignore_permissions=True)

    elif s_type == "Delivery" and o_type == "Pay First":
        invoice.custom_order_status = "In kitchen"
        for item in invoice.items:
            item.custom_order_item_status = "In kitchen"
            item.save(ignore_permissions=True)
    else:
        frappe.log_error(
            "Unmatched status update condition",
            f"Unmatched status update condition for invoice {invoice_name}",
            f"Service Type: {s_type}, Order Type: {o_type}, Order From: {o_from}",
        )
        return

    # save the invoice
    try:
        invoice.save(ignore_permissions=True)
    except Exception as e:
        frappe.log_error(
            "Error saving invoice", f"Error saving invoice {invoice_name}: {e}"
        )
        return
