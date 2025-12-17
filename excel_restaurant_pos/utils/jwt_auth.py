import frappe
from frappe import _
import jwt
from datetime import datetime, timedelta
from functools import wraps
import hashlib


def get_jwt_secret():
    """Get JWT secret from site config or generate one"""
    secret = frappe.conf.get("jwt_secret_key")
    if not secret:
        frappe.throw(_("JWT secret key not configured. Please add 'jwt_secret_key' to site_config.json"))
    return secret


def generate_access_token(user, expires_in_hours=24):
    """
    Generate JWT access token for user

    Args:
        user: User email/username
        expires_in_hours: Token expiry time in hours (default 24)

    Returns:
        JWT token string
    """
    payload = {
        "user": user,
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours),
        "iat": datetime.utcnow(),
        "type": "access"
    }

    token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
    return token


def generate_refresh_token(user, expires_in_days=30):
    """
    Generate JWT refresh token for user

    Args:
        user: User email/username
        expires_in_days: Token expiry time in days (default 30)

    Returns:
        JWT refresh token string
    """
    payload = {
        "user": user,
        "exp": datetime.utcnow() + timedelta(days=expires_in_days),
        "iat": datetime.utcnow(),
        "type": "refresh"
    }

    token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
    return token


def get_token_hash(token):
    """
    Generate SHA256 hash of token for blacklist storage

    Args:
        token: JWT token string

    Returns:
        str: SHA256 hash of token
    """
    return hashlib.sha256(token.encode()).hexdigest()


def is_token_blacklisted(token):
    """
    Check if token is in blacklist

    Args:
        token: JWT token string

    Returns:
        bool: True if token is blacklisted
    """
    token_hash = get_token_hash(token)
    return frappe.db.exists("Token Blacklist", {"token_hash": token_hash})


def verify_token(token, token_type="access"):
    """
    Verify and decode JWT token

    Args:
        token: JWT token string
        token_type: Expected token type ('access' or 'refresh')

    Returns:
        dict: Decoded token payload

    Raises:
        frappe.AuthenticationError: If token is invalid or expired
    """
    try:
        # Check if token is blacklisted
        if is_token_blacklisted(token):
            frappe.throw(_("Token has been revoked"), frappe.AuthenticationError)

        # Check if token was revoked (for single session enforcement)
        if is_token_revoked(token):
            frappe.throw(_("Token has been revoked due to new login"), frappe.AuthenticationError)

        payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])

        # Verify token type
        if payload.get("type") != token_type:
            frappe.throw(_("Invalid token type"), frappe.AuthenticationError)

        return payload

    except jwt.ExpiredSignatureError:
        frappe.throw(_("Token has expired"), frappe.AuthenticationError)
    except jwt.InvalidTokenError:
        frappe.throw(_("Invalid token"), frappe.AuthenticationError)


def jwt_required(fn):
    """
    Decorator to protect API endpoints with JWT authentication

    Usage:
        @frappe.whitelist(allow_guest=True)
        @jwt_required
        def my_protected_endpoint():
            user = frappe.session.user
            # ... endpoint logic
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Get token from Authorization header
        auth_header = frappe.get_request_header("Authorization")

        if not auth_header:
            frappe.throw(_("Authorization header missing"), frappe.AuthenticationError)

        # Expected format: "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            frappe.throw(_("Invalid authorization header format. Use: Bearer <token>"), frappe.AuthenticationError)

        token = parts[1]

        # Verify token and get user
        payload = verify_token(token, token_type="access")
        user = payload.get("user")

        if not user:
            frappe.throw(_("Invalid token payload"), frappe.AuthenticationError)

        # Set user in session
        frappe.set_user(user)

        return fn(*args, **kwargs)

    return wrapper


def get_user_from_token(token):
    """
    Extract user from JWT token without setting session

    Args:
        token: JWT token string

    Returns:
        str: User email
    """
    payload = verify_token(token, token_type="access")
    return payload.get("user")


def blacklist_token(token, user, token_type="refresh"):
    """
    Add token to blacklist

    Args:
        token: JWT token string
        user: User email
        token_type: Token type ('access' or 'refresh')

    Returns:
        bool: True if successfully blacklisted
    """
    try:
        # Decode token to get expiry
        payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
        expires_at = datetime.fromtimestamp(payload.get("exp"))

        token_hash = get_token_hash(token)

        # Check if already blacklisted
        if frappe.db.exists("Token Blacklist", {"token_hash": token_hash}):
            return True

        # Add to blacklist
        blacklist_doc = frappe.get_doc({
            "doctype": "Token Blacklist",
            "token_hash": token_hash,
            "user": user,
            "token_type": token_type,
            "expires_at": expires_at,
            "revoked_at": datetime.now()
        })
        blacklist_doc.insert(ignore_permissions=True)
        frappe.db.commit()

        return True

    except Exception as e:
        frappe.log_error(f"Failed to blacklist token: {str(e)}", "Token Blacklist Error")
        return False


def cleanup_expired_blacklist():
    """
    Remove expired tokens from blacklist
    This should be run periodically via a scheduled job
    """
    try:
        # Delete tokens that expired more than 7 days ago
        cutoff_date = datetime.now() - timedelta(days=7)

        frappe.db.sql("""
            DELETE FROM `tabToken Blacklist`
            WHERE expires_at < %s
        """, (cutoff_date,))

        frappe.db.commit()

        return True

    except Exception as e:
        frappe.log_error(f"Failed to cleanup blacklist: {str(e)}", "Blacklist Cleanup Error")
        return False


def revoke_all_user_tokens(user):
    """
    Revoke all active JWT tokens for a user (for single session enforcement)
    Uses Redis cache to store revocation timestamp

    Args:
        user: User email

    Returns:
        bool: True if successful
    """
    try:
        # Store current timestamp as the revocation time
        # All tokens issued before this time will be considered invalid
        revocation_time = int(datetime.utcnow().timestamp())
        cache_key = f"jwt_revoke_before:{user}"

        # Store in cache with 30 days expiry (max refresh token lifetime)
        frappe.cache().set_value(cache_key, revocation_time, expires_in_sec=30 * 24 * 60 * 60)

        return True

    except Exception as e:
        frappe.log_error(f"Failed to revoke user tokens: {str(e)}", "Token Revocation Error")
        return False


def is_token_revoked(token):
    """
    Check if token was issued before user's revocation timestamp

    Args:
        token: JWT token string

    Returns:
        bool: True if token is revoked
    """
    try:
        # Decode token without verification to get user and issued time
        payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"], options={"verify_signature": False})
        user = payload.get("user")
        issued_at = payload.get("iat")

        if not user or not issued_at:
            return False

        # Get user's revocation timestamp
        cache_key = f"jwt_revoke_before:{user}"
        revoke_before = frappe.cache().get_value(cache_key)

        if not revoke_before:
            return False

        # Token is revoked if it was issued before the revocation time
        return issued_at < revoke_before

    except Exception as e:
        frappe.log_error(f"Error checking token revocation: {str(e)}", "Token Revocation Check Error")
        return False
