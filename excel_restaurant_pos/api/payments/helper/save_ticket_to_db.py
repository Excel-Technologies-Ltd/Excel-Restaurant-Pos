import frappe


def save_ticket_to_db(invoice_no: str, ticket: str):
    """
    Save the ticket to the database.
    Creates the Payment Ticket document if it doesn't exist, otherwise updates it.

    Args:
        invoice_no: The invoice number
        ticket: The payment ticket string to save

    Returns:
        bool: True if successful
    """
    # Check if Payment Ticket exists
    if frappe.db.exists("Payment Ticket", {"invoice_no": invoice_no}):
        # Update existing document
        frappe.db.set_value(
            "Payment Ticket", {"invoice_no": invoice_no}, "ticket", ticket
        )
        frappe.db.commit()
    else:
        # Create new document   
        payment_ticket = frappe.get_doc(
            {
                "doctype": "Payment Ticket",
                "invoice_no": invoice_no,
                "ticket": ticket,
            }
        )
        payment_ticket.insert(ignore_permissions=True)

    frappe.db.commit()
    return True
