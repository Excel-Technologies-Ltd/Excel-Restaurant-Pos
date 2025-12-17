import frappe
from frappe import _
from frappe.utils import now_datetime, today
from frappe.utils.password import update_password as frappe_update_password
from frappe.rate_limiter import rate_limit
from excel_restaurant_pos.utils.error_handler import throw_error, ErrorCode, success_response
import pyotp
from base64 import b32encode
from jinja2 import Template
import os
import hashlib
from excel_restaurant_pos.shared.arcpos_settings.system_settings import default_system_settings
from excel_restaurant_pos.shared.email_templates.get_template import template_by_name




# Configuration constants
OTP_EXPIRY_SECONDS = 600  # 10 minutes
MAX_OTP_ATTEMPTS = 5
RATE_LIMIT_REQUESTS = 3
RATE_LIMIT_WINDOW = 3600  # 1 hour




def get_cache_key(token, prefix="forgot_password_otp"):
   return f"{prefix}:{token}"




def get_blacklist_key(token):
   token_hash = hashlib.sha256(token.encode()).hexdigest()
   return f"forgot_password_blacklist:{token_hash}"




def is_token_blacklisted(token):
   blacklist_key = get_blacklist_key(token)
   return frappe.cache().get_value(blacklist_key) is not None




def blacklist_token(token, ttl_seconds=None):
   if ttl_seconds is None:
       ttl_seconds = OTP_EXPIRY_SECONDS


   blacklist_key = get_blacklist_key(token)
   frappe.cache().set_value(blacklist_key, "1", expires_in_sec=ttl_seconds)




@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=RATE_LIMIT_REQUESTS, seconds=RATE_LIMIT_WINDOW)
def send_forgot_password_otp(email):
   # Validate email
   if not email:
       throw_error(
           ErrorCode.MISSING_REQUIRED_FIELD,
           _("Email is required"),
           http_status_code=400
       )


   # Check if user exists and is enabled
   user = frappe.db.get_value("User", {"email": email, "enabled": 1}, ["name", "email"], as_dict=True)


   if not user:
       # Don't reveal if user exists or not for security
       # Return success but don't send email
       return success_response(
           message=_("If this email exists in our system, you will receive an OTP shortly.")
       )


   # Don't send OTP to Administrator
   if user.name == "Administrator":
       throw_error(
           ErrorCode.UNAUTHORIZED,
           _("Password reset is not allowed for Administrator"),
           http_status_code=403
       )


   # Generate OTP secret
   otp_secret = b32encode(os.urandom(10)).decode("utf-8")


   # Generate 6-digit OTP using HOTP
   hotp = pyotp.HOTP(otp_secret)
   counter = int(now_datetime().timestamp())
   otp = hotp.at(counter)


   # Generate token (unique identifier for this reset request)
   token = frappe.generate_hash(length=32)


   # Store OTP data in Redis cache with expiry
   cache_key = get_cache_key(token)
   otp_data = {
       "email": user.email,
       "otp": otp,
       "otp_secret": otp_secret,
       "counter": counter,
       "attempts": 0,
       "created_at": str(now_datetime()),
       "used": False
   }


   frappe.cache().set_value(cache_key, otp_data, expires_in_sec=OTP_EXPIRY_SECONDS)


   # Send OTP via email
   try:
       send_otp_email(user.email, otp)
   except Exception as e:
       frappe.log_error(f"Failed to send OTP email: {str(e)}", "Forgot Password OTP Email Error")
       throw_error(
           ErrorCode.OPERATION_FAILED,
           _("Failed to send OTP email. Please try again later."),
           http_status_code=500
       )


   return success_response(
       message=_("An OTP has been sent to your email address. Please check your inbox."),
       data={
           "token": token,
           "expires_in": OTP_EXPIRY_SECONDS
       }
   )




