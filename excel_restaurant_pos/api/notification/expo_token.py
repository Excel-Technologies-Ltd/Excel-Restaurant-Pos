import frappe
from frappe import _


@frappe.whitelist()
def add_token(token=None):
    """
    Add the notification token for the current user.

    Required parameters:
    - token: The new notification token
    """
    current_user = frappe.session.user

    if not current_user:
        frappe.throw("User not logged in")

    token = frappe.form_dict.get("token")

    if not token:
        frappe.throw("Token is required")

    # Check if user exists in ArcPOS Notification Token
    if frappe.db.exists("ArcPOS Notification Token", {"user": current_user}):
        # User exists, get the document
        doc = frappe.get_doc("ArcPOS Notification Token", current_user)

        # Check if token already exists in token_list
        existing_tokens = [row.token for row in doc.token_list]

        if token not in existing_tokens:
            # Token doesn't exist, add it
            doc.append("token_list", {"token": token})
            doc.save(ignore_permissions=True)
            return {"message": _("Token added successfully")}
        else:
            return {"message": _("Token already exists")}
    else:
        # User doesn't exist, create new document
        doc = frappe.new_doc("ArcPOS Notification Token")
        doc.user = current_user
        doc.append("token_list", {"token": token})
        doc.insert(ignore_permissions=True)
        return {"message": _("Token created successfully")}
    

@frappe.whitelist()
def remove_token(token=None):
    """
    Remove the notification token for the current user.

    Required parameters:
    - token: The notification token to be removed
    """
    current_user = frappe.session.user

    if not current_user:
        frappe.throw("User not logged in")

    token = frappe.form_dict.get("token")

    if not token:
        frappe.throw("Token is required")

    # Check if user exists in ArcPOS Notification Token
    if frappe.db.exists("ArcPOS Notification Token", {"user": current_user}):
        # User exists, get the document
        doc = frappe.get_doc("ArcPOS Notification Token", current_user)

        # Find and remove the token from token_list
        for row in doc.token_list:
            if row.token == token:
                doc.token_list.remove(row)
                doc.save(ignore_permissions=True)
                return {"message": _("Token removed successfully")}

        return {"message": _("Token not found")}
    else:
        return {"message": _("No tokens found for user")}    
