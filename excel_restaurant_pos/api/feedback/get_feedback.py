import frappe


@frappe.whitelist(allow_guest=True)
def get_feedback():
    feedback_name = frappe.form_dict.get("name")

    if not feedback_name:
        frappe.throw("Feedback name is required")

    feedback_doc = frappe.get_doc("ArcPOS Feedback", feedback_name)
    if not feedback_doc:
        frappe.throw("Feedback not found")

    return feedback_doc.as_dict()
