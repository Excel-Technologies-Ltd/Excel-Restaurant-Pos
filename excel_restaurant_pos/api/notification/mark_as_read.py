import frappe


@frappe.whitelist()
def mark_as_read():
    """
    Mark a single notification as read for the current session user
    """

    user = frappe.session.user
    notification_name = frappe.form_dict.get("name")
    invoice_name = frappe.form_dict.get("invoice_name")

    if not user:
        frappe.throw("User not logged in")

    if not notification_name:
        frappe.throw("Notification name is required")

    # Get the notification and verify it belongs to the current user
    notification = frappe.get_doc("Notification Log", notification_name)

    if notification.for_user != user:
        frappe.throw("You are not authorized to update this notification")

    # Mark as read
    notification.read = 1
    notification.save(ignore_permissions=True)

    # Prepare response
    response = {"success": True, "message": "Notification marked as read"}

    # Get Sales Invoice Details if invoice_name is provided
    if invoice_name:
        invoice_details = frappe.get_doc("Sales Invoice", invoice_name)

        if invoice_details:
            order_from = invoice_details.get("custom_order_from")
            linked_table = invoice_details.get("custom_linked_table")

            # Check if order is from Table or QR - Table and has a linked table
            if order_from in ["Table", "QR - Table"] and linked_table:
                # Get the Restaurant Table status
                table_status = frappe.db.get_value(
                    "Restaurant Table",
                    linked_table,
                    "status"
                )

                if table_status == "Occupied":
                    response["redirect_to"] = "Table"
                    response["table_name"] = linked_table
                else:
                    response["redirect_to"] = "Order"
                    response["invoice_name"] = invoice_name
            else:
                response["redirect_to"] = "Order"
                response["invoice_name"] = invoice_name

    return response


@frappe.whitelist()
def mark_all_as_read():
    """
    Mark all notifications as read for the current session user
    """
    user = frappe.session.user

    if not user:
        frappe.throw("User not logged in")

    # Update all unread notifications for the current user
    frappe.db.set_value(
        "Notification Log",
        {"for_user": user, "read": 0},
        "read",
        1,
        update_modified=True
    )

    frappe.db.commit()

    return {"success": True, "message": "All notifications marked as read"}
