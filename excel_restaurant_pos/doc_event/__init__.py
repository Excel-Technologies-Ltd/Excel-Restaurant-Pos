from .pos_invoice import create_pos_invoice
from .sales_invoice import change_sales_invoice, submit_sales_invoice
from .tax_and_charges import on_doctype_update

__all__ = [
    "create_pos_invoice",
    "change_sales_invoice",
    "submit_sales_invoice",
    "on_doctype_update",
]


custom_doc_events = {
    "Sales Invoice": {
        "on_submit": "excel_restaurant_pos.doc_event.sales_invoice.submit_sales_invoice",
        "on_change": "excel_restaurant_pos.doc_event.sales_invoice.change_sales_invoice",
        "after_insert": "excel_restaurant_pos.doc_event.sales_invoice.after_save_sales_invoice",
    },
    "Sales Taxes and Charges Template": {
        "on_update": "excel_restaurant_pos.doc_event.on_doctype_update",
    },
}
