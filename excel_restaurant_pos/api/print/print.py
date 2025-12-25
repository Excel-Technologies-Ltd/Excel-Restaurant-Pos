import frappe
from frappe import _
@frappe.whitelist()
def get_sales_invoice_print_url(sales_invoice_name):
    """
    Generate print URL for Sales Invoice linked to Table Order
    """
    try:
        
        # Get Sales Invoice
        sales_invoice = frappe.get_doc("Sales Invoice", sales_invoice_name)
        
        # Generate print URL
        print_format = "Standard"  # You can change this to your custom print format
        
        # Create the print URL
        print_url = frappe.utils.get_url(
            f"/printview?doctype=Sales Invoice&name={sales_invoice.name}&format={print_format}"
        )
        
        return {
            "status": "success",
            "message": "Print URL generated successfully",
            "print_url": print_url,
            "sales_invoice": sales_invoice.name
        }
        
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Sales Invoice Print Error"))
        return {
            "status": "error",
            "message": str(e)
        }


@frappe.whitelist()
def get_table_order_print_url(table_order_name):
    """
    Generate print URL for Table Order directly
    """
    try:
        # Get the Table Order document
        table_order = frappe.get_doc("Table Order", table_order_name)
        
        # Generate print URL
        print_format = "Standard"  # Change to your custom print format if needed
        
        # Create the print URL
        print_url = frappe.utils.get_url(
            f"/printview?doctype=Table Order&name={table_order.name}&format={print_format}"
        )
        
        return {
            "status": "success",
            "message": "Print URL generated successfully",
            "print_url": print_url
        }
        
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Table Order Print Error"))
        return {
            "status": "error",
            "message": str(e)
        }
        
        
@frappe.whitelist()
def get_print_format_sales_invoice():
    restaurant_settings = frappe.get_doc("Restaurant Settings")
    sales_invoice_print_format = restaurant_settings.print_format_for_order
    if not sales_invoice_print_format:
        sales_invoice_print_format = "Standard"
    return sales_invoice_print_format
