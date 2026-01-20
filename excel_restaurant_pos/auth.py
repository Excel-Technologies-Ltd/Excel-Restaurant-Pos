import frappe
from frappe import _


def validate():
    """
    Authentication hook to validate JWT tokens for all API requests
    This runs before every request to validate authentication
    """
    # Skip validation for guest-allowed endpoints and login
    if frappe.session.user != "Guest":
        # User already authenticated (e.g., via session)
        return

    # Get Authorization header
    auth_header = frappe.get_request_header("Authorization")

    if not auth_header:
        # No Authorization header - let Frappe handle it normally
        return

    # Expected format: "Bearer <token>"
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        # Invalid format - skip
        return

    token = parts[1]

    try:
        # Import here to avoid circular imports
        from excel_restaurant_pos.utils.jwt_auth import verify_token

        # Verify token and get user
        payload = verify_token(token, token_type="access")
        user = payload.get("user")

        if not user:
            raise frappe.AuthenticationError(_("Invalid token payload"))

        # Validate user exists and is enabled
        if not frappe.db.exists("User", user):
            raise frappe.AuthenticationError(_("User does not exist"))

        user_doc = frappe.get_cached_doc("User", user)
        if user_doc.enabled == 0:
            raise frappe.AuthenticationError(_("User is disabled"))

        # Set user directly in session without calling frappe.set_user()
        # frappe.set_user() clears form_dict, which would remove query parameters
        frappe.local.session.user = user
        frappe.local.session.sid = user
        frappe.local.user_type = user_doc.user_type

        # Initialize user permissions
        frappe.local.role_permissions = {}
        frappe.local.new_doc_templates = {}
        frappe.local.user_perms = None

    except frappe.AuthenticationError:
        # Re-raise authentication errors
        raise
    except Exception as e:
        # Log unexpected errors but don't block the request
        frappe.log_error(f"JWT validation error: {str(e)}", "JWT Auth Error")
        # Let Frappe's default auth handle it
        pass
