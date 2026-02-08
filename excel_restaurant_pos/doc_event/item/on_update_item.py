import frappe

from excel_restaurant_pos.api.meta.catalog import update_catalog_item
from excel_restaurant_pos.api.meta.catalog import create_catalog_item


def on_update_item(doc, method):
    """
    On update item event
    """
    frappe.msgprint(f"On update item event: {doc.name}")

    if doc.is_new():
        frappe.enqueue(create_catalog_item, queue="short", item_code=doc.name)
    else:
        frappe.enqueue(update_catalog_item, queue="short", item_code=doc.name)
