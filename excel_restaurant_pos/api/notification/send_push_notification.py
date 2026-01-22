import frappe
from frappe import _


@frappe.whitelist()
def send_push_notification():
    """
    Send push notifications to users based on their roles using Expo Push Notifications
    Also saves the notification to system notification log for all users

    Required parameters:
    - roles: JSON array of role names to send notification to
    - title: Notification title
    - body: Notification body/message

    Optional parameters:
    - data: JSON object with additional data to send with the notification
    - sound: Sound to play (default: "default")
    - badge: Badge count to show
    - priority: Notification priority (default: "default", options: "default", "normal", "high")
    - document_type: Related document type (for system notification)
    - document_name: Related document name (for system notification)
    """
    try:
        from exponent_server_sdk import (
            DeviceNotRegisteredError,
            PushClient,
            PushMessage,
            PushServerError,
            PushTicketError,
        )
    except ImportError:
        frappe.throw(
            "Expo Server SDK not installed. Please install using: pip install exponent_server_sdk"
        )

    current_user = frappe.session.user

    if not current_user:
        frappe.throw("User not logged in")

    # Get parameters
    roles = frappe.form_dict.get("roles")
    title = frappe.form_dict.get("title")
    body = frappe.form_dict.get("body")
    data = frappe.form_dict.get("data")
    sound = frappe.form_dict.get("sound", "default")
    badge = frappe.form_dict.get("badge")
    priority = frappe.form_dict.get("priority", "default")
    document_type = frappe.form_dict.get("document_type")
    document_name = frappe.form_dict.get("document_name")

    # Validate required parameters
    if not roles:
        frappe.throw("Roles are required")

    if not title:
        frappe.throw("Title is required")

    if not body:
        frappe.throw("Body is required")

    # Parse roles if string
    if isinstance(roles, str):
        roles = frappe.parse_json(roles)

    if not isinstance(roles, list):
        frappe.throw("Roles must be a list")

    if not roles:
        frappe.throw("Roles list cannot be empty")

    # Parse data if string
    if data and isinstance(data, str):
        data = frappe.parse_json(data)

    # Find all users with the specified roles
    users = frappe.db.sql(
        """
        SELECT DISTINCT user
        FROM `tabHas Role`
        WHERE role IN %(roles)s
        AND user NOT IN ('Administrator', 'Guest')
        """,
        {"roles": roles},
        as_dict=True
    )

    if not users:
        frappe.throw(f"No users found with roles: {', '.join(roles)}")

    user_emails = [user.user for user in users]

    # Get Expo tokens for the users from ArcPOS Notification Token
    tokens = frappe.get_all(
        "ArcPOS Notification Token",
        filters={"user": ["in", user_emails]},
        fields=["user", "token"]
    )

    if not tokens:
        frappe.throw("No Expo tokens found for users with the specified roles")

    # Prepare push notification messages
    push_messages = []
    token_to_user_map = {}

    for token_doc in tokens:
        if token_doc.token:
            # Validate Expo push token format
            if not PushClient.is_exponent_push_token(token_doc.token):
                frappe.log_error(
                    f"Invalid Expo token for user {token_doc.user}: {token_doc.token}",
                    "Invalid Expo Token"
                )
                continue

            # Create push message
            push_message = PushMessage(
                to=token_doc.token,
                title=title,
                body=body,
                data=data or {},
                sound=sound,
                priority=priority
            )

            if badge:
                push_message.badge = int(badge)

            push_messages.append(push_message)
            token_to_user_map[token_doc.token] = token_doc.user

    if not push_messages:
        frappe.throw("No valid Expo tokens found for the specified users")

    # Send push notifications
    push_client = PushClient()
    sent_count = 0
    failed_notifications = []
    invalid_tokens = []

    try:
        # Send notifications in chunks (Expo recommends max 100 per request)
        chunk_size = 100
        for i in range(0, len(push_messages), chunk_size):
            chunk = push_messages[i:i + chunk_size]

            try:
                responses = push_client.publish_multiple(chunk)

                # Process responses
                for response, message in zip(responses, chunk):
                    try:
                        response.validate_response()
                        sent_count += 1
                    except DeviceNotRegisteredError:
                        # Token is no longer valid, mark for removal
                        invalid_tokens.append({
                            "user": token_to_user_map.get(message.to),
                            "token": message.to,
                            "reason": "Device not registered"
                        })
                    except PushTicketError as exc:
                        failed_notifications.append({
                            "user": token_to_user_map.get(message.to),
                            "token": message.to,
                            "reason": exc.message
                        })
            except PushServerError as exc:
                frappe.log_error(
                    f"Push server error: {str(exc)}",
                    "Expo Push Notification Error"
                )
                failed_notifications.append({
                    "chunk": i // chunk_size + 1,
                    "reason": str(exc)
                })

    except Exception as exc:
        frappe.log_error(
            f"Error sending push notifications: {str(exc)}",
            "Expo Push Notification Error"
        )
        frappe.throw(f"Error sending push notifications: {str(exc)}")

    # Save system notifications for all users
    notification_names = []
    for user_email in user_emails:
        try:
            notification = frappe.get_doc({
                "doctype": "Notification Log",
                "for_user": user_email,
                "from_user": current_user,
                "subject": title,
                "email_content": body,
                "document_type": document_type,
                "document_name": document_name,
                "type": "Alert",
                "read": 0
            })
            notification.insert(ignore_permissions=True)
            notification_names.append(notification.name)
        except Exception as e:
            frappe.log_error(
                f"Error saving system notification for user {user_email}: {str(e)}",
                "System Notification Error"
            )

    # Clean up invalid tokens (optional - uncomment if you want to auto-remove)
    # for invalid in invalid_tokens:
    #     if invalid.get("user"):
    #         frappe.db.delete("ArcPOS Notification Token", {"user": invalid["user"]})

    return {
        "success": True,
        "message": f"Push notifications sent to {sent_count} out of {len(push_messages)} devices",
        "total_users": len(user_emails),
        "total_tokens": len(tokens),
        "valid_tokens": len(push_messages),
        "sent_count": sent_count,
        "failed_count": len(failed_notifications),
        "invalid_tokens_count": len(invalid_tokens),
        "failed_notifications": failed_notifications,
        "invalid_tokens": invalid_tokens,
        "system_notifications_created": len(notification_names),
        "notification_names": notification_names
    }
