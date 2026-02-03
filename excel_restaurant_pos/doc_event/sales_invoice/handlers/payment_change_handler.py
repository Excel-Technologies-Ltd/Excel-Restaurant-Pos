import frappe
from frappe_uberdirect.uber_integration.job_handlers import create_delivery_handler


def _update_order_status(invoice, status):
    """
    Update order status.
    """
    invoice.custom_order_status = status
    for item in invoice.items:
        item.custom_order_item_status = status


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
    schedule_type = invoice.get("custom_order_schedule_type", "").lower()

    # status update logic
    if s_type in ["Dine-in", "Takeout"]:
        _update_order_status(invoice, "Closed")

    elif s_type == "Pickup" and o_type == "Pay Later":
        _update_order_status(invoice, "Picked Up")

    elif s_type == "Pickup" and o_type == "Pay First":
        if schedule_type == "asap/standard":
            _update_order_status(invoice, "In kitchen")
        else:
            _update_order_status(invoice, "Scheduled")
            # todo: if not work than work here, schedule a job that actually run letter

    elif s_type == "Delivery" and o_type == "Pay Later" and "store" in o_from:
        _update_order_status(invoice, "Delivered")

    elif s_type == "Delivery" and o_type == "Pay First":
        if schedule_type == "asap/standard":
            _update_order_status(invoice, "In kitchen")
        else:
            _update_order_status(invoice, "Scheduled")
            # todo: if not work than work here, schedule a job that actually run letter

        # enqueue delivery create
        try:
            frappe.enqueue(
                create_delivery_handler, queue="long", invoice_id=invoice.name
            )
        except Exception:
            frappe.log_error(
                "Error enqueuing delivery create",
                f"Error enqueuing delivery create for invoice {invoice_name}",
            )

    else:
        frappe.log_error(
            "Unmatched status update condition",
            f"Unmatched status update condition for invoice {invoice_name}",
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
