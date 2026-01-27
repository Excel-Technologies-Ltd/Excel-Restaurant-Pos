import frappe
import json


def get_payment_config():
    """Get payment configuration from site config."""
    # get the payment config from the site config
    payment_config = frappe.conf.get("payment")
    
    if not payment_config:
        frappe.throw("Payment config not found", frappe.DoesNotExistError)

    # Parse JSON if it's a string
    if isinstance(payment_config, str):
        try:
            payment_config = json.loads(payment_config)
        except json.JSONDecodeError:
            frappe.throw(
                "Payment config is not valid JSON", frappe.ValidationError
            )

    # Ensure it's a dict
    if not isinstance(payment_config, dict):
        frappe.throw(
            "Payment config must be a dictionary", frappe.ValidationError
        )

    # validate the payment config
    config_fields = ["ticket_url", "store_id", "api_token", "checkout_id", "environment"]
    for field in config_fields:
        if field not in payment_config:
            frappe.throw(
                f"Payment config field {field} not found", frappe.DoesNotExistError
            )

    # return the payment config
    return payment_config
