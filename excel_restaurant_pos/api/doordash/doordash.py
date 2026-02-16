import frappe
import json

@frappe.whitelist(allow_guest=True)
def create_order():
    # Get raw request body
    raw_body = frappe.request.get_data(as_text=True)
    print("\nRaw Body:\n", raw_body, "\n")

    # If JSON, parse it
    try:
        data = json.loads(raw_body)
        print("\nParsed JSON:\n", data, "\n")
    except Exception as e:
        print("JSON parse error:", e)

    return {"status": "received"}
