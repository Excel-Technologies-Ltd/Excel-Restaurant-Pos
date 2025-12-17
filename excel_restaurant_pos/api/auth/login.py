import frappe
from frappe import _
from frappe.utils.password import check_password
from frappe.twofactor import should_run_2fa, authenticate_for_2factor, confirm_otp_token, get_cached_user_pass
from excel_restaurant_pos.utils.jwt_auth import generate_access_token, generate_refresh_token
from excel_restaurant_pos.utils.error_handler import throw_error, ErrorCode, success_response
from excel_restaurant_pos.shared.arcpos_settings.system_settings import default_system_settings


@frappe.whitelist(allow_guest=True)
def login(user, pwd):
	"""Authenticate user with email/username and password using JWT tokens"""

	# Set user to Guest to avoid session resumption issues
	frappe.set_user("Guest")


	# Validate user exists
	if not frappe.db.exists("User", user):
		# frappe.throw("User does not exist", frappe.exceptions.AuthenticationError)
		throw_error(
			ErrorCode.INVALID_CREDENTIALS,
			_("User does not exist"),
			http_status_code=401
		)

	# Validate credentials
	try:
		check_password(user, pwd)
	except frappe.exceptions.AuthenticationError:
		throw_error(
			ErrorCode.INVALID_CREDENTIALS,
			_("Invalid username or password"),
			http_status_code=401
		)

	# Get user document
	user_doc = frappe.get_doc("User", user)

	# Check if user is enabled
	if user_doc.enabled == 0:
		throw_error(
			ErrorCode.UNAUTHORIZED,
			_("User is disabled. Please contact your System Manager."),
			http_status_code=403
		)

	# Check if two-factor authentication is required
	if should_run_2fa(user):
		# Store password in form_dict for 2FA caching (required by Frappe's 2FA system)
		frappe.form_dict.pwd = pwd

		# Store credentials temporarily and trigger 2FA process
		authenticate_for_2factor(user)
		verification_data = frappe.local.response.get("verification", {})
		tmp_id = frappe.local.response.get("tmp_id")

		return success_response(
			message=_("Two-factor authentication required"),
			data={
				"requires_2fa": True,
				"tmp_id": tmp_id,
				"verification": verification_data,
				"email": user
			}
		)

	# Get user roles
	user_permissions = frappe.get_roles(user)


	# Generate secure JWT tokens
	access_token = generate_access_token(user, expires_in_hours=int(default_system_settings().access_token_expiry or 1))
	refresh_token = generate_refresh_token(user, expires_in_days=int(default_system_settings().refresh_token_expiry or 7))

	# Clear session cookies to prevent session issues
	frappe.local.cookie_manager.set_cookie("sid", "", expires="Thu, 01 Jan 1970 00:00:00 GMT")
	frappe.local.cookie_manager.set_cookie("system_user", "", expires="Thu, 01 Jan 1970 00:00:00 GMT")

	return success_response(
		message=_("Logged in successfully"),
		data={
			"full_name": user_doc.full_name,
			"email": user,
			"access_token": access_token,
			"refresh_token": refresh_token,
			"token_type": "Bearer",
			"expires_in": 86400,  # 24 hours in seconds
			"permissions": user_permissions,
		}
	)


@frappe.whitelist(allow_guest=True)
def verify_2fa_and_login(otp, tmp_id):
	"""Verify 2FA OTP and complete login with JWT tokens"""

	# Set user to Guest
	frappe.set_user("Guest")

	# Validate inputs
	if not otp or not tmp_id:
		throw_error(
			ErrorCode.MISSING_REQUIRED_FIELD,
			_("OTP and temporary ID are required"),
			http_status_code=400
		)

	# Set form_dict for get_cached_user_pass to work
	frappe.form_dict.tmp_id = tmp_id
	frappe.form_dict.otp = otp

	# Get cached user credentials
	user, pwd = get_cached_user_pass()

	if not user:
		throw_error(
			ErrorCode.TOKEN_EXPIRED,
			_("Session expired. Please login again."),
			http_status_code=401
		)

	# Validate user exists
	if not frappe.db.exists("User", user):
		throw_error(
			ErrorCode.INVALID_CREDENTIALS,
			_("User does not exist"),
			http_status_code=401
		)

	# Create a mock login manager for OTP verification
	class MockLoginManager:
		def __init__(self, user):
			self.user = user

		def fail(self, message, user):
			throw_error(
				ErrorCode.INVALID_CREDENTIALS,
				message,
				http_status_code=401
			)

	login_manager = MockLoginManager(user)

	# Verify OTP token
	try:
		if not confirm_otp_token(login_manager, otp=otp, tmp_id=tmp_id):
			throw_error(
				ErrorCode.INVALID_CREDENTIALS,
				_("Invalid OTP"),
				http_status_code=401
			)
	except Exception as e:
		frappe.log_error(f"2FA verification failed: {str(e)}", "2FA Verification Error")
		throw_error(
			ErrorCode.INVALID_CREDENTIALS,
			_("Invalid or expired OTP. Please try again."),
			http_status_code=401
		)

	# OTP verified successfully, proceed with login
	user_doc = frappe.get_doc("User", user)

	# Check if user is enabled
	if user_doc.enabled == 0:
		throw_error(
			ErrorCode.UNAUTHORIZED,
			_("User is disabled. Please contact your System Manager."),
			http_status_code=403
		)

	# Get user roles
	user_permissions = frappe.get_roles(user)

	# Generate secure JWT tokens
	access_token = generate_access_token(user, expires_in_hours=int(default_system_settings().access_token_expiry or 1))
	refresh_token = generate_refresh_token(user, expires_in_days=int(default_system_settings().refresh_token_expiry or 7))

	# Clear session cookies to prevent session issues
	frappe.local.cookie_manager.set_cookie("sid", "", expires="Thu, 01 Jan 1970 00:00:00 GMT")
	frappe.local.cookie_manager.set_cookie("system_user", "", expires="Thu, 01 Jan 1970 00:00:00 GMT")

	# Clear cached credentials
	frappe.cache().delete(tmp_id + "_usr")
	frappe.cache().delete(tmp_id + "_pwd")
	frappe.cache().delete(tmp_id + "_otp_secret")

	return success_response(
		message=_("Logged in successfully"),
		data={
			"full_name": user_doc.full_name,
			"email": user,
			"access_token": access_token,
			"refresh_token": refresh_token,
			"token_type": "Bearer",
			"expires_in": 86400,  # 24 hours in seconds
			"permissions": user_permissions,
		}
	)

