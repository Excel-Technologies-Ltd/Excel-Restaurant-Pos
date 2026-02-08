import frappe
from frappe.utils import flt
from datetime import datetime
from .report_helper import (
    validate_required_yyyy_mm_dd,
    validate_start_end_date,
    normalize_optional_string,
)


def format_date_ordinal(date_str: str) -> str:
    """Format date as '1st February 2026'."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    day = dt.day

    if 11 <= day <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")

    return f"{day}{suffix} {dt.strftime('%B %Y')}"


@frappe.whitelist()
def get_payment_overview(start_date=None, end_date=None, mode_of_payment=None):
    """
    Get payment overview report.

    Args:
        start_date: Report start date (YYYY-MM-DD). Required.
        end_date: Report end date (YYYY-MM-DD). Required.
        mode_of_payment: Filter by specific payment method (optional).
    """
    mode_of_payment = normalize_optional_string(mode_of_payment)

    start_date = validate_required_yyyy_mm_dd("Start Date", start_date)
    end_date = validate_required_yyyy_mm_dd("End Date", end_date)
    validate_start_end_date(start_date, end_date)

    try:
        # Get all payment methods from Payment Entry (docstatus = 1)
        payment_methods = get_payment_methods(mode_of_payment)

        report_data = []
        total_closing_balance = 0

        for method in payment_methods:
            method_name = method.get("mode_of_payment")

            # Calculate Opening Balance (from ERP start to before start_date)
            opening_balance = get_opening_balance(method_name, start_date)

            # Calculate Debit and Credit for the date range
            period_totals = get_period_totals(method_name, start_date, end_date)
            debit = flt(period_totals.get("debit", 0), 2)
            credit = flt(period_totals.get("credit", 0), 2)

            # Current Balance = Opening Balance + Debit - Credit
            current_balance = flt(opening_balance + debit - credit, 2)
            total_closing_balance += current_balance

            report_data.append({
                "method_name": method_name,
                "opening_balance": flt(opening_balance, 2),
                "debit": debit,
                "credit": credit,
                "current_balance": current_balance,
            })

        # Format date range display
        date_range_display = (
            f"{format_date_ordinal(start_date)} to {format_date_ordinal(end_date)}"
        )

        return {
            "date_range": date_range_display,
            "start_date": start_date,
            "end_date": end_date,
            "data": report_data,
            "closing_balance": flt(total_closing_balance, 2),
        }

    except Exception:
        frappe.log_error(
            title="get_payment_overview failed",
            message=frappe.get_traceback(),
        )
        frappe.throw(
            frappe._(
                "Failed to fetch Payment Overview. Please contact your system administrator."
            ),
            frappe.ValidationError,
        )


def get_payment_methods(mode_of_payment=None):
    """
    Get distinct payment methods from Payment Entry (docstatus = 1).
    """
    return frappe.db.sql(
        """
        SELECT DISTINCT pe.mode_of_payment
        FROM `tabPayment Entry` pe
        WHERE pe.docstatus = 1
        AND pe.mode_of_payment IS NOT NULL
        AND pe.mode_of_payment != ''
        {mode_filter}
        ORDER BY pe.mode_of_payment
        """.format(
            mode_filter="AND pe.mode_of_payment = %(mode_of_payment)s"
            if mode_of_payment
            else ""
        ),
        {"mode_of_payment": mode_of_payment} if mode_of_payment else {},
        as_dict=True,
    )


def get_opening_balance(mode_of_payment: str, start_date: str) -> float:
    """
    Calculate opening balance for a payment method.
    Opening Balance = SUM(debit) - SUM(credit) from ERP start to before start_date.
    Filters GL Entry by:
    - is_cancelled = 0
    - voucher_type = 'Payment Entry'
    - Linked Payment Entry's mode_of_payment
    - GL account = Payment Entry's paid_to account
    """
    result = frappe.db.sql(
        """
        SELECT
            COALESCE(SUM(gl.debit), 0) - COALESCE(SUM(gl.credit), 0) AS balance
        FROM `tabGL Entry` gl
        INNER JOIN `tabPayment Entry` pe ON gl.voucher_no = pe.name
        WHERE gl.is_cancelled = 0
        AND gl.voucher_type = 'Payment Entry'
        AND pe.mode_of_payment = %(mode_of_payment)s
        AND gl.account = pe.paid_to
        AND gl.posting_date < %(start_date)s
        """,
        {"mode_of_payment": mode_of_payment, "start_date": start_date},
        as_dict=True,
    )

    return flt(result[0].get("balance", 0) if result else 0)


def get_period_totals(mode_of_payment: str, start_date: str, end_date: str) -> dict:
    """
    Calculate debit and credit totals for a payment method within date range.
    Filters GL Entry by:
    - is_cancelled = 0
    - voucher_type = 'Payment Entry'
    - Linked Payment Entry's mode_of_payment
    - GL account = Payment Entry's paid_to account
    """
    result = frappe.db.sql(
        """
        SELECT
            COALESCE(SUM(gl.debit), 0) AS debit,
            COALESCE(SUM(gl.credit), 0) AS credit
        FROM `tabGL Entry` gl
        INNER JOIN `tabPayment Entry` pe ON gl.voucher_no = pe.name
        WHERE gl.is_cancelled = 0
        AND gl.voucher_type = 'Payment Entry'
        AND pe.mode_of_payment = %(mode_of_payment)s
        AND gl.account = pe.paid_to
        AND gl.posting_date >= %(start_date)s
        AND gl.posting_date <= %(end_date)s
        """,
        {
            "mode_of_payment": mode_of_payment,
            "start_date": start_date,
            "end_date": end_date,
        },
        as_dict=True,
    )

    return result[0] if result else {"debit": 0, "credit": 0}
