import frappe


@frappe.whitelist()
def my_notifications():
    """
    Get the last 20 notifications for the current session user
    """
    user = frappe.session.user

    if not user:
        frappe.throw("User not logged in")

    # Get the last 20 notifications for the current user
    notifications = frappe.get_all(
        "Notification Log",
        filters={"for_user": user},
        fields=[
            "name",
            "subject",
            "email_content",
            "document_type",
            "document_name",
            "from_user",
            "type",
            "read",
            "creation",
            "modified"
        ],
        order_by="creation desc",
        limit=20
    )

    # Get total unread notification count
    unread_count = frappe.db.count(
        "Notification Log",
        filters={"for_user": user, "read": 0}
    )

    return {
        "notifications": notifications,
        "unread_count": unread_count
    }
