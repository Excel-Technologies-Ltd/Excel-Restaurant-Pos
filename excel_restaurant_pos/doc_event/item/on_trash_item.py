import frappe

from excel_restaurant_pos.api.meta.catalog import delete_catalog_item


def on_trash_item(doc, method):
    """
    On trash item event
    """
    frappe.msgprint(f"On trash item event: {doc.name}")

    frappe.enqueue(delete_catalog_item, queue="short", item_code=doc.name)