@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=RATE_LIMIT_REQUESTS * 2, seconds=RATE_LIMIT_WINDOW)
def verify_forgot_password_otp(email, otp, token):
   """
   Verify OTP for password reset.


   Args:
       email (str): User's email address
       otp (str): OTP code sent to email
       token (str): Token received from send_forgot_password_otp


   Returns:
       dict: Verification success response
   """
   # Validate inputs
   if not email or not otp or not token:
       throw_error(
           ErrorCode.MISSING_REQUIRED_FIELD,
           _("Email, OTP, and token are required"),
           http_status_code=400
       )


   # Check if token is blacklisted
   if is_token_blacklisted(token):
       throw_error(
           ErrorCode.TOKEN_REVOKED,
           _("This token has been revoked. Please request a new OTP."),
           http_status_code=401
       )


   # Get OTP data from cache
   cache_key = get_cache_key(token)
   otp_data = frappe.cache().get_value(cache_key)


   if not otp_data:
       throw_error(
           ErrorCode.TOKEN_EXPIRED,
           _("Invalid or expired token. Please request a new OTP."),
           http_status_code=401
       )


   # Check if email matches
   if otp_data.get("email") != email:
       throw_error(
           ErrorCode.INVALID_INPUT,
           _("Invalid token for this email address"),
           http_status_code=400
       )


   # Check if OTP was already used
   if otp_data.get("used"):
       throw_error(
           ErrorCode.TOKEN_REVOKED,
           _("This OTP has already been used. Please request a new one."),
           http_status_code=401
       )


   # Check attempt limit
   if otp_data.get("attempts", 0) >= MAX_OTP_ATTEMPTS:
       # Clear the cache and blacklist token
       frappe.cache().delete_value(cache_key)
       blacklist_token(token)


       throw_error(
           ErrorCode.UNAUTHORIZED,
           _("Maximum verification attempts exceeded. Please request a new OTP."),
           http_status_code=403
       )


   # Increment attempts
   otp_data["attempts"] = otp_data.get("attempts", 0) + 1
   frappe.cache().set_value(cache_key, otp_data, expires_in_sec=OTP_EXPIRY_SECONDS)


   # Verify OTP
   if str(otp_data.get("otp")) != str(otp):
       remaining_attempts = MAX_OTP_ATTEMPTS - otp_data["attempts"]
       throw_error(
           ErrorCode.INVALID_CREDENTIALS,
           _("Invalid OTP. {0} attempts remaining.").format(remaining_attempts),
           http_status_code=401,
           remaining_attempts=remaining_attempts
       )


   # OTP verified successfully
   # Mark as verified in cache
   otp_data["verified"] = True
   otp_data["verified_at"] = str(now_datetime())
   frappe.cache().set_value(cache_key, otp_data, expires_in_sec=OTP_EXPIRY_SECONDS)


   return success_response(
       message=_("OTP verified successfully. You can now reset your password."),
       data={"verified": True}
   )






@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=RATE_LIMIT_REQUESTS, seconds=RATE_LIMIT_WINDOW)
def reset_password_with_otp(email, otp, token, new_password):
   """
   Reset password after OTP verification.


   Args:
       email (str): User's email address
       otp (str): OTP code sent to email
       token (str): Token received from send_forgot_password_otp
       new_password (str): New password to set


   Returns:
       dict: Reset success response with redirect URL
   """
   # Validate inputs
   if not email or not otp or not token or not new_password:
       throw_error(
           ErrorCode.MISSING_REQUIRED_FIELD,
           _("All fields are required"),
           http_status_code=400
       )


  
   # Check if token is blacklisted
   if is_token_blacklisted(token):
       throw_error(
           ErrorCode.TOKEN_REVOKED,
           _("This token has been revoked. Please request a new OTP."),
           http_status_code=401
       )


   # Get OTP data from cache
   cache_key = get_cache_key(token)
   otp_data = frappe.cache().get_value(cache_key)


   if not otp_data:
       throw_error(
           ErrorCode.TOKEN_EXPIRED,
           _("Invalid or expired token. Please request a new OTP."),
           http_status_code=401
       )


   # Check if email matches
   if otp_data.get("email") != email:
       throw_error(
           ErrorCode.INVALID_INPUT,
           _("Invalid token for this email address"),
           http_status_code=400
       )
      


   # Check if OTP was already used
   if otp_data.get("used"):
       throw_error(
           ErrorCode.TOKEN_REVOKED,
           _("This OTP has already been used. Please request a new one."),
           http_status_code=401
       )


   # Check if OTP is verified
   if not otp_data.get("verified"):
       throw_error(
           ErrorCode.UNAUTHORIZED,
           _("OTP not verified. Please verify the OTP first."),
           http_status_code=403
       )


   # Verify OTP again for security
   if str(otp_data.get("otp")) != str(otp):
       throw_error(
           ErrorCode.INVALID_CREDENTIALS,
           _("Invalid OTP"),
           http_status_code=401
       )


   # Check if user exists
   user = frappe.db.get_value("User", {"email": email, "enabled": 1}, "name")
   if not user:
       throw_error(
           ErrorCode.RESOURCE_NOT_FOUND,
           _("User not found or disabled"),
           http_status_code=404
       )


   # Update password
   try:
       frappe_update_password(user, new_password, logout_all_sessions=1)


       # Update last password reset date
       frappe.db.set_value("User", user, "last_password_reset_date", today())
       frappe.db.commit()


       # Mark OTP as used in cache
       otp_data["used"] = True
       otp_data["used_at"] = str(now_datetime())
       frappe.cache().set_value(cache_key, otp_data, expires_in_sec=60)  # Keep for 1 minute


       # Blacklist the token to prevent reuse
       blacklist_token(token, ttl_seconds=OTP_EXPIRY_SECONDS)


       # Log the password reset
       frappe.logger().info(f"Password reset successful for user: {user}")


       # Get user type for redirect
       user_doc = frappe.get_doc("User", user)
       redirect_url = "/app" if user_doc.user_type == "System User" else "/"


       return success_response(
           message=_("Password reset successful. You can now login with your new password."),
           data={"redirect_url": redirect_url}
       )


   except frappe.exceptions.ValidationError as e:
       # Password policy validation failed
       throw_error(
           ErrorCode.INVALID_INPUT,
           str(e),
           http_status_code=400
       )
   except Exception as e:
       frappe.log_error(f"Password reset error: {str(e)}", "Forgot Password Reset Error")
       throw_error(
           ErrorCode.OPERATION_FAILED,
           _("Failed to reset password. Please try again."),
           http_status_code=500
       )




