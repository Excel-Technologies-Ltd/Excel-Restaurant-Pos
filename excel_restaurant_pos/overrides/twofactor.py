import frappe
import pyotp
from frappe import _
from jinja2 import Template
from excel_restaurant_pos.shared.email_templates.get_template import template_by_name
from excel_restaurant_pos.shared.arcpos_settings.system_settings import default_system_settings


def send_token_via_email(user, token, otp_secret, otp_issuer, subject=None, message=None):
    """Custom 2FA email sender with custom template."""

    # If subject and message are provided, use the original behavior (for QR code emails)
    if subject and message:
        return _send_email_with_content(user, subject, message)

    user_email = frappe.db.get_value("User", user, "email")
    if not user_email:
        return False

    # Generate actual OTP from secret and token (counter)
    hotp = pyotp.HOTP(otp_secret)
    otp = hotp.at(int(token))

    user_doc = frappe.db.get_value("User", user, ["first_name", "last_name"], as_dict=True)
    site_name = frappe.local.site or frappe.db.get_single_value("System Settings", "otp_issuer_name") or "Our Platform"

    args = {
        "first_name": user_doc.first_name if user_doc else "",
        "last_name": user_doc.last_name if user_doc else "",
        "otp": otp,
        "otp_issuer": otp_issuer,
        "site_name": site_name,
    }

    try:
        # Try to get custom template from system settings
        template_name = default_system_settings().two_factor_auth_template
        template = template_by_name(template_name)
        html_content = Template(template.response_html).render(args)
        email_subject = template.subject or _("Login Verification Code from {0}").format(otp_issuer)
    except Exception:
        # Fallback to default email content
        email_subject = _("Login Verification Code from {0}").format(otp_issuer)
        html_content = f"""
        <p>Dear {args['first_name']},</p>
        <p>Enter this code to complete your login:</p>
        <h2 style="font-size: 24px; letter-spacing: 4px;">{otp}</h2>
        <p>This code will expire shortly.</p>
        <p>If you did not request this code, please ignore this email.</p>
        """

    frappe.sendmail(
        recipients=user_email,
        subject=email_subject,
        message=html_content,
        header=[_("Verification Code"), "blue"],
        delayed=False,
        retry=3,
    )
    return True


def _send_email_with_content(user, subject, message):
    """Send email with provided subject and message (for QR code emails)."""
    user_email = frappe.db.get_value("User", user, "email")
    if not user_email:
        return False

    frappe.sendmail(
        recipients=user_email,
        subject=subject,
        message=message,
        header=[_("Verification Code"), "blue"],
        delayed=False,
        retry=3,
    )
    return True