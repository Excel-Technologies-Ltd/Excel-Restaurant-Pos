import frappe
from frappe import _


def get_custom_email_subject_for_2fa(kwargs_dict):
	"""
	Custom email subject for 2FA OTP

	Args:
		kwargs_dict: Dictionary containing 'otp' and 'otp_issuer'

	Returns:
		str: Email subject
	"""
	subject_template = _("Login Verification Code from ArcPos")
	return frappe.render_template(subject_template, kwargs_dict)


def get_custom_email_body_for_2fa(kwargs_dict):
	"""
	Custom email body for 2FA OTP

	Args:
		kwargs_dict: Dictionary containing 'otp' and 'otp_issuer'

	Returns:
		str: Email body HTML
	"""
	otp_issuer = kwargs_dict.get("otp_issuer") or frappe.db.get_single_value("System Settings", "otp_issuer_name")

	# Custom HTML template for 2FA email
	body_template = """
	<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center;">
			<h2 style="color: #333; margin-bottom: 20px;">Verification Code</h2>
			<p style="color: #666; font-size: 16px; margin-bottom: 30px;">
				Enter this code to complete your login to {{ otp_issuer }}:
			</p>
			<div style="background-color: #fff; border: 2px solid #007bff; border-radius: 8px; padding: 20px; display: inline-block;">
				<span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px;">
					{{ otp }}
				</span>
			</div>
			<p style="color: #999; font-size: 14px; margin-top: 30px;">
				This code will expire in 10 minutes.
			</p>
			<p style="color: #999; font-size: 14px; margin-top: 10px;">
				If you didn't request this code, please ignore this email.
			</p>
		</div>
	</div>
	"""

	body = frappe.render_template(body_template, kwargs_dict)
	return body


def get_custom_sms_message_for_2fa(otp):
	"""
	Custom SMS message for 2FA OTP

	Args:
		otp: The OTP code

	Returns:
		str: SMS message
	"""
	otp_issuer = frappe.db.get_single_value("System Settings", "otp_issuer_name") or "ArcPOS"
	return f"Your {otp_issuer} verification code is: {otp}. Valid for 10 minutes."
