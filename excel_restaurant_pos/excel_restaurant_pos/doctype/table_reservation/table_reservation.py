# Copyright (c) 2026, Excel Technologies Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime


class TableReservation(Document):
    def validate(self):
        """Validate reservation details before saving."""
        # Ensure reservation date is not in the past (only for new reservations)
        if self.is_new() and self.reservation_date:
            from frappe.utils import getdate, nowdate
            if getdate(self.reservation_date) < getdate(nowdate()):
                frappe.throw(_("Reservation date cannot be in the past"))

    def after_insert(self):
        """Notify reservation staff when a new reservation is created."""
        if self.requested_from and self.requested_from == "Website":
            frappe.enqueue(
                "excel_restaurant_pos.excel_restaurant_pos.doctype.table_reservation.table_reservation._notify_staff_new_reservation",
                queue="short",
                reservation_name=self.name,
            )

    def on_update(self):
        """Handle status changes and send appropriate notifications."""
        if self.has_value_changed("status"):
            self.handle_status_change()

    def handle_status_change(self):
        """Handle actions when reservation status changes."""
        old_status = self.get_doc_before_save().status if self.get_doc_before_save() else "Pending"
        new_status = self.status

        _method = "excel_restaurant_pos.excel_restaurant_pos.doctype.table_reservation.table_reservation._send_reservation_email"

        # When status changes from Pending to Confirmed
        if old_status == "Pending" and new_status == "Confirmed":
            self.confirmed_by = frappe.session.user
            self.confirmed_on = now_datetime()
            frappe.enqueue(
                _method,
                queue="short",
                reservation_name=self.name,
                email_type="confirmation",
            )

        # When status changes to Rejected
        elif new_status == "Rejected":
            frappe.enqueue(
                _method,
                queue="short",
                reservation_name=self.name,
                email_type="rejection",
            )

        # When status changes to Rescheduled
        elif new_status == "Rescheduled":
            frappe.enqueue(
                _method,
                queue="short",
                reservation_name=self.name,
                email_type="reschedule",
            )



def _notify_staff_new_reservation(reservation_name):
    """Background job: Send Notification Log + Expo push to all ArcPOS Reservation Users.

    Args:
        reservation_name: Table Reservation document name
    """
    try:
        doc = frappe.get_doc("Table Reservation", reservation_name)

        user_emails = list(set(frappe.get_all(
            "Has Role",
            filters={
                "role": "ArcPOS Reservation User",
                "parenttype": "User",
                "parent": ["not in", ["Administrator", "Guest"]],
            },
            pluck="parent",
        )))

        if not user_emails:
            frappe.logger().info(
                f"No ArcPOS Reservation Users found — skipping new reservation notification"
            )
            return

        title = f"New Table Reservation : {doc.name}"
        body = (
            f"#{doc.name} — {doc.guest_name} · "
            f"{frappe.utils.format_date(doc.reservation_date, 'dd MMM yyyy')} "
            f"at {frappe.utils.format_time(doc.reservation_time)} "
            f"for {doc.number_of_guests} guest(s)."
        )

        # 1. Notification Log + realtime for each user
        for user_email in user_emails:
            try:
                frappe.get_doc({
                    "doctype": "Notification Log",
                    "for_user": user_email,
                    "from_user": "Administrator",
                    "subject": title,
                    "email_content": body,
                    "document_type": "Table Reservation",
                    "document_name": doc.name,
                    "type": "Alert",
                    "read": 0,
                }).insert(ignore_permissions=True)
            except Exception as e:
                frappe.log_error(
                    f"Error creating Notification Log for {user_email}: {e}",
                    "Table Reservation - Notification Log Error",
                )

            try:
                frappe.publish_realtime(
                    "new_table_reservation",
                    message={"title": title, "body": body, "reservation": doc.name},
                    user=user_email,
                )
            except Exception:
                pass

        frappe.db.commit()

        # 2. Expo push notifications
        try:
            from exponent_server_sdk import (
                PushClient, PushMessage, PushServerError,
                PushTicketError, DeviceNotRegisteredError,
            )

            token_docs = frappe.get_all(
                "ArcPOS Notification Token",
                filters={"user": ["in", user_emails]},
                fields=["name", "user"],
            )

            push_messages = []
            for token_doc_ref in token_docs:
                token_doc = frappe.get_doc("ArcPOS Notification Token", token_doc_ref.name)
                for token_row in (token_doc.token_list or []):
                    if token_row.token and PushClient.is_exponent_push_token(token_row.token):
                        push_messages.append(
                            PushMessage(
                                to=token_row.token,
                                title=title,
                                body=body,
                                data={
                                    "notification_type": "new_table_reservation",
                                    "reservation": doc.name,
                                },
                                sound="default",
                                priority="high",
                            )
                        )

            if push_messages:
                push_client = PushClient()
                for i in range(0, len(push_messages), 100):
                    chunk = push_messages[i:i + 100]
                    try:
                        responses = push_client.publish_multiple(chunk)
                        for response, msg in zip(responses, chunk):
                            try:
                                response.validate_response()
                            except DeviceNotRegisteredError:
                                pass
                            except PushTicketError as exc:
                                frappe.log_error(
                                    f"Push ticket error for token {msg.to}: {exc}",
                                    "Table Reservation - Push Ticket Error",
                                )
                    except PushServerError as exc:
                        frappe.log_error(
                            f"Expo push server error for {reservation_name}: {exc}",
                            "Table Reservation - Push Server Error",
                        )

                frappe.logger().info(
                    f"Expo push sent for reservation {reservation_name} ({len(push_messages)} token(s))"
                )

        except ImportError:
            frappe.logger().info("Expo SDK not available — skipping push notifications")
        except Exception as e:
            frappe.log_error(
                f"Error sending push notifications for reservation {reservation_name}: {e}",
                "Table Reservation - Push Notification Error",
            )

    except Exception as e:
        frappe.log_error(
            f"Error in _notify_staff_new_reservation for {reservation_name}: {e}",
            "Table Reservation - Staff Notification Error",
        )


