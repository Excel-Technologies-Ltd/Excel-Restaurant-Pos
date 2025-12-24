import frappe
from frappe import _
from frappe.utils import random_string, now
from jinja2 import Template
import json
from excel_restaurant_pos.shared.arcpos_settings.system_settings import default_system_settings
from excel_restaurant_pos.shared.email_templates.get_template import template_by_name

@frappe.whitelist(allow_guest=True)
def sign_up(email, full_name, password, redirect_to=None):
    """Register user with OTP verification"""

    # Check if user already exists
    if frappe.db.exists("User", email):
        user = frappe.db.get_value("User", email, ["enabled"], as_dict=True)
        if user.enabled:
            return {
                "success": False,
                "message": _("User already registered")
            }
        else:
            return {
                "success": False,
                "message": _("User registered but not verified. Please contact administrator.")
            }

    # Rate limiting check
    if frappe.db.sql("""select count(*) from tabUser where
        HOUR(TIMEDIFF(CURRENT_TIMESTAMP, TIMESTAMP(modified))) < 1""")[0][0] > 300:
        return {
            "success": False,
            "message": _("Too many sign-ups recently. Please try again later.")
        }

    # Generate unique verification key and OTP
    verification_key = frappe.generate_hash(length=32)
    otp = str(random_string(6)).upper()  # 6-digit alphanumeric OTP

    # Store user data in cache for 5 minutes (300 seconds)
    cache_data = {
        "email": email,
        "full_name": full_name,
        "password": password,
        "redirect_to": redirect_to,
        "otp": otp,
        "created_at": now()
    }

    cache_key = f"signup_verification:{verification_key}"
    frappe.cache().set_value(cache_key, json.dumps(cache_data), expires_in_sec=300)

    # Send OTP via email
    send_otp_email(email, full_name, otp)

    return {
        "success": True,
        "message": _("OTP sent to your email. Please verify within 5 minutes."),
        "verification_key": verification_key
    }


def send_otp_email(email, full_name, otp):
    """Send OTP verification email"""
    first_name = full_name.split()[0] if full_name else email.split('@')[0]

    # Try to get custom email template
    try:
        template_name = default_system_settings().registration_template
        template = template_by_name(template_name)
        # Render the template with OTP
        html_content = Template(template.response_html).render({
            "otp": otp,
            "first_name": first_name,
            "email": email
        })

        subject = template.subject or _("Verify Your Email - OTP")
    except:
        # Fallback to simple email if template doesn't exist
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p>Hi {first_name},</p>
            <p>Your OTP for email verification is:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #667eea; letter-spacing: 5px; margin: 0;">{otp}</h1>
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            
        </div>
        """
        subject = _("Verify Your Email - OTP")

    frappe.sendmail(
        recipients=email,
        subject=subject,
        message=html_content,
        header=[_("Email Verification"), "blue"],
        delayed=False,
        retry=3,
        now=True
    )


@frappe.whitelist(allow_guest=True)
def verify_otp(verification_key, otp):
    """Verify OTP and create user account"""

    # Get cached data
    cache_key = f"signup_verification:{verification_key}"
    cached_data = frappe.cache().get_value(cache_key)

    print(cached_data)

    if not cached_data:
        return {
            "success": False,
            "message": _("Verification link expired or invalid. Please sign up again.")
        }

    # Parse cached data
    try:
        user_data = json.loads(cached_data)
    except:
        return {
            "success": False,
            "message": _("Invalid verification data. Please sign up again.")
        }

    # Verify OTP (case-insensitive)
    if user_data.get("otp", "").upper() != otp.upper():
        return {
            "success": False,
            "message": _("Invalid OTP. Please try again.")
        }

    # Create user account
    try:
        user = frappe.get_doc({
            "doctype": "User",
            "email": user_data["email"],
            "first_name": user_data["full_name"],
            "enabled": 1,  # User is enabled after OTP verification
            "new_password": user_data["password"],
            "user_type": "Website User"
        })
        user.flags.ignore_permissions = True
        user.flags.ignore_password_policy = True
        user.flags.no_welcome_mail = True
        user.insert()

        # Set default role from Portal Settings
        role_name = frappe.db.get_single_value("ArcPOS System Settings", "user_default_role") or "Customer"
        user.add_roles(role_name, 'Sales User')
        

        selling_settings = frappe.get_single("Selling Settings")


        # Check is customer exist or not, if not create a customer with the provided user information
        if not frappe.db.exists("Customer", {"email_id": user.email}):
            customer = frappe.get_doc({
                "doctype": "Customer",
                "customer_name": user.full_name,
                "email_id": user.email,
                "customer_type": "Individual",
                "customer_group": selling_settings.customer_group or "All Customer Groups",
                "territory": selling_settings.territory or "All Territories"
            })
            customer.flags.ignore_permissions = True
            details = customer.insert()
            # set User Permission to restrict user to only see their own customer record
            frappe.get_doc({
                "doctype": "User Permission",
                "user": user.name,
                "allow": "Customer",
                "for_value": details.name,
                "is_default": 1,
                "apply_to_all_doctypes": 1
            }).insert(ignore_permissions=True)

            frappe.get_doc({
                "doctype": "User Permission",
                "user": user.name,
                "allow": "User",
                "for_value": user.email,
                "is_default": 1,
                "apply_to_all_doctypes": 1
            }).insert(ignore_permissions=True)

        # Clear cache
        frappe.cache().delete_value(cache_key)

        # Set redirect URL if provided
        redirect_url = user_data.get("redirect_to") or "/app"

        return {
            "success": True,
            "message": _("Account verified successfully! You can now login."),
            "email": user.email,
            "redirect_to": redirect_url
        }

    except Exception as e:
        frappe.log_error(f"User creation failed: {str(e)}", "OTP Verification Error")
        print(e)
        print("Error creating user", str(e))
        return {
            "success": False,
            "message": _("Failed to create account. Please try again or contact support.")
        }


@frappe.whitelist(allow_guest=True)
def resend_otp(verification_key):
    """Resend OTP for verification"""

    # Get cached data
    cache_key = f"signup_verification:{verification_key}"
    cached_data = frappe.cache().get_value(cache_key)

    if not cached_data:
        return {
            "success": False,
            "message": _("Verification session expired. Please sign up again.")
        }

    try:
        user_data = json.loads(cached_data)
    except:
        return {
            "success": False,
            "message": _("Invalid verification data. Please sign up again.")
        }

    # Generate new OTP
    new_otp = str(random_string(6)).upper()
    user_data["otp"] = new_otp
    user_data["created_at"] = now()

    # Update cache with new OTP and reset expiry to 5 minutes
    frappe.cache().set_value(cache_key, json.dumps(user_data), expires_in_sec=300)

    # Send new OTP
    send_otp_email(user_data["email"], user_data["full_name"], new_otp)

    return {
        "success": True,
        "message": _("New OTP sent to your email.")
    }
