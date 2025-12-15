"""
Error Handler Utility for Excel Restaurant POS
Provides standardized error responses with error codes and messages
"""

import frappe
from frappe import _


class ErrorCode:
	"""Standard error codes for the application"""

	# Authentication Errors (1000-1999)
	INVALID_CREDENTIALS = 1001
	TOKEN_EXPIRED = 1002
	TOKEN_REVOKED = 1003
	TOKEN_INVALID = 1004
	UNAUTHORIZED = 1005
	SESSION_EXPIRED = 1006

	# Validation Errors (2000-2999)
	MISSING_REQUIRED_FIELD = 2001
	INVALID_INPUT = 2002
	DUPLICATE_ENTRY = 2003
	INVALID_FORMAT = 2004

	# Resource Errors (3000-3999)
	RESOURCE_NOT_FOUND = 3001
	RESOURCE_ALREADY_EXISTS = 3002
	RESOURCE_LOCKED = 3003

	# Permission Errors (4000-4999)
	PERMISSION_DENIED = 4001
	INSUFFICIENT_PRIVILEGES = 4002

	# Business Logic Errors (5000-5999)
	OPERATION_FAILED = 5001
	INVALID_STATE = 5002
	TRANSACTION_FAILED = 5003

	# System Errors (6000-6999)
	INTERNAL_ERROR = 6001
	SERVICE_UNAVAILABLE = 6002
	DATABASE_ERROR = 6003


def throw_error(error_code, message=None, exception_type=None, http_status_code=None, **kwargs):
	"""
	Throw a standardized error with error code and message

	Args:
		error_code (int): Error code from ErrorCode class
		message (str, optional): Custom error message. If not provided, uses default message for error code
		exception_type (Exception, optional): Type of exception to raise (default: frappe.ValidationError)
		http_status_code (int, optional): HTTP status code to return
		**kwargs: Additional context data to include in error response

	Example:
		throw_error(ErrorCode.INVALID_CREDENTIALS, "Invalid username or password")
		throw_error(ErrorCode.TOKEN_EXPIRED, http_status_code=401)
		throw_error(ErrorCode.RESOURCE_NOT_FOUND, "Customer not found", resource="Customer", id="CUST-001")
	"""

	# Default error messages
	default_messages = {
		# Authentication
		ErrorCode.INVALID_CREDENTIALS: _("Invalid username or password"),
		ErrorCode.TOKEN_EXPIRED: _("Authentication token has expired"),
		ErrorCode.TOKEN_REVOKED: _("Token has been revoked"),
		ErrorCode.TOKEN_INVALID: _("Invalid authentication token"),
		ErrorCode.UNAUTHORIZED: _("Unauthorized access"),
		ErrorCode.SESSION_EXPIRED: _("Session has expired. Please login again"),

		# Validation
		ErrorCode.MISSING_REQUIRED_FIELD: _("Required field is missing"),
		ErrorCode.INVALID_INPUT: _("Invalid input provided"),
		ErrorCode.DUPLICATE_ENTRY: _("Duplicate entry found"),
		ErrorCode.INVALID_FORMAT: _("Invalid format"),

		# Resource
		ErrorCode.RESOURCE_NOT_FOUND: _("Resource not found"),
		ErrorCode.RESOURCE_ALREADY_EXISTS: _("Resource already exists"),
		ErrorCode.RESOURCE_LOCKED: _("Resource is locked"),

		# Permission
		ErrorCode.PERMISSION_DENIED: _("Permission denied"),
		ErrorCode.INSUFFICIENT_PRIVILEGES: _("Insufficient privileges"),

		# Business Logic
		ErrorCode.OPERATION_FAILED: _("Operation failed"),
		ErrorCode.INVALID_STATE: _("Invalid state"),
		ErrorCode.TRANSACTION_FAILED: _("Transaction failed"),

		# System
		ErrorCode.INTERNAL_ERROR: _("Internal server error"),
		ErrorCode.SERVICE_UNAVAILABLE: _("Service unavailable"),
		ErrorCode.DATABASE_ERROR: _("Database error occurred"),
	}

	# Default exception types based on error code range
	default_exception_types = {
		range(1000, 2000): frappe.AuthenticationError,  # Authentication errors
		range(2000, 3000): frappe.ValidationError,       # Validation errors
		range(3000, 4000): frappe.DoesNotExistError,    # Resource errors
		range(4000, 5000): frappe.PermissionError,       # Permission errors
		range(5000, 6000): frappe.ValidationError,       # Business logic errors
		range(6000, 7000): frappe.ValidationError,       # System errors
	}

	# Get message
	error_message = message or default_messages.get(error_code, _("An error occurred"))

	# Get exception type
	if not exception_type:
		for error_range, exc_type in default_exception_types.items():
			if error_code in error_range:
				exception_type = exc_type
				break
		if not exception_type:
			exception_type = frappe.ValidationError

	# Build error response
	error_data = {
		"error_code": error_code,
		"message": error_message,
		**kwargs
	}

	# Set HTTP status code if provided
	if http_status_code:
		frappe.local.response['http_status_code'] = http_status_code

	# Set structured error data in response
	frappe.local.response['error_data'] = error_data
	frappe.local.response.pop("exc", None)

	frappe.throw(error_message, exception_type)


