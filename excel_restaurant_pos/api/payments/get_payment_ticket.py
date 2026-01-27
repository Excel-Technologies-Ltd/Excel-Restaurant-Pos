import requests
import frappe


from excel_restaurant_pos.shared.sales_invoice import delete_invoice_from_db
from excel_restaurant_pos.utils import convert_to_flt_string, convert_to_decimal_string
from .helper.get_payment_config import get_payment_config
from .helper.save_ticket_to_db import save_ticket_to_db
from .helper.get_ticket_from_db import get_ticket_from_db


@frappe.whitelist(allow_guest=True)
def get_payment_ticket():

    # validate invoice number
    invoice_number = frappe.form_dict.get("invoice_number", None)
    if not invoice_number:
        frappe.throw("Invoice number is required")

    # get the invoice
    invoice = frappe.get_doc("Sales Invoice", invoice_number)
    if not invoice:
        frappe.throw("Invoice not found", frappe.DoesNotExistError)

    # get the ticket from the database
    ticket = get_ticket_from_db(invoice_number)
    if ticket:
        # dlete the invoice and throw error
        delete_invoice_from_db(invoice_number)
        frappe.throw("Invalid order or expired session", frappe.ValidationError)

    # get the payment config from the site config
    payment_config = get_payment_config()

    # prepare the payment ticket payload
    payload = {
        "store_id": payment_config["store_id"],
        "api_token": payment_config["api_token"],
        "checkout_id": payment_config["checkout_id"],
        "environment": payment_config["environment"],
        "language": "en",
        "action": "preload",
        "txn_total": convert_to_flt_string(invoice.grand_total),
        "order_no": invoice.name,
        "cust_id": invoice.customer,
    }

    # prepare the cart
    cart = {}
    # prepare items
    fmt_items = []
    for item in invoice.items:
        fmt_items.append(
            {
                "url": item.image,
                "description": item.description,
                "product_code": item.item_code,
                "unit_cost": convert_to_flt_string(item.rate),
                "quantity": convert_to_decimal_string(item.qty),
            }
        )
    cart["items"] = fmt_items
    cart["subtotal"] = convert_to_flt_string(invoice.base_grand_total)
    cart["tax"] = {
        "amount": convert_to_flt_string(invoice.total_taxes_and_charges),
        "description": "Taxes",
    }

    payload["cart"] = cart

    print(payload)

    # send the payment ticket request
    try:
        response = requests.post(payment_config["ticket_url"], json=payload, timeout=30)
    except requests.exceptions.RequestException as e:
        frappe.log_error(
            f"Payment gateway request failed: {str(e)}", "Payment Ticket Error"
        )
        frappe.throw("Failed to connect to payment gateway", frappe.ValidationError)

    if response.status_code != 200:
        error_msg = f"Payment gateway returned status {response.status_code}"
        try:
            error_detail = response.text[:200]  # First 200 chars of error
            frappe.log_error(f"{error_msg}: {error_detail}", "Payment Ticket Error")
        except Exception:
            pass
        frappe.throw(
            f"Failed to get payment ticket: {error_msg}", frappe.ValidationError
        )

    # Parse response
    try:
        response_data = response.json()
    except ValueError as e:
        frappe.log_error(
            f"Invalid JSON response from payment gateway: {str(e)}",
            "Payment Ticket Error",
        )
        frappe.throw("Invalid response from payment gateway", frappe.ValidationError)

    res = response_data.get("response", {})
    print(res)
    if res.get("success", "false").lower() != "true":
        error_message = res.get("message", "Unknown error from payment gateway")
        frappe.log_error(
            f"Payment gateway error: {error_message}", "Payment Ticket Error"
        )
        frappe.throw(
            f"Failed to get payment ticket: {error_message}", frappe.ValidationError
        )

    ticket = res.get("ticket")
    if not ticket:
        frappe.throw("Payment ticket not found in response", frappe.ValidationError)

    # save the ticket to the database
    save_ticket_to_db(invoice_number, ticket)

    return {"ticket": ticket}
