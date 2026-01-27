import frappe


@frappe.whitelist(allow_guest=True)
def check_receipt_status():
    return {
        "message": "Receipt status",
        "status": "success",
        "data": {"receipt_status": "1234567890"},
    }
