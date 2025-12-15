import frappe
from frappe import _
from frappe.utils.password import check_password
from excel_restaurant_pos.utils.jwt_auth import generate_access_token, generate_refresh_token
from excel_restaurant_pos.utils.error_handler import throw_error, ErrorCode, success_response


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

	# Get user roles
	user_permissions = frappe.get_roles(user)

	# Generate secure JWT tokens
	access_token = generate_access_token(user, expires_in_hours=24)
	refresh_token = generate_refresh_token(user, expires_in_days=30)

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
   
