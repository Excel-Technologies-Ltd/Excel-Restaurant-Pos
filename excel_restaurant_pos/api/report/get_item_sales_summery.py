import frappe
from .report_helper import (
    as_int,
    normalize_optional_string,
    validate_required_yyyy_mm_dd,
    validate_start_end_date,
)

@frappe.whitelist()
def get_item_sales_summery():
    """
    Get item performance summary (same output as `get_Item_Performance` procedure),
    implemented via Frappe SQL with pagination + filters.

    Required args (via request):
        start_date: YYYY-MM-DD
        end_date: YYYY-MM-DD

    Optional args:
        item_group: string (if not provided, returns all item groups)
        item_name: string (partial match)
        limit_start (0-based) + limit / limit_page_length (Frappe style)
    """
    data = frappe.form_dict or {}

    start_date = data.get("start_date") or data.get("from_date")
    end_date = data.get("end_date") or data.get("to_date")
    start_date = validate_required_yyyy_mm_dd("Start Date", start_date)
    end_date = validate_required_yyyy_mm_dd("End Date", end_date)
    validate_start_end_date(start_date, end_date)

    item_group = normalize_optional_string(data.get("item_group"))
    item_name = normalize_optional_string(data.get("item_name"))

    # Frappe-style pagination
    limit_start = as_int("limit_start", data.get("limit_start"), 0)
    if limit_start < 0:
        frappe.throw(frappe._("limit_start cannot be negative"), frappe.ValidationError)

    limit_page_length = as_int(
        "limit",
        data.get("limit") or data.get("limit_page_length") or data.get("page_length"),
        10,
    )
    if limit_page_length <= 0:
        frappe.throw(frappe._("limit must be greater than 0"), frappe.ValidationError)
    # Guardrail against accidental huge payloads
    limit_page_length = min(limit_page_length, 500)

    where_clauses = [
        "TSII.`docstatus` = 1",
        "TI.`docstatus` = 1",
        "TI.`posting_date` >= %(start_date)s",
        "TI.`posting_date` <= %(end_date)s",
    ]

    values = {
        "start_date": start_date,
        "end_date": end_date,
        "limit_start": limit_start,
        "limit_page_length": limit_page_length,
    }

    if item_group:
        where_clauses.append("TSII.`item_group` = %(item_group)s")
        values["item_group"] = item_group

    if item_name:
        # partial match search
        where_clauses.append("TSII.`item_name` LIKE %(item_name)s")
        values["item_name"] = f"%{item_name}%"

    where_sql = " AND ".join(where_clauses)

    try:
        # Total number of grouped rows (for pagination)
        total = frappe.db.sql(
            f"""
            SELECT COUNT(*) AS total
            FROM (
                SELECT TSII.`item_name`, TSII.`item_group`
                FROM `tabSales Invoice Item` TSII
                INNER JOIN `tabSales Invoice` TI ON TSII.`parent` = TI.`name`
                WHERE {where_sql}
                GROUP BY TSII.`item_name`, TSII.`item_group`
            ) t
            """,
            values=values,
            as_dict=True,
        )[0]["total"]

        totals = frappe.db.sql(
            f"""
            SELECT
                SUM(COALESCE(TSII.`qty`, 0)) AS `total_qty`,
                SUM(COALESCE(TSII.`amount`, 0)) AS `total_amount`
            FROM `tabSales Invoice Item` TSII
            INNER JOIN `tabSales Invoice` TI ON TSII.`parent` = TI.`name`
            WHERE {where_sql}
            """,
            values=values,
            as_dict=True,
        )[0]

        rows = frappe.db.sql(
            f"""
            SELECT
                TSII.`item_name`,
                TSII.`item_group`,
                SUM(COALESCE(TSII.`qty`, 0)) AS `sold_qty`,
                SUM(COALESCE(TSII.`amount`, 0)) AS `amount`
            FROM `tabSales Invoice Item` TSII
            INNER JOIN `tabSales Invoice` TI ON TSII.`parent` = TI.`name`
            WHERE {where_sql}
            GROUP BY TSII.`item_name`, TSII.`item_group`
            ORDER BY TSII.`amount` DESC
            LIMIT %(limit_start)s, %(limit_page_length)s
            """,
            values=values,
            as_dict=True,
        )

        return {
            "data": rows,
            "total": int(total or 0),
            "total_qty": float(totals.get("total_qty") or 0),
            "total_Amount": float(totals.get("total_amount") or 0),
            "limit_start": limit_start,
            "limit": limit_page_length,
        }
    except Exception:
        frappe.log_error(
            title="get_item_sales_summery failed",
            message=frappe.get_traceback(),
        )
        frappe.throw(
            frappe._(
                "Failed to fetch Item Performance. Please contact your system administrator."
            ),
            frappe.ValidationError,
        )