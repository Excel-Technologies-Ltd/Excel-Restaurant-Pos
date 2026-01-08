import frappe

@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_sales_invoice():
    """
    Get a sales invoice by name
    Args:
        invoice_name: The name of the sales invoice to get
    Returns:
        The sales invoice as a dictionary
    """
    invoice_name = frappe.form_dict.get("invoice_name", None)
    if not invoice_name:
        frappe.throw("Invoice name is required")
    
    if not frappe.db.exists("Sales Invoice", invoice_name):
        frappe.throw("Invoice not found")
    
    invoice = frappe.get_doc("Sales Invoice", invoice_name)
    return invoice.as_dict()