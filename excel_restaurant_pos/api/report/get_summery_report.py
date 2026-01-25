import frappe
from calendar import monthrange
from frappe.utils import getdate


@frappe.whitelist(allow_guest=True)
def get_summery_report(start_date=None, end_date=None, outlet=None):
    """
    Get item performance summary report.

    Args:
        start_date: Report start date (YYYY-MM-DD). Defaults to first day of current month.
        end_date: Report end date (YYYY-MM-DD). Defaults to last day of current month.
        outlet: Outlet / restaurant name filter (e.g. 'From the Tandoor').
    """
    # Allow override from form_dict (API request)
    data = frappe.form_dict or {}
    start_date = start_date or data.get("start_date")
    end_date = end_date or data.get("end_date")
    outlet = outlet or data.get("outlet")

    # Default to current month if not provided
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

    if not outlet:
        frappe.throw("outlet is required for get_summery_report")

    result = frappe.db.sql(
        """
        CALL get_Item_Performance(%(start_date)s, %(end_date)s, %(outlet)s);
        """,
        values={"start_date": start_date, "end_date": end_date, "outlet": outlet},
        as_dict=True,
    )

    return result
