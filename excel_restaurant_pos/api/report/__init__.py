from .get_summery_report import get_summery_report

__all__ = ["get_summery_report"]

report_api_routes = {
    "api.reports.get_summery": "excel_restaurant_pos.api.report.get_summery_report"
}
