import frappe


def get_catalog_config():
    """
    Get the catalog id and token for the current user
    """

    catalog_id = frappe.db.get_single_value("ArcPOS Settings", "catalog_id")
    catalog_token = frappe.db.get_single_value(
        "ArcPOS Settings", "catalog_access_token"
    )

    if not catalog_id or not catalog_token:
        frappe.log_error("No catalog id or access token found in ArcPOS Settings")
        frappe.throw("No catalog id or access token found in ArcPOS Settings")

    return {"catalog_id": catalog_id, "catalog_token": catalog_token}
