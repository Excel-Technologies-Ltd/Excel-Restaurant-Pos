import frappe


def delete_delivery_draft_invoice(invoice_no: str):
    """
    Delete a draft invoice from the database.
    """

    # get invoice
    invoice = frappe.get_doc("Sales Invoice", invoice_no)
    if not invoice:
        frappe.throw("Invoice not found", frappe.DoesNotExistError)

    # delete invoice
    if invoice.docstatus != 0:
        frappe.throw("Invoice is not a draft", frappe.ValidationError)

    # check if invoice is a delivery or pickup invoice
    valid_service_types = ["delivery", "pickup"]
    service_type = invoice.get("custom_service_type", "").lower()
    if service_type not in valid_service_types:
        message = f"Invoice is not a {', '.join(valid_service_types)} service type"
        frappe.throw(message, frappe.ValidationError)

    # delete invoice from db
    frappe.db.delete("Sales Invoice", invoice_no)
    frappe.db.commit()

    return True
