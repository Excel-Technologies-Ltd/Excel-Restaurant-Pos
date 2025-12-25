from .test import test
from .add_sales_invoice import add_sales_invoice

__all__ = ["test", "add_sales_invoice"]

sales_invoice_api_routes = {
    "api.sales_invoices.test": "excel_restaurant_pos.api.sales_invoice.test",
    "api.sales_invoices.add": "excel_restaurant_pos.api.sales_invoice.add_sales_invoice",
}
