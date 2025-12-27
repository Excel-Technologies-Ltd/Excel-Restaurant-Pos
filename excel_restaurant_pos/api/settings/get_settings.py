import frappe


@frappe.whitelist(allow_guest=True)
def get_settings():
    """
    Get settings
    """
    settings = frappe.get_single("ArcPOS Settings").as_dict()

    # get the customer
    default_customer_code = settings.customer

    # if default customer code is not provided, return the settings
    if default_customer_code:
        customer = frappe.get_doc("Customer", default_customer_code).as_dict()
        settings["customer"] = {
            "name": customer.name,
            "customer_name": customer.customer_name,
            "image": customer.image,
        }

    # get tax and charge templates
    default_tax_template = settings.get("taxes_and_charges_template", None)
    if default_tax_template:
        tax_template = frappe.get_doc(
            "Sales Taxes and Charges Template", default_tax_template
        )
        settings["taxes_and_charges"] = {
            "charge_type": tax_template.taxes[0].charge_type,
            "account_head": tax_template.taxes[0].account_head,
            "rate": tax_template.taxes[0].rate,
            "tax_amount": tax_template.taxes[0].tax_amount,
            "total": tax_template.taxes[0].total,
        }

    # get default company info
    default_company = settings.get("company", None)
    default_currency = None
    if default_company:
        company = frappe.get_doc("Company", default_company)
        default_currency = company.default_currency
        settings["company"] = {
            "name": company.company_name,
            "abbr": company.abbr,
            "currency": company.default_currency,
            "country": company.country,
            "domain": company.domain,
        }

    # get default currency info
    if default_currency:
        currency = frappe.get_doc("Currency", default_currency)
        settings["currency"] = {
            "name": currency.name,
            "symbol": currency.symbol,
            "fraction_units": currency.fraction_units,
        }

    # return result
    return settings
