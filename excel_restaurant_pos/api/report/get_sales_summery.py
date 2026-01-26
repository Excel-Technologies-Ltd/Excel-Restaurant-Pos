import frappe
from calendar import monthrange
from frappe.utils import getdate


@frappe.whitelist()
def get_sales_summery(start_date=None, end_date=None):
    """
    Get sales summary report.

    Args:
        start_date: Report start date (YYYY-MM-DD). Defaults to first day of current month.
        end_date: Report end date (YYYY-MM-DD). Defaults to last day of current month.
    """
    data = frappe.form_dict or {}
    start_date = start_date or data.get("start_date")
    end_date = end_date or data.get("end_date")

    today = getdate()
    if not start_date:
        start_date = today.replace(day=1).strftime("%Y-%m-%d")
    else:
        start_date = getdate(start_date).strftime("%Y-%m-%d")
    if not end_date:
        _, last_day = monthrange(today.year, today.month)
        end_date = today.replace(day=last_day).strftime("%Y-%m-%d")
    else:
        end_date = getdate(end_date).strftime("%Y-%m-%d")

    result = frappe.db.sql(
        """
        SELECT
            SUM(COALESCE(TI.`total`, 0)) AS `Net Sales`,
            SUM(COALESCE(TI.`discount_amount`, 0)) AS `Discounts`,
            SUM(
                CASE
                    WHEN TSTC.`custom_is_tax` = 1 THEN TSTC.`tax_amount`
                    ELSE 0
                END
            ) AS `Taxes & Fees`,
            SUM(
                CASE
                    WHEN TSTC.`custom_is_tax` = 0 THEN TSTC.`tax_amount`
                    ELSE 0
                END
            ) AS `Tips`,
            (SUM(COALESCE(TI.`total`, 0)) + SUM(COALESCE(TI.`discount_amount`, 0))) AS `Gross Sales`
        FROM `tabSales Invoice` TI
        LEFT JOIN `tabSales Taxes and Charges` TSTC ON TI.`name` = TSTC.`parent`
        WHERE TI.`docstatus` = 1
            AND TI.`posting_date` >= %(start_date)s
            AND TI.`posting_date` < %(end_date)s
        """,
        values={"start_date": start_date, "end_date": end_date},
        as_dict=True,
    )

    return result
