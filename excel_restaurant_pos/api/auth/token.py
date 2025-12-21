import frappe
from frappe import _
from excel_restaurant_pos.utils.jwt_auth import (
    verify_token,
    generate_access_token,
    generate_refresh_token,
    remove_user_session,
    revoke_specific_sessions
)
from excel_restaurant_pos.utils.error_handler import throw_error, ErrorCode, success_response
import jwt


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


@frappe.whitelist()
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
        # Decode tokens without full verification to get user and iat
        # This allows logout even with expired tokens
        try:
            refresh_payload = jwt.decode(refresh_token, options={"verify_signature": False})
            user = refresh_payload.get("user")
            refresh_iat = refresh_payload.get("iat")
        except:
            # If we can't even decode the token, still return success
            return success_response(message=_("Logged out successfully"))

        if not user:
            return success_response(message=_("Logged out successfully"))

        frappe.logger().info(f"Logout - Revoking tokens for user: {user}")

        # Revoke the specific session from active sessions tracking
        if access_token:
            try:
                access_payload = jwt.decode(access_token, options={"verify_signature": False})
                access_iat = access_payload.get("iat")

                if access_iat:
                    # Remove from active sessions list
                    remove_user_session(user, access_iat)

                    # Add to revoked sessions list
                    revoke_specific_sessions(user, [access_iat])

                    frappe.logger().info(f"Logout - Revoked access token session: {access_iat}")
            except Exception as e:
                frappe.logger().warning(f"Failed to revoke access token session: {str(e)}")

        return success_response(
            message=_("Logged out successfully")
        )

    except Exception as e:
        frappe.logger().error(f"Token revocation error: {str(e)}")
        # Still return success for logout - we don't want to prevent users from logging out
        return success_response(
            message=_("Logged out successfully")
        )
