import frappe


def get_ticket_from_db(invoice_no: str) -> str | None:
    """
    Get the payment ticket from the database.

    Args:
        invoice_no: The invoice number to retrieve the ticket for

    Returns:
        str | None: The ticket string if found, None if Payment Ticket doesn't exist or ticket is empty

    Raises:
        frappe.ValidationError: If invoice_no is not provided
    """
    if not invoice_no:
        frappe.throw("Invoice number is required", frappe.ValidationError)

    # Check if Payment Ticket exists
    if not frappe.db.exists("Payment Ticket", {"invoice_no": invoice_no}):
        return None

    # Get the ticket value
    ticket = frappe.db.get_value(
        "Payment Ticket",
        {"invoice_no": invoice_no},
        ["ticket", "creation"],
        as_dict=True,
    )

    return ticket
