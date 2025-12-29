import frappe
import json
from frappe.utils import flt, now_datetime, get_time


@frappe.whitelist(allow_guest=True)
def add_sales_invoice():
    """
    Create a new Sales Invoice from user-provided data
    Uses default Frappe creation method with validation
    Allows guest access by using ignore_permissions=True

    """
    # Get data from request
    data = frappe.form_dict

    # Parse JSON if items/taxes are sent as JSON strings
    if isinstance(data.get("items"), str):
        data["items"] = json.loads(data["items"])
    if isinstance(data.get("taxes"), str):
        data["taxes"] = json.loads(data.get("taxes", "[]"))

    # Validate required fields
    required_fields = [
        "customer",
        "company",
    ]
    for field in required_fields:
        if not data.get(field):
            frappe.throw(f"{field} is required for creating a sales invoice")

    # validate items
    items = data.get("items", [])
    if not items or len(items) == 0:
        frappe.throw("At least one item is required for creating a sales invoice")

    # Verify customer exists
    if not frappe.db.exists("Customer", data.get("customer")):
        frappe.throw(f"Customer {data.get('customer')} does not exist")

    # Verify company exists
    if not frappe.db.exists("Company", data.get("company")):
        frappe.throw(f"Company {data.get('company')} does not exist")

    # Create Sales Invoice using standard Frappe method
    sales_invoice = frappe.new_doc("Sales Invoice")

    # Set main fields

    sales_invoice.customer = data.get("customer")
    sales_invoice.company = data.get("company")
    sales_invoice.naming_series = data.get("naming_series") or "WEB-.YY.-.#####"
    sales_invoice.posting_date = data.get("posting_date") or frappe.utils.today()
    sales_invoice.posting_time = data.get("posting_time") or get_time(now_datetime())
    sales_invoice.due_date = data.get("due_date") or sales_invoice.posting_date

    # Optional fields
    optional_fields = [
        "customer_name",
        "discount_amount",
        "apply_discount_on",
        "update_stock",
        "custom_order_type",
        "custom_order_from",
        "custom_order_status",
        "custom_service_type",
        "custom_customer_full_name",
        "custom_mobile_no",
        "custom_email_address",
        "remarks",
        "custom_delivery_date",
        "custom_delivery_time",
        "custom_delivery_location",
    ]

    for field in optional_fields:
        if data.get(field):
            setattr(sales_invoice, field, data.get(field))

    # validate item codes
    item_codes = [item_data.get("item_code") for item_data in items]
    existing = frappe.get_all(
        "Item", filters={"item_code": ["in", item_codes]}, pluck="item_code"
    )
    missing = set(item_codes) - set(existing)

    # throw error if items not found in the database
    if missing:
        frappe.throw(
            f"Items not found: {', '.join(missing)}. Please check the item codes and try again."
        )

    # Add items (child table)
    for item_data in items:
        # Validate item fields
        if not item_data.get("item_code"):
            frappe.throw("item_code is required for all items")

        # Append item to Sales Invoice
        sales_invoice.append(
            "items",
            {
                "item_code": item_data.get("item_code"),
                "qty": flt(item_data.get("qty", 1)),
                "rate": flt(item_data.get("rate", 0)),
                "warehouse": item_data.get("warehouse"),
                "description": item_data.get("description"),
                "custom_parent_item": item_data.get("custom_parent_item"),
                "custom_serve_type": item_data.get("custom_serve_type"),
                "custom_order_item_status": item_data.get("custom_order_item_status"),
                "custom_if_not_available": item_data.get("custom_if_not_available"),
                "custom_special_note": item_data.get("custom_special_note"),
            },
        )

    # Add taxes if provided (child table)
    if data.get("taxes"):
        for tax_data in data.get("taxes", []):
            sales_invoice.append(
                "taxes",
                {
                    "charge_type": tax_data.get("charge_type", "On Net Total"),
                    "account_head": tax_data.get("account_head"),
                    "rate": flt(tax_data.get("rate", 0)),
                    "description": tax_data.get("description", ""),
                },
            )

    # Add payments to child table (for tracking/display only)
    # Note: This doesn't create Payment Entry documents automatically
    if data.get("payments"):
        for payment in data.get("payments", []):
            sales_invoice.append(
                "payments",
                {
                    "mode_of_payment": payment.get("mode_of_payment"),
                    "amount": flt(payment.get("amount", 0)),
                },
            )
    sales_invoice.is_pos = 1

    # save the sales invoice
    sales_invoice.save(ignore_permissions=True)

    # return the created sales invoice
    return sales_invoice.as_dict()
