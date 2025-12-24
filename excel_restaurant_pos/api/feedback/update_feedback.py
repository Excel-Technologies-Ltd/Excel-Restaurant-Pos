import frappe
import json


@frappe.whitelist(allow_guest=True)
def update_feedback():
    feedback_name = frappe.form_dict.get("name")
    if not feedback_name:
        frappe.throw("Feedback name is required")

    feedback_doc = frappe.get_doc("ArcPOS Feedback", feedback_name)
    if not feedback_doc or feedback_doc.docstatus == 1:
        frappe.throw("Feedback not found or already submitted")

    feedback_doc.overall_feedback = frappe.form_dict.get("overall_feedback", "")
    feedback_doc.is_completed = "Yes"

    # Update itemwise feedback
    item_wise_feedback = frappe.form_dict.get("item_wise_feedback")

    # Parse JSON if it's a string
    if isinstance(item_wise_feedback, str):
        item_wise_feedback = json.loads(item_wise_feedback)

    if item_wise_feedback:
        # Create a mapping of existing child rows by name for quick lookup
        existing_items = {item.name: item for item in feedback_doc.item_wise_feedback}

        # Update existing child table items
        for item_data in item_wise_feedback:
            item_name = item_data.get("name")
            if not item_name:
                continue

            # Find the existing child row
            if item_name in existing_items:
                child_row = existing_items[item_name]
                child_row.rating = item_data.get("rating", "")
                child_row.feedback = item_data.get("feedback", "")
            else:
                # If item doesn't exist, append new row
                feedback_doc.append(
                    "item_wise_feedback",
                    {
                        "name": item_name,
                        "rating": item_data.get("rating", ""),
                        "feedback": item_data.get("feedback", ""),
                    },
                )

    feedback_doc.save(ignore_permissions=True)
    feedback_doc.submit()
    return "Feedback submitted successfully"
