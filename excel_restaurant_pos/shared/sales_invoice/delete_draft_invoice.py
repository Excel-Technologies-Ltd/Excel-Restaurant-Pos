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

    if not invoice.custom_service_type or invoice.custom_service_type.lower() != "delivery":
        frappe.throw("Invoice is not a delivery invoice", frappe.ValidationError)

    # delete invoice from db
    frappe.db.delete("Sales Invoice", invoice_no)
    frappe.db.commit()

    return True
