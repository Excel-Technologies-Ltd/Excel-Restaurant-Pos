import frappe


def get_receivable_account(company):
    """
    Get receivable account for company
    Args:
        company: Company name
    """
    receivable_account = frappe.get_value(
        "Company", company, "default_receivable_account"
    )
    return receivable_account


def get_mode_of_payment_account(mode_of_payment, company):
    """
    Get mode of payment account for company
    Args:
        mode_of_payment: Mode of payment
        company: Company name
    """
    cash_account = frappe.get_value("Company", company, "default_cash_account")
    bank_account = frappe.get_value("Company", company, "default_bank_account")
    return cash_account if mode_of_payment == "Cash" else bank_account


def get_payable_account(company):
    """
    Get payable account for company
    Args:
        company: Company name
    """
    payable_account = frappe.get_value("Company", company, "default_payable_account")
    return payable_account


def get_write_off_account(company):
    """
    Get write off account for company
    Args:
        company: Company name
    """
    write_off_account = frappe.get_value("Company", company, "write_off_account")
    return write_off_account
