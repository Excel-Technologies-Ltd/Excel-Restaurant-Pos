from .test import test
from .add_or_update_invoice import add_or_update_invoice
from .get_sales_invoice import get_sales_invoice

__all__ = ["test", "add_or_update_invoice", "get_sales_invoice"]

sales_invoice_api_routes = {
    "api.sales_invoices.test": "excel_restaurant_pos.api.sales_invoice.test",
    "api.sales_invoices.add": "excel_restaurant_pos.api.sales_invoice.add_or_update_invoice",
    "api.sales_invoices.get": "excel_restaurant_pos.api.sales_invoice.get_sales_invoice",
}
