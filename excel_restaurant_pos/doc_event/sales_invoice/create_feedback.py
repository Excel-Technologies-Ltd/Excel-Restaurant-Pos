import frappe


def create_feedback(doc_dict):
    """
    Create ArcPOS Feedback document
    This function is queued to run in background

    Args:
        doc_dict: Dictionary containing sales invoice data
    """
    feedback_doc = frappe.new_doc("ArcPOS Feedback")
    feedback_doc.sales_invoice_no = doc_dict.get("name")
    feedback_doc.feedback_from = doc_dict.get("custom_order_from")

    # Append child table rows from items in doc_dict
    items = doc_dict.get("items", [])
    for item in items:
        item_code = item.get("item_code") if isinstance(item, dict) else item.item_code
        feedback_doc.append(
            "item_wise_feedback",
            {"item_name": item_code, "rating": "", "feedback": ""},
        )

    feedback_doc.insert(ignore_permissions=True, ignore_mandatory=True)
