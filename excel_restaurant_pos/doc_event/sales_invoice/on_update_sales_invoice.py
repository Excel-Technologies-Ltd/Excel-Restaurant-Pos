"""Document event handlers for Sales Invoice on_update event."""

import frappe
from frappe import _
from frappe.utils import now_datetime, add_to_date


def on_update_sales_invoice(doc, method: str):
    """
    Send push notifications based on ArcPOS Settings configuration
    when Sales Invoice is updated.

    This handler:
    1. Gets push notification permissions from ArcPOS Settings
    2. Checks each rule against the current document
    3. Sends push and system notifications to users with matching roles
    """
    try:
        # Prevent duplicate notifications using Redis cache
        # Key is based on doc name only (modified timestamp can differ between on_update and on_change)
        cache_key = f"arcpos_notification_processing_{doc.name}"
        if frappe.cache().get_value(cache_key):
            print(f"Notification already being processed for {doc.name}, skipping duplicate trigger")
            return

        # Mark as processing with 5 second TTL (short window to catch duplicate hook triggers)
        frappe.cache().set_value(cache_key, True, expires_in_sec=5)

        # Check if ArcPOS Settings exists
        print("\n\n on_update_sales_invoice called \n\n")
        if not frappe.db.exists("ArcPOS Settings", "ArcPOS Settings"):
            frappe.log_error(
                "ArcPOS Settings not found",
                "Push Notification - Settings Missing"
            )
            return

        # Get ArcPOS Settings
        settings = frappe.get_doc("ArcPOS Settings", "ArcPOS Settings")

        # Check if there are any notification rules configured
        if not settings.role_wise_permission:
            frappe.log_error(
                "No push notification rules configured in ArcPOS Settings",
                "Push Notification - No Rules"
            )
            return

        # Log document details for debugging
        print(f"Processing notifications for Sales Invoice: {doc.name}")
        print(f"Order From: {doc.get('custom_order_from')}")
        print(f"Order Status: {doc.get('custom_order_status')}")
        print(f"Service Type: {doc.get('custom_service_type')}")
        print(f"Order Type: {doc.get('custom_order_type')}")

        # Process each notification rule
        matched_rules = 0
        for rule in settings.role_wise_permission:
            if should_send_notification(doc, rule):
                matched_rules += 1
                print(f"Rule matched for role: {rule.if_role}")
                # Enqueue notification sending to avoid blocking the save
                print(f"Enqueueing notification job for {doc.name} role {rule.if_role}...")
                job = frappe.enqueue(
                    send_notification_to_role_async,
                    queue="short",
                    timeout=300,
                    sales_invoice_name=doc.name,
                    rule_data={
                        "if_role": rule.if_role,
                        "if_order_from": rule.if_order_from,
                        "if_order_status": rule.if_order_status,
                        "if_service_type": rule.if_service_type,
                        "if_order_type": rule.if_order_type,
                    }
                )
                print(f"Job enqueued: {job}")
                # Log to Error Log for production visibility
                frappe.log_error(
                    f"Notification job enqueued for {doc.name}, role: {rule.if_role}, job: {job}",
                    "Push Notification - Job Enqueued"
                )

        if matched_rules == 0:
            print(f"No notification rules matched for Sales Invoice: {doc.name}")

    except Exception as e:
        frappe.log_error(
            f"Error in on_update_sales_invoice: {str(e)}\nDocument: {doc.name}",
            "Push Notification Error"
        )


