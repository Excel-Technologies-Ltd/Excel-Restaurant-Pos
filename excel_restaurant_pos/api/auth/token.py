import frappe
from frappe import _
from excel_restaurant_pos.utils.jwt_auth import (
    verify_token,
    generate_access_token,
    generate_refresh_token,
    blacklist_token
)
from excel_restaurant_pos.utils.error_handler import throw_error, ErrorCode, success_response


@frappe.whitelist(allow_guest=True)
def refresh(refresh_token):
    """
    Refresh access token using refresh token

    Args:
        refresh_token: Valid JWT refresh token

    Returns:
        dict: New access token and optionally new refresh token
    """
    try:
        # Verify refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        user = payload.get("user")

        if not user:
            throw_error(
                ErrorCode.TOKEN_INVALID,
                _("Invalid refresh token"),
                http_status_code=401
            )

        # Verify user still exists and is enabled
        if not frappe.db.exists("User", user):
            throw_error(
                ErrorCode.RESOURCE_NOT_FOUND,
                _("User not found"),
                http_status_code=404
            )

        user_enabled = frappe.db.get_value("User", user, "enabled")
        if not user_enabled:
            throw_error(
                ErrorCode.UNAUTHORIZED,
                _("User account is disabled"),
                http_status_code=403
            )

        # Generate new access token
        new_access_token = generate_access_token(user)

        # Optionally generate new refresh token (recommended for security)
        new_refresh_token = generate_refresh_token(user)

        return success_response(
            message=_("Token refreshed successfully"),
            data={
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "token_type": "Bearer",
                "expires_in": 86400  # 24 hours in seconds
            }
        )

    except frappe.AuthenticationError as e:
        throw_error(
            ErrorCode.TOKEN_INVALID,
            str(e),
            http_status_code=401
        )
    except Exception as e:
        frappe.log_error(f"Token refresh failed: {str(e)}", "Token Refresh Error")
        throw_error(
            ErrorCode.INTERNAL_ERROR,
            _("Token refresh failed"),
            http_status_code=500
        )


@frappe.whitelist(allow_guest=True)
def revoke(refresh_token, access_token=None):
    """
    Revoke refresh token and optionally access token (logout)

    Args:
        refresh_token: Refresh token to revoke (required)
        access_token: Access token to revoke (optional but recommended)

    Returns:
        dict: Success status
    """
    try:
        # Verify and decode refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        user = payload.get("user")

        # Blacklist the refresh token
        blacklist_token(refresh_token, user, token_type="refresh")

        # If access token provided, blacklist it too
        if access_token:
            try:
                blacklist_token(access_token, user, token_type="access")
            except Exception as e:
                # Log error but don't fail the logout
                frappe.log_error(f"Failed to blacklist access token: {str(e)}", "Token Revoke Warning")

        return success_response(
            message=_("Logged out successfully")
        )

    except frappe.AuthenticationError:
        # Even if token is invalid/expired, consider logout successful
        # This handles cases where user is trying to logout with expired tokens
        return success_response(
            message=_("Logged out successfully")
        )
    except Exception as e:
        frappe.log_error(f"Token revocation failed: {str(e)}", "Token Revoke Error")
        throw_error(
            ErrorCode.OPERATION_FAILED,
            _("Logout failed"),
            http_status_code=500
        )
