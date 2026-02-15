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

        # When status changes from Pending to Confirmed
        if old_status == "Pending" and new_status == "Confirmed":
            self.confirmed_by = frappe.session.user
            self.confirmed_on = now_datetime()
            self.send_confirmation_email()

        # When status changes to Rejected
        elif new_status == "Rejected":
            self.send_rejection_email()

        # When status changes to Rescheduled
        elif new_status == "Rescheduled":
            self.send_reschedule_email()

    def send_confirmation_email(self):
        """Send confirmation email to guest."""
        try:
            # Get ArcPOS Settings
            settings = frappe.get_single("ArcPOS Settings")

            # Check if template is configured
            if not settings.reservation_confirmation_template:
                frappe.log_error(
                    "Reservation confirmation email template not configured in ArcPOS Settings",
                    "Table Reservation - No Template"
                )
                return

            # Get email template
            template = frappe.get_doc("Email Template", settings.reservation_confirmation_template)

            # Prepare template arguments
            template_args = {
                "doc": self,
                "guest_name": self.guest_name,
                "reservation_date": frappe.utils.format_date(self.reservation_date, "dd MMM yyyy"),
                "reservation_time": frappe.utils.format_time(self.reservation_time),
                "number_of_guests": self.number_of_guests,
                "special_requests": self.special_requests or "None",
            }

            # Render email
            subject = frappe.render_template(template.subject, template_args)
            message = frappe.render_template(template.response_html or template.response, template_args)

            # Send email
            frappe.sendmail(
                recipients=[self.email],
                subject=subject,
                message=message,
                header=None,
                now=True
            )

            # Update tracking fields
            self.db_set("confirmation_email_sent", 1, update_modified=False)
            self.db_set("confirmation_sent_on", now_datetime(), update_modified=False)

            frappe.msgprint(_("Confirmation email sent to {0}").format(self.email))

        except Exception as e:
            frappe.log_error(
                f"Error sending confirmation email for reservation {self.name}: {str(e)}",
                "Table Reservation - Confirmation Email Error"
            )

    def send_rejection_email(self):
        """Send rejection email to guest."""
        try:
            # Get ArcPOS Settings
            settings = frappe.get_single("ArcPOS Settings")

            # Check if template is configured
            if not settings.reservation_rejection_template:
                frappe.log_error(
                    "Reservation rejection email template not configured in ArcPOS Settings",
                    "Table Reservation - No Template"
                )
                return

            # Get email template
            template = frappe.get_doc("Email Template", settings.reservation_rejection_template)

            # Prepare template arguments
            template_args = {
                "doc": self,
                "guest_name": self.guest_name,
                "reservation_date": frappe.utils.format_date(self.reservation_date, "dd MMM yyyy"),
                "reservation_time": frappe.utils.format_time(self.reservation_time),
                "number_of_guests": self.number_of_guests,
            }

            # Render email
            subject = frappe.render_template(template.subject, template_args)
            message = frappe.render_template(template.response_html or template.response, template_args)

            # Send email
            frappe.sendmail(
                recipients=[self.email],
                subject=subject,
                message=message,
                header=None,
                now=True
            )

            frappe.msgprint(_("Rejection email sent to {0}").format(self.email))

        except Exception as e:
            frappe.log_error(
                f"Error sending rejection email for reservation {self.name}: {str(e)}",
                "Table Reservation - Rejection Email Error"
            )

    def send_reschedule_email(self):
        """Send reschedule notification email to guest."""
        try:
            # Get ArcPOS Settings
            settings = frappe.get_single("ArcPOS Settings")

            # Check if template is configured
            if not settings.reservation_reschedule_template:
                frappe.log_error(
                    "Reservation reschedule email template not configured in ArcPOS Settings",
                    "Table Reservation - No Template"
                )
                return

            # Get email template
            template = frappe.get_doc("Email Template", settings.reservation_reschedule_template)

            # Prepare template arguments
            template_args = {
                "doc": self,
                "guest_name": self.guest_name,
                "reservation_date": frappe.utils.format_date(self.reservation_date, "dd MMM yyyy"),
                "reservation_time": frappe.utils.format_time(self.reservation_time),
                "number_of_guests": self.number_of_guests,
                "special_requests": self.special_requests or "None",
            }

            # Render email
            subject = frappe.render_template(template.subject, template_args)
            message = frappe.render_template(template.response_html or template.response, template_args)

            # Send email
            frappe.sendmail(
                recipients=[self.email],
                subject=subject,
                message=message,
                header=None,
                now=True
            )

            frappe.msgprint(_("Reschedule email sent to {0}").format(self.email))

        except Exception as e:
            frappe.log_error(
                f"Error sending reschedule email for reservation {self.name}: {str(e)}",
                "Table Reservation - Reschedule Email Error"
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
