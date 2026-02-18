"""Whitelisted API endpoints for Uber Eats reporting."""

import json
from html import unescape

import requests

import frappe


@frappe.whitelist()
def create_report(report_type, store_ids, start_date, end_date):
    """Create an async report job on Uber Eats.

    Reports are generated asynchronously. Once ready, Uber sends an
    eats.report.success webhook with download URLs.

    Args:
        report_type: One of ORDERS_AND_ITEMS_REPORT, PAYMENT_DETAILS_REPORT,
                     ORDER_LEVEL_ADJUSTMENTS_REPORT, FINANCE_SUMMARY_REPORT,
                     CUSTOMER_FEEDBACK_REPORT, DOWNTIME_REPORT
        store_ids: Store UUID or list of store UUIDs (JSON string or list)
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
    """
    if not report_type:
        frappe.throw("report_type is required")
    if not store_ids:
        frappe.throw("store_ids is required")
    if not start_date or not end_date:
        frappe.throw("start_date and end_date are required")

    from .uber_eats_api import REPORT_TYPES, create_report as _create_report

    report_type = report_type.upper()
    if report_type not in REPORT_TYPES:
        frappe.throw(
            f"Invalid report_type '{report_type}'. Must be one of: {', '.join(REPORT_TYPES)}"
        )

    if isinstance(store_ids, str):
        try:
            store_ids = json.loads(store_ids)
        except json.JSONDecodeError:
            store_ids = [store_ids]

    return _create_report(
        report_type=report_type,
        store_ids=store_ids,
        start_date=start_date,
        end_date=end_date,
    )


@frappe.whitelist()
def get_report_results(workflow_id=None, report_type=None):
    """Get completed report results received via webhook.

    If workflow_id is provided, fetches the CSV report and returns it as a
    file download. Otherwise returns a list of all report results.

    Args:
        workflow_id: Optional workflow_id — if provided, returns the CSV file
        report_type: Optional report_type to filter by
    """
    filters = {
        "reference_doctype": "ArcPOS Settings",
        "reference_name": "ArcPOS Settings",
        "comment_type": "Info",
        "content": ["like", "%eats.report.success%"],
    }

    comments = frappe.get_all(
        "Comment",
        filters=filters,
        fields=["content", "creation"],
        order_by="creation desc",
        limit=20,
    )

    results = []
    for c in comments:
        try:
            data = json.loads(c.content)
        except (json.JSONDecodeError, TypeError):
            continue

        if workflow_id and data.get("workflow_id") != workflow_id:
            continue
        if report_type and data.get("report_type") != report_type.upper():
            continue

        data["received_at"] = str(c.creation)
        results.append(data)

    # If workflow_id provided and we found a match, return the CSV file
    if workflow_id and results:
        download_urls = results[0].get("download_urls", [])
        if not download_urls:
            frappe.throw("No download URL found for this report")

        url = unescape(download_urls[0])
        response = requests.get(url, timeout=60)

        if response.status_code != 200:
            frappe.throw(
                f"Failed to download report: {response.status_code} - {response.text}"
            )

        frappe.response["type"] = "csv"
        frappe.response["doctype"] = "Uber Eats Report"
        frappe.response["result"] = response.text
        frappe.response["filename"] = (
            f"{results[0].get('report_type', 'report')}_{workflow_id}.csv"
        )
        return

    return results
