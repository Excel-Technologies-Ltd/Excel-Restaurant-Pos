import frappe
from frappe.utils import flt

@frappe.whitelist(allow_guest=True)
def create_pos_invoice(data, method=None):
    try:
        frappe.msgprint(frappe.as_json(data))
        # Parse the incoming data
        if isinstance(data, str):
            data = frappe.parse_json(data)  # Ensure data is a dictionary

        # Create a new POS Invoice using frappe.get_doc
        invoice_doc = frappe.get_doc({
            "doctype": "POS Invoice",
            "customer": data.get("customer"),
            "docstatus": 1,
            "customer_name": data.get("customer_name"),
            "company": data.get("company"),
            "posting_date": frappe.utils.today(),
            "set_posting_time": 1,  # Allow posting at a specific time
            "is_pos": 1,  # Flag for POS
            "pos_profile": frappe.db.get_value(
                "POS Profile", {"company": data.get("company")}, "name"
            ),  # Assuming one profile per company
            "items": [],
            "taxes": [],
            "payments": []
        })

        # Add items to the invoice
        for item in data.get("item_list", []):
            invoice_doc.append("items", {
                "item_code": item.get("item"),
                "qty": flt(item.get("qty")),
                "rate": flt(item.get("rate")),
                "amount": flt(item.get("amount")),
                "discount_percentage": flt(data.get("discount")),
            })

        # Add taxes to the invoice
        # tax_rate = flt(data.get("tax"))
        # if tax_rate > 0:
        #     invoice_doc.append("taxes", {
        #         "charge_type": "On Net Total",
        #         "account_head": frappe.db.get_value(
        #             "Company", data.get("company"), "default_tax_account"
        #         ),  # Example tax account
        #         "rate": tax_rate,
        #         "description": "Sales Tax",
        #         "included_in_print_rate": 0,
            # })

        # Add payment to the invoice
        invoice_doc.append("payments", {
            "mode_of_payment": "Cash",
            "amount": flt(data.get("total_amount"))
        })

        # Insert the document into the database
        invoice_doc.insert(ignore_permissions=True)

        # Optionally, submit the document if needed
        # invoice_doc.submit(ignore_permissions=True)

        return {
            "status": "success",
            "invoice_name": invoice_doc.name,
            "message": f"POS Invoice {invoice_doc.name} created successfully."
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "POS Invoice Creation Error")
        frappe.msgprint(str(e))
        return {
            "status": "error",
            "message": str(e),
        }
