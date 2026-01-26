import frappe
from frappe import _


@frappe.whitelist()
def send_notification():
    """
    Send a notification to a single user

    Required parameters:
    - user: The user to send notification to
    - subject: Notification subject
    - message: Notification message content

    Optional parameters:
    - document_type: Related document type
    - document_name: Related document name
    - type: Notification type (default: Alert)
    """
    current_user = frappe.session.user

    if not current_user:
        frappe.throw("User not logged in")

    user = frappe.form_dict.get("user")
    subject = frappe.form_dict.get("subject")
    message = frappe.form_dict.get("message")
    document_type = frappe.form_dict.get("document_type")
    document_name = frappe.form_dict.get("document_name")
    notification_type = frappe.form_dict.get("type", "Alert")

    if not user:
        frappe.throw("User is required")

    if not subject:
        frappe.throw("Subject is required")

    if not message:
        frappe.throw("Message is required")

    # Verify the user exists
    if not frappe.db.exists("User", user):
        frappe.throw(f"User {user} does not exist")

    # Create notification log
    notification = frappe.get_doc({
        "doctype": "Notification Log",
        "for_user": user,
        "from_user": current_user,
        "subject": subject,
        "email_content": message,
        "document_type": document_type,
        "document_name": document_name,
        "type": notification_type,
        "read": 0
    })
    notification.insert(ignore_permissions=True)

    return {
        "success": True,
        "message": "Notification sent successfully",
        "notification_name": notification.name
    }


@frappe.whitelist()
def send_notification_to_multiple():
    """
    Send a notification to multiple users

    Required parameters:
    - users: JSON array of user emails to send notification to
    - subject: Notification subject
    - message: Notification message content

    Optional parameters:
    - document_type: Related document type
    - document_name: Related document name
    - type: Notification type (default: Alert)
    """
    current_user = frappe.session.user

    if not current_user:
        frappe.throw("User not logged in")

    users = frappe.form_dict.get("users")
    subject = frappe.form_dict.get("subject")
    message = frappe.form_dict.get("message")
    document_type = frappe.form_dict.get("document_type")
    document_name = frappe.form_dict.get("document_name")
    notification_type = frappe.form_dict.get("type", "Alert")

    if not users:
        frappe.throw("Users list is required")

    if not subject:
        frappe.throw("Subject is required")

    if not message:
        frappe.throw("Message is required")

    # Parse users list
    if isinstance(users, str):
        users = frappe.parse_json(users)

    if not isinstance(users, list):
        frappe.throw("Users must be a list")

    if not users:
        frappe.throw("Users list cannot be empty")

    sent_count = 0
    failed_users = []
    notification_names = []

    # Send notification to each user
    for user in users:
        try:
            # Verify the user exists
            if not frappe.db.exists("User", user):
                failed_users.append({"user": user, "reason": "User does not exist"})
                continue

            # Create notification log
            notification = frappe.get_doc({
                "doctype": "Notification Log",
                "for_user": user,
                "from_user": current_user,
                "subject": subject,
                "email_content": message,
                "document_type": document_type,
                "document_name": document_name,
                "type": notification_type,
                "read": 0
            })
            notification.insert(ignore_permissions=True)
            notification_names.append(notification.name)
            sent_count += 1

        except Exception as e:
            failed_users.append({"user": user, "reason": str(e)})

    return {
        "success": True,
        "message": f"Notifications sent to {sent_count} out of {len(users)} users",
        "sent_count": sent_count,
        "total_users": len(users),
        "failed_users": failed_users,
        "notification_names": notification_names
    }
