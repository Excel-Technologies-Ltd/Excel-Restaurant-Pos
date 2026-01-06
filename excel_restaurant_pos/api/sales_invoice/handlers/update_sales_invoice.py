import frappe
from frappe.utils import flt, add_days


def update_sales_invoice(invoice_name, items):
    sales_invoice = frappe.get_doc("Sales Invoice", invoice_name)
    print(sales_invoice.as_dict())

    sales_invoice.due_date = add_days(sales_invoice.posting_date, 1)

    for item_data in items:

        item_code = item_data.get("item_code", None)
        if not item_code:
            frappe.throw("Item code is required", frappe.ValidationError)

        if not frappe.db.exists("Item", item_code):
            frappe.throw(f"Item {item_code} not found", frappe.ValidationError)

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
                "custom_is_print": item_data.get("custom_is_print"),
                "custom_new_ordered_item": item_data.get("custom_new_ordered_item"),
            },
        )
    sales_invoice.save(ignore_permissions=True)

    return sales_invoice