def success_response(message="Success", data=None, **kwargs):
	"""
	Return a standardized success response

	Args:
		message (str): Success message
		data (dict, optional): Response data
		**kwargs: Additional context data to include in response

	Returns:
		dict: Standardized success response

	Example:
		return success_response("Customer created successfully", data={"customer_id": "CUST-001"})
	"""
	response = {
		"success": True,
		"message": message,
	}

	if data is not None:
		response["data"] = data

	# Add any additional kwargs
	response.update(kwargs)

	return response


def error_response(error_code, message=None, http_status_code=None, **kwargs):
	"""
	Return a standardized error response without throwing exception
	Useful for returning errors in API responses without halting execution

	Args:
		error_code (int): Error code from ErrorCode class
		message (str, optional): Custom error message
		http_status_code (int, optional): HTTP status code to return
		**kwargs: Additional context data to include in error response

	Returns:
		dict: Standardized error response

	Example:
		return error_response(ErrorCode.INVALID_CREDENTIALS, "Invalid username", http_status_code=401)
	"""

	# Default error messages (same as throw_error)
	default_messages = {
		ErrorCode.INVALID_CREDENTIALS: _("Invalid username or password"),
		ErrorCode.TOKEN_EXPIRED: _("Authentication token has expired"),
		ErrorCode.TOKEN_REVOKED: _("Token has been revoked"),
		ErrorCode.TOKEN_INVALID: _("Invalid authentication token"),
		ErrorCode.UNAUTHORIZED: _("Unauthorized access"),
		ErrorCode.SESSION_EXPIRED: _("Session has expired. Please login again"),
		ErrorCode.MISSING_REQUIRED_FIELD: _("Required field is missing"),
		ErrorCode.INVALID_INPUT: _("Invalid input provided"),
		ErrorCode.DUPLICATE_ENTRY: _("Duplicate entry found"),
		ErrorCode.INVALID_FORMAT: _("Invalid format"),
		ErrorCode.RESOURCE_NOT_FOUND: _("Resource not found"),
		ErrorCode.RESOURCE_ALREADY_EXISTS: _("Resource already exists"),
		ErrorCode.RESOURCE_LOCKED: _("Resource is locked"),
		ErrorCode.PERMISSION_DENIED: _("Permission denied"),
		ErrorCode.INSUFFICIENT_PRIVILEGES: _("Insufficient privileges"),
		ErrorCode.OPERATION_FAILED: _("Operation failed"),
		ErrorCode.INVALID_STATE: _("Invalid state"),
		ErrorCode.TRANSACTION_FAILED: _("Transaction failed"),
		ErrorCode.INTERNAL_ERROR: _("Internal server error"),
		ErrorCode.SERVICE_UNAVAILABLE: _("Service unavailable"),
		ErrorCode.DATABASE_ERROR: _("Database error occurred"),
	}

	# Get message
	error_message = message or default_messages.get(error_code, _("An error occurred"))

	# Set HTTP status code if provided
	if http_status_code:
		frappe.local.response['http_status_code'] = http_status_code

	# Build error response
	response = {
		"success": False,
		"error_code": error_code,
		"message": error_message,
		**kwargs
	}

	return response
