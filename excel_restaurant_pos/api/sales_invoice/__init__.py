from .test import test
from .add_or_update_invoice import add_or_update_invoice

__all__ = ["test", "add_or_update_invoice"]

sales_invoice_api_routes = {
    "api.sales_invoices.test": "excel_restaurant_pos.api.sales_invoice.test",
    "api.sales_invoices.add": "excel_restaurant_pos.api.sales_invoice.add_or_update_invoice",
}
