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


def get_mode_of_payment_account(mode_of_payment: str, company=None):
    """
    Get mode of payment account for company
    Args:
        mode_of_payment: Mode of payment
        company: Company name
    """

    if not company:
        company = frappe.db.get_single_value("ArcPOS Settings", "company")

    # default cash and bank account
    cash_account = frappe.db.get_value("Company", company, "default_cash_account")
    bank_account = frappe.db.get_value("Company", company, "default_bank_account")

    # get mode of payment
    mode_of_payment_account = frappe.get_doc("Mode of Payment", mode_of_payment)
    if not mode_of_payment_account:
        frappe.throw(f"Mode of payment {mode_of_payment} not found")

    payment_account = None
    # get accounts for the company
    for account in mode_of_payment_account.accounts:
        if account.company == company:
            payment_account = account.default_account
            break

    # if no accounts found, use default cash or bank account
    if not payment_account and mode_of_payment_account.type == "Cash":
        payment_account = cash_account
    elif not payment_account and mode_of_payment_account.type == "Bank":
        payment_account = bank_account
    elif not payment_account:
        msg = f"Mode of payment {mode_of_payment} not found for company {company}"
        frappe.throw(msg)

    return payment_account


def get_payable_account(company):
    """
    Get payable account for company
    Args:
        company: Company name
    """
    payable_account = frappe.db.get_value("Company", company, "default_payable_account")
    return payable_account


def get_write_off_account(company):
    """
    Get write off account for company
    Args:
        company: Company name
    """
    write_off_account = frappe.db.get_value("Company", company, "write_off_account")
    return write_off_account
