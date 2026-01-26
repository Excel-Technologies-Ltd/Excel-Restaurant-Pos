import frappe
from calendar import monthrange
from frappe.utils import getdate


@frappe.whitelist()
def get_item_performance_overview():
    """
    Get item performance overview report.

    Args:
        start_date: Report start date (YYYY-MM-DD). Defaults to first day of current month.
        end_date: Report end date (YYYY-MM-DD). Defaults to last day of current month.
        item_group: Item group to filter by. if not don't filter by item group.
    """
    data = frappe.form_dict or {}
    start_date = data.get("start_date", None)
    end_date = data.get("end_date", None)
    item_group = data.get("item_group", None)

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

    values = {"start_date": start_date, "end_date": end_date}
    where_clause = ""
    if item_group:
        where_clause = "AND TSII.`item_group` = %(item_group)s"
        values["item_group"] = item_group

    result = frappe.db.sql(
        """
        SELECT
            TSII.`item_name` AS `Item Name`,
            TSII.`item_group` AS `Item Category`,
            SUM(COALESCE(TSII.`qty`, 0)) AS `Sold Qty`,
            SUM(COALESCE(TSII.`amount`, 0)) AS `Amount`
        FROM `tabSales Invoice Item` TSII
        INNER JOIN `tabSales Invoice` TI ON TSII.`parent` = TI.`name`
        WHERE TI.`docstatus` = 1
            AND TI.`posting_date` >= %(start_date)s
            AND TI.`posting_date` < %(end_date)s
            {where_clause}
        GROUP BY TSII.`item_name`, TSII.`item_group`
        """.format(where_clause=where_clause),
        values=values,
        as_dict=True,
    )
    return result
