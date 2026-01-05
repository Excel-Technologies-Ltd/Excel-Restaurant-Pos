import frappe


@frappe.whitelist(methods=["GET"])
def get_feedback_by_invoice():
    invoice_name = frappe.request.args.get("invoice_name")
    if not invoice_name:
        frappe.throw("Invoice name is required")

    feedback = frappe.db.get_all(
        "ArcPOS Feedback", filters={"sales_invoice_no": invoice_name}, fields=["*"]
    )
    if not feedback:
        return frappe.throw("No feedback found for this invoice")

    # add item wise feedback to the details
    for item in feedback:
        # get the item wise feedback
        items = frappe.db.get_all(
            "Feedback Items", filters={"parent": item.name}, fields=["*"]
        )
        item.item_wise_feedback = items

    return feedback