def should_send_notification(doc, rule):
    """
    Check if the current document matches the notification rule conditions.

    Args:
        doc: Sales Invoice document
        rule: ArcPOS Push Notification child table row or dict

    Returns:
        bool: True if all conditions match, False otherwise
    """
    # Get rule values (support both dict and object)
    if_role = rule.get("if_role") if isinstance(rule, dict) else rule.if_role
    if_order_from = rule.get("if_order_from") if isinstance(rule, dict) else rule.if_order_from
    if_order_status = rule.get("if_order_status") if isinstance(rule, dict) else rule.if_order_status
    if_service_type = rule.get("if_service_type") if isinstance(rule, dict) else rule.if_service_type
    if_order_type = rule.get("if_order_type") if isinstance(rule, dict) else rule.if_order_type

    # Check if role is specified
    if not if_role:
        print("No role specified in rule, skipping")
        return False

    # Check Order From condition
    if if_order_from:
        doc_order_from = doc.get("custom_order_from") or ""
        # Support comma-separated values - all are valid
        allowed_order_from = [x.strip() for x in if_order_from.split(",") if x.strip()]
        if doc_order_from not in allowed_order_from:
            print(f"Order From mismatch: {doc_order_from} not in {allowed_order_from}")
            return False

    # Check Order Status condition
    if if_order_status:
        doc_order_status = doc.get("custom_order_status") or ""
        # Support comma-separated values - all are valid
        allowed_statuses = [x.strip() for x in if_order_status.split(",") if x.strip()]
        if doc_order_status not in allowed_statuses:
            print(f"Order Status mismatch: {doc_order_status} not in {allowed_statuses}")
            return False

    # Check Service Type condition
    if if_service_type:
        doc_service_type = doc.get("custom_service_type") or ""
        # Support comma-separated values - all are valid
        allowed_service_types = [x.strip() for x in if_service_type.split(",") if x.strip()]
        if doc_service_type not in allowed_service_types:
            print(f"Service Type mismatch: {doc_service_type} not in {allowed_service_types}")
            return False

    # Check Order Type condition
    if if_order_type:
        doc_order_type = doc.get("custom_order_type") or ""
        # Support comma-separated values - all are valid
        allowed_order_types = [x.strip() for x in if_order_type.split(",") if x.strip()]
        if doc_order_type not in allowed_order_types:
            print(f"Order Type mismatch: {doc_order_type} not in {allowed_order_types}")
            return False

    # All conditions matched
    print(f"All conditions matched for role: {if_role}")
    return True


def send_notification_to_role_async(sales_invoice_name, rule_data):
    """
    Async wrapper for sending notifications (called from queue).

    Args:
        sales_invoice_name: Name of the Sales Invoice document
        rule_data: Dictionary containing rule data
    """
    # Log immediately when worker picks up the job
    role = rule_data.get("if_role", "unknown")
    print(f"\n\n=== ASYNC NOTIFICATION START ===")
    print(f"Sales Invoice: {sales_invoice_name}")
    print(f"Rule: {rule_data}")
    frappe.log_error(
        f"Worker started processing notification for {sales_invoice_name}, role: {role}",
        "Push Notification - Worker Started"
    )

    try:
        # Deduplication check at async level using cache
        async_cache_key = f"arcpos_async_notification_{sales_invoice_name}_{role}"
        if frappe.cache().get_value(async_cache_key):
            print(f"Async notification already processed for {sales_invoice_name} role {role}, skipping")
            frappe.log_error(
                f"Skipping duplicate: {sales_invoice_name}, role: {role}",
                "Push Notification - Duplicate Skipped"
            )
            return

        # Mark as processed with 30 second TTL
        frappe.cache().set_value(async_cache_key, True, expires_in_sec=30)

        # Get the document
        doc = frappe.get_doc("Sales Invoice", sales_invoice_name)
        print(f"Document loaded successfully: {doc.name}")

        # Send notifications
        send_notification_to_role(doc, rule_data)

        # Commit the transaction
        frappe.db.commit()
        print(f"=== ASYNC NOTIFICATION SUCCESS ===\n\n")
        frappe.log_error(
            f"Notification sent successfully for {sales_invoice_name}, role: {role}",
            "Push Notification - Success"
        )
    except Exception as e:
        print(f"!!! ERROR in send_notification_to_role_async: {str(e)}")
        import traceback
        print(traceback.format_exc())
        frappe.log_error(
            f"Error in send_notification_to_role_async: {str(e)}\nDocument: {sales_invoice_name}\nRule: {rule_data}\n\n{traceback.format_exc()}",
            "Push Notification Error"
        )
        frappe.db.rollback()


