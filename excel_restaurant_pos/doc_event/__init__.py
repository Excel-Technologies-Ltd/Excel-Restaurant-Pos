from .item import create_add_on_item
from .pos_invoice import create_pos_invoice
from .sales_invoice import change_sales_invoice, submit_sales_invoice
from .tax_and_charges import on_doctype_update

__all__ = [
    "create_add_on_item",
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
}