def send_otp_email(email, otp):
   """
   Send OTP to user's email.


   Args:
       email (str): User's email address
       otp (str): OTP code to send
   """
   # Get user details
   user = frappe.db.get_value("User", {"email": email}, ["first_name", "last_name"], as_dict=True)
  
   # Prepare template arguments
   args = {
       "first_name": user.first_name if user else "",
       "last_name": user.last_name if user else "",
       "otp": otp,
       "expiry_minutes": int(OTP_EXPIRY_SECONDS / 60),
   }
   try:
       template_name = default_system_settings().forgot_password_template
       template = template_by_name(template_name)
       html_content = Template(template.response_html).render(args)
       subject = template.subject or _("Password Reset OTP ")
   except Exception as e:
       # Fallback to default email content if template not found
       html_content = f"""
       <p>Dear {args['first_name']} {args['last_name']},</p>
       <p>You have requested to reset your password for your account on <strong>{args['site_name']}</strong>.</p>
       <p>Your One-Time Password (OTP) is:</p>
       <h2>{args['otp']}</h2>
       <p>This OTP is valid for the next {args['expiry_minutes']} minutes.</p>
       <p>If you did not request a password reset, please ignore this email.</p>
      
       """


   frappe.sendmail(
       recipients=email,
       subject=subject,
       message=html_content,
       header=[_("Password Reset OTP"), "blue"],
       delayed=False,
       retry=3,
       now=True
   )




@frappe.whitelist(allow_guest=True, methods=["POST"])
def resend_forgot_password_otp(token):
   """
   Resend OTP for an existing token.


   Args:
       token (str): Token received from send_forgot_password_otp


   Returns:
       dict: Success response
   """
   # Check if token is blacklisted
   if is_token_blacklisted(token):
       throw_error(
           ErrorCode.TOKEN_REVOKED,
           _("This token has been revoked. Please request a new OTP."),
           http_status_code=401
       )


   # Get OTP data from cache
   cache_key = get_cache_key(token)
   otp_data = frappe.cache().get_value(cache_key)


   if not otp_data:
       throw_error(
           ErrorCode.TOKEN_EXPIRED,
           _("Invalid or expired token. Please request a new OTP."),
           http_status_code=401
       )


   # Check if OTP was already used
   if otp_data.get("used"):
       throw_error(
           ErrorCode.TOKEN_REVOKED,
           _("This OTP has already been used. Please request a new one."),
           http_status_code=401
       )


   email = otp_data.get("email")
   otp = otp_data.get("otp")


   # Send OTP via email
   try:
       send_otp_email(email, otp)
   except Exception as e:
       frappe.log_error(f"Failed to resend OTP email: {str(e)}", "Forgot Password Resend OTP Error")
       throw_error(
           ErrorCode.OPERATION_FAILED,
           _("Failed to resend OTP email. Please try again later."),
           http_status_code=500
       )


   return success_response(
       message=_("OTP has been resent to your email address.")
   )


