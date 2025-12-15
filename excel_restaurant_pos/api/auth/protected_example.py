import frappe
from frappe import _
from excel_restaurant_pos.utils.jwt_auth import jwt_required


@frappe.whitelist(allow_guest=True)
@jwt_required
def get_user_profile():
    """
    Example protected endpoint that requires JWT authentication

    Usage:
        Send request with Authorization header:
        Authorization: Bearer <access_token>

    Returns:
        dict: User profile information
    """
    user = frappe.session.user

    user_doc = frappe.get_doc("User", user)

    return {
        "success": True,
        "data": {
            "email": user_doc.email,
            "full_name": user_doc.full_name,
            "user_image": user_doc.user_image,
            "roles": frappe.get_roles(user),
            "enabled": user_doc.enabled,
            "user_type": user_doc.user_type
        }
    }


@frappe.whitelist(allow_guest=True)
@jwt_required
def update_user_profile(full_name=None, mobile_no=None, phone=None):
    """
    Example protected endpoint to update user profile

    Usage:
        Send request with Authorization header:
        Authorization: Bearer <access_token>

    Args:
        full_name: New full name
        mobile_no: New mobile number
        phone: New phone number

    Returns:
        dict: Updated user profile
    """
    user = frappe.session.user

    user_doc = frappe.get_doc("User", user)

    # Update allowed fields
    if full_name:
        user_doc.full_name = full_name
    if mobile_no:
        user_doc.mobile_no = mobile_no
    if phone:
        user_doc.phone = phone

    # Save with flags to avoid validation issues
    user_doc.flags.ignore_validate = True
    user_doc.flags.ignore_permissions = True

    try:
        # Use db.set_value for safer updates
        update_dict = {}
        if full_name:
            update_dict["full_name"] = full_name
        if mobile_no:
            update_dict["mobile_no"] = mobile_no
        if phone:
            update_dict["phone"] = phone

        if update_dict:
            frappe.db.set_value("User", user, update_dict, update_modified=True)
            frappe.db.commit()

        return {
            "success": True,
            "message": _("Profile updated successfully"),
            "data": {
                "email": user_doc.email,
                "full_name": full_name or user_doc.full_name,
                "mobile_no": mobile_no or user_doc.mobile_no,
                "phone": phone or user_doc.phone
            }
        }

    except Exception as e:
        frappe.log_error(f"Profile update failed: {str(e)}", "Profile Update Error")
        return {
            "success": False,
            "message": _("Failed to update profile")
        }