# Template setting field names per email type
_EMAIL_TEMPLATES = {
    "confirmation": "reservation_confirmation_template",
    "rejection": "reservation_rejection_template",
    "reschedule": "reservation_reschedule_template",
}


def _send_reservation_email(reservation_name, email_type):
    """Background job: send a reservation email.

    Args:
        reservation_name: Table Reservation document name
        email_type: One of confirmation, rejection, reschedule
    """
    try:
        doc = frappe.get_doc("Table Reservation", reservation_name)
        settings = frappe.get_single("ArcPOS Settings")

        template_field = _EMAIL_TEMPLATES.get(email_type)
        if not template_field or not settings.get(template_field):
            frappe.log_error(
                f"Reservation {email_type} email template not configured in ArcPOS Settings",
                "Table Reservation - No Template",
            )
            return

        template = frappe.get_doc("Email Template", settings.get(template_field))

        template_args = {
            "doc": doc,
            "guest_name": doc.guest_name,
            "reservation_date": frappe.utils.format_date(doc.reservation_date, "dd MMM yyyy"),
            "reservation_time": frappe.utils.format_time(doc.reservation_time),
            "number_of_guests": doc.number_of_guests,
            "special_requests": doc.special_requests or "None",
        }

        subject = frappe.render_template(template.subject, template_args)
        message = frappe.render_template(
            template.response_html or template.response, template_args
        )

        frappe.sendmail(
            recipients=[doc.email],
            subject=subject,
            message=message,
            header=None,
        )

        if email_type == "confirmation":
            doc.db_set("confirmation_email_sent", 1, update_modified=False)
            doc.db_set("confirmation_sent_on", now_datetime(), update_modified=False)

        frappe.logger().info(
            f"Reservation {email_type} email sent for {reservation_name} to {doc.email}"
        )

    except Exception as e:
        frappe.log_error(
            f"Error sending {email_type} email for reservation {reservation_name}: {e}",
            f"Table Reservation - {email_type.title()} Email Error",
        )


def send_24h_reminder_email(reservation_name):
    """
    Send 24-hour reminder email to guest.
    Called from scheduled task.

    Args:
        reservation_name: Name of the Table Reservation document
    """
    try:
        # Get reservation document
        doc = frappe.get_doc("Table Reservation", reservation_name)

        # Check if already sent
        if doc.reminder_email_sent:
            return

        # Check if reservation is still confirmed
        if doc.status != "Confirmed":
            return

        # Get ArcPOS Settings
        settings = frappe.get_single("ArcPOS Settings")

        # Check if template is configured
        if not settings.reservation_reminder_template:
            frappe.log_error(
                "Reservation reminder email template not configured in ArcPOS Settings",
                "Table Reservation - No Template"
            )
            return

        # Get email template
        template = frappe.get_doc("Email Template", settings.reservation_reminder_template)

        # Prepare template arguments
        template_args = {
            "doc": doc,
            "guest_name": doc.guest_name,
            "reservation_date": frappe.utils.format_date(doc.reservation_date, "dd MMM yyyy"),
            "reservation_time": frappe.utils.format_time(doc.reservation_time),
            "number_of_guests": doc.number_of_guests,
            "special_requests": doc.special_requests or "None",
        }

        # Render email
        subject = frappe.render_template(template.subject, template_args)
        message = frappe.render_template(template.response_html or template.response, template_args)

        # Send email
        frappe.sendmail(
            recipients=[doc.email],
            subject=subject,
            message=message,
            header=None,
            now=True
        )

        # Update tracking fields
        doc.db_set("reminder_email_sent", 1, update_modified=False)
        doc.db_set("reminder_sent_on", now_datetime(), update_modified=False)

        frappe.logger().info(f"24h reminder email sent for reservation: {reservation_name}")

    except Exception as e:
        frappe.log_error(
            f"Error sending 24h reminder email for reservation {reservation_name}: {str(e)}",
            "Table Reservation - Reminder Email Error"
        )
