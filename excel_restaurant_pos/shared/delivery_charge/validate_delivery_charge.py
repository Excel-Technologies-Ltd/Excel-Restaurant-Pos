import frappe


def get_delivery_charge(sales_amount, quote_amount):
    """
    Get the delivery charge for a given sales amount and quote amount.
    Charge type: Actual (quote vs sales diff), Dynamic (tiered from criteria), Fixed.
    """
    d_charge_type = (
        frappe.db.get_single_value("ArcPOS Settings", "dc_charge_type_web") or "Actual"
    )

    match d_charge_type:
        case "Actual":
            return quote_amount
        case "Dynamic":
            dynamic_charge = _get_dynamic_charge(sales_amount)
            if dynamic_charge > 0:
                return min(dynamic_charge, quote_amount)
            else:
                return quote_amount
        case "Fixed":
            return _get_fixed_charge()
        case _:
            return 0


def _get_dynamic_charge(sales_amount):
    """Resolve charge from dynamic_dc_criteria_web (from_amount <= amount <= to_amount)."""
    amount = float(sales_amount or 0)
    settings = frappe.get_cached_doc("ArcPOS Settings")
    for row in settings.get("dynamic_dc_criteria_web") or []:
        from_amt = float(row.from_amount) if row.from_amount is not None else 0
        to_amt = float(row.to_amount) if row.to_amount is not None else float("inf")
        if from_amt <= amount and amount <= to_amt:
            return float(row.fees_amount or 0)
    return 0


def _get_fixed_charge():
    """Return fixed delivery charge from settings (fixed_dc_amount_pos used for web)."""
    val = frappe.db.get_single_value("ArcPOS Settings", "dca")
    return float(val or 0)


# def validate_delivery_charge(invoice_num, quote_amount):
