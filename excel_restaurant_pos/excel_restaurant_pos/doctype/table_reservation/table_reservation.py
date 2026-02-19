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
