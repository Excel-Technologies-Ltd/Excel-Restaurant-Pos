from .get_sales_summery import get_sales_summery
from .get_item_performance_overview import get_item_performance_overview

__all__ = ["get_sales_summery", "get_item_performance_overview"]

report_api_routes = {
    "api.reports.get_sales_summery": "excel_restaurant_pos.api.report.get_sales_summery",
    "api.reports.get_item_performance": "excel_restaurant_pos.api.report.get_item_performance_overview",
}
