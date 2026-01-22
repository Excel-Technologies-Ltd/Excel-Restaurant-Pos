import frappe


@frappe.whitelist()
def mark_as_read():
    """
    Mark a single notification as read for the current session user
    """

    user = frappe.session.user
    notification_name = frappe.form_dict.get("name")

    if not user:
        frappe.throw("User not logged in")

    if not notification_name:
        frappe.throw("Notification name is required")

    # Get the notification and verify it belongs to the current user
    notification = frappe.get_doc("Notification Log", notification_name)

    if notification.for_user != user:
        frappe.throw("You are not authorized to update this notification")

    # Mark as read
    notification.read = 1
    notification.save(ignore_permissions=True)

    return {"success": True, "message": "Notification marked as read"}


@frappe.whitelist()
def mark_all_as_read():
    """
    Mark all notifications as read for the current session user
    """
    user = frappe.session.user

    if not user:
        frappe.throw("User not logged in")

    # Update all unread notifications for the current user
    frappe.db.set_value(
        "Notification Log",
        {"for_user": user, "read": 0},
        "read",
        1,
        update_modified=True
    )

    frappe.db.commit()

    return {"success": True, "message": "All notifications marked as read"}