def send_notification_to_role(doc, rule):
    """
    Send push notification and system notification to users with the specified role.

    Args:
        doc: Sales Invoice document
        rule: ArcPOS Push Notification child table row or dict
    """
    # Get rule values (support both dict and object)
    if_role = rule.get("if_role") if isinstance(rule, dict) else rule.if_role
    print(f"\n--- Sending notification for role: {if_role} ---")

    try:
        # Find all users with the specified role
        users = frappe.db.sql(
            """
            SELECT DISTINCT parent as user
            FROM `tabHas Role`
            WHERE role = %(role)s
            AND parent NOT IN ('Administrator', 'Guest')
            """,
            {"role": if_role},
            as_dict=True
        )

        if not users:
            print(f"!!! No users found with role: {if_role}")
            frappe.log_error(
                f"No users found with role: {if_role}",
                "Push Notification - No Users"
            )
            return

        user_emails = [user.user for user in users]
        print(f"Found {len(user_emails)} users with role {if_role}: {user_emails}")

        # Prepare notification content
        title = get_notification_title(doc, rule)
        body = get_notification_body(doc, rule)
        print(f"Notification Title: {title}")
        print(f"Notification Body: {body}")

        # ALWAYS save system notifications for all users (even if they don't have tokens)
        # Track users who actually received notifications (for push notification deduplication)
        users_notified = []

        print(f"\n Sending SYSTEM NOTIFICATIONS to {len(user_emails)} users:")
        system_notifications_sent = 0
        for user_email in user_emails:
            print(f"  → Attempting to send system notification to: {user_email}")
            try:
                # Check if notification already exists for this user/document in last 30 seconds
                thirty_seconds_ago = add_to_date(now_datetime(), seconds=-30)

                existing_notification = frappe.db.exists(
                    "Notification Log",
                    {
                        "for_user": user_email,
                        "document_type": "Sales Invoice",
                        "document_name": doc.name,
                        "creation": [">=", thirty_seconds_ago]
                    }
                )

                if existing_notification:
                    print(f"    ⊘ SKIPPED: Recent notification already exists for: {user_email}")
                    continue

                notification = frappe.get_doc({
                    "doctype": "Notification Log",
                    "for_user": user_email,
                    "from_user": frappe.session.user,
                    "subject": title,
                    "email_content": body,
                    "document_type": "Sales Invoice",
                    "document_name": doc.name,
                    "type": "Alert",
                    "read": 0
                })
                notification.insert(ignore_permissions=True)
                system_notifications_sent += 1
                users_notified.append(user_email)  # Track this user for push notifications
                frappe.publish_realtime('sales_invoice_notification_'+user_email, data = {
                    'title': title,
                    'body': body,
                    'document_type': 'Sales Invoice',
                    'document_name': doc.name
                },
                )
                print(f"    ✓ SUCCESS: System notification saved for: {user_email}")
            except Exception as e:
                print(f"    ✗ FAILED: Error saving system notification for {user_email}: {str(e)}")
                frappe.log_error(
                    f"Error saving system notification for user {user_email}: {str(e)}",
                    "System Notification Error"
                )

        print(f"\n System notifications sent: {system_notifications_sent}/{len(user_emails)}\n")

        # Skip push notifications if no users received system notifications
        if not users_notified:
            print("No users received new system notifications, skipping push notifications")
            print(f"--- Notification complete (no new notifications) ---\n")
            return

        # Try to send push notifications if Expo SDK is available
        try:
            from exponent_server_sdk import (
                DeviceNotRegisteredError,
                PushClient,
                PushMessage,
                PushServerError,
                PushTicketError,
            )
            has_expo = True
        except ImportError:
            print("Expo Server SDK not installed, skipping push notifications")
            frappe.log_error(
                f"Expo Server SDK not installed. Install with: pip install exponent-server-sdk",
                "Push Notification - SDK Missing"
            )
            has_expo = False

        if not has_expo:
            print(f"--- Notification complete (system only) ---\n")
            return

        # Get Expo tokens only for users who received new system notifications
        token_docs = frappe.get_all(
            "ArcPOS Notification Token",
            filters={"user": ["in", users_notified]},
            fields=["name", "user"]
        )

        print(f"Found {len(token_docs)} users with notification token documents")
        # Log for production debugging
        frappe.logger("push_notification").info(
            f"Push notification for {doc.name}: users_notified={users_notified}, token_docs_count={len(token_docs)}"
        )

        if not token_docs:
            print("  No users with notification tokens found, skipping push notifications")
            frappe.log_error(
                f"No push tokens found for users: {users_notified}. Document: {doc.name}",
                "Push Notification - No Tokens"
            )
            print(f"--- Notification complete (system only) ---\n")
            return

        # Prepare push notification messages
        print(f"\n Preparing PUSH NOTIFICATIONS:")
        push_messages = []
        token_to_user_map = {}

        for token_doc in token_docs:
            print(f"  → Processing tokens for user: {token_doc.user}")

            # Get all tokens from the token_list child table
            user_tokens = frappe.get_all(
                "Push Token List",
                filters={"parent": token_doc.name, "parenttype": "ArcPOS Notification Token"},
                fields=["token"]
            )

            if not user_tokens:
                print(f"    ✗ No tokens found in token_list for: {token_doc.user}")
                continue

            for token_row in user_tokens:
                if token_row.token:
                    # Validate Expo push token format
                    if not PushClient.is_exponent_push_token(token_row.token):
                        print(f"    ✗ INVALID token format for: {token_doc.user}")
                        frappe.log_error(
                            f"Invalid Expo token for user {token_doc.user}: {token_row.token}",
                            "Invalid Expo Token"
                        )
                        continue

                    # Create push message
                    push_message = PushMessage(
                        to=token_row.token,
                        title=title,
                        body=body,
                        data={
                            "document_type": "Sales Invoice",
                            "document_name": doc.name,
                            "order_status": doc.get("custom_order_status") or "",
                            "order_from": doc.get("custom_order_from") or "",
                            "service_type": doc.get("custom_service_type") or "",
                            "order_type": doc.get("custom_order_type") or "",
                        },
                        sound="default",
                        priority="high"
                    )

                    push_messages.append(push_message)
                    token_to_user_map[token_row.token] = token_doc.user
                    print(f"    ✓ Push message prepared for: {token_doc.user}")

        print(f"\n Total push messages to send: {len(push_messages)}")
        # Log for production debugging
        frappe.logger("push_notification").info(
            f"Push messages prepared for {doc.name}: count={len(push_messages)}, users={list(token_to_user_map.values())}"
        )

        # Send push notifications if tokens are available
        if push_messages:
            push_client = PushClient()
            push_sent_count = 0

            print(f"\n Sending push notifications via Expo...")
            frappe.logger("push_notification").info(f"Starting Expo push for {doc.name}")
            try:
                # Send notifications in chunks (Expo recommends max 100 per request)
                chunk_size = 100
                for i in range(0, len(push_messages), chunk_size):
                    chunk = push_messages[i:i + chunk_size]
                    print(f"  → Sending chunk {i//chunk_size + 1} ({len(chunk)} messages)...")

                    try:
                        responses = push_client.publish_multiple(chunk)

                        # Process responses
                        for response, message in zip(responses, chunk):
                            user = token_to_user_map.get(message.to)
                            try:
                                response.validate_response()
                                push_sent_count += 1
                                print(f"      ✓ Push notification SENT to: {user}")
                            except DeviceNotRegisteredError:
                                # Token is no longer valid
                                print(f"      ✗ Device not registered: {user}")
                                frappe.log_error(
                                    f"Device not registered: {user}",
                                    "Push Notification - Invalid Token"
                                )
                            except PushTicketError as exc:
                                print(f"      ✗ Push ticket error for {user}: {exc.message}")
                                frappe.log_error(
                                    f"Push ticket error for {user}: {exc.message}",
                                    "Push Notification Error"
                                )
                    except PushServerError as exc:
                        print(f"      ✗ Push server error: {str(exc)}")
                        frappe.log_error(
                            f"Push server error: {str(exc)}",
                            "Expo Push Notification Error"
                        )
            except Exception as exc:
                print(f"  ✗ Error sending push notifications: {str(exc)}")
                frappe.log_error(
                    f"Error sending push notifications: {str(exc)}",
                    "Expo Push Notification Error"
                )

            print(f"\n Push notifications sent: {push_sent_count}/{len(push_messages)}")
            # Log result for production debugging
            frappe.logger("push_notification").info(
                f"Push result for {doc.name}: sent={push_sent_count}/{len(push_messages)}"
            )
        else:
            print("  No valid push messages to send")
            frappe.log_error(
                f"No valid push messages to send for {doc.name}. Token docs: {token_docs}",
                "Push Notification - No Messages"
            )

        print(f"\n=== Notification complete (system + push) ===\n")

    except Exception as e:
        rule_dict = rule if isinstance(rule, dict) else rule.as_dict()
        frappe.log_error(
            f"Error in send_notification_to_role: {str(e)}\nDocument: {doc.name}\nRule: {rule_dict}",
            "Push Notification Error"
        )


def get_notification_title(doc, rule):
    """
    Generate notification title based on the document.

    Args:
        doc: Sales Invoice document
        rule: ArcPOS Push Notification child table row

    Returns:
        str: Notification title
    """
    order_status = doc.get("custom_order_status") or "Updated"
    return f"Order {order_status}: {doc.name}"


def get_notification_body(doc, rule):
    """
    Generate notification body based on the document.

    Args:
        doc: Sales Invoice document
        rule: ArcPOS Push Notification child table row

    Returns:
        str: Notification body
    """
    parts = []

    # Add customer name
    if doc.customer:
        parts.append(f"Customer: {doc.customer}")

    # Add order details
    order_from = doc.get("custom_order_from")
    if order_from:
        parts.append(f"Order From: {order_from}")

    service_type = doc.get("custom_service_type")
    if service_type:
        parts.append(f"Service: {service_type}")

    # Add table info if available
    table_name = doc.get("custom_linked_table")
    if table_name:
        parts.append(f"Table: {table_name}")

    # Add grand total
    if doc.grand_total:
        parts.append(f"Total: {frappe.utils.fmt_money(doc.grand_total, currency=doc.currency)}")

    return " | ".join(parts) if parts else f"Sales Invoice {doc.name} has been updated."
