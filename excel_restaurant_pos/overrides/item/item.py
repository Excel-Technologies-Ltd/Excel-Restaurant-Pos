"""Override Item doctype class for custom functionality."""

from erpnext.stock.doctype.item.item import Item
from excel_restaurant_pos.api.meta import create_catalog_item,update_catalog_item,delete_catalog_item
from excel_restaurant_pos.utils import is_new_doc
import frappe


class OverrideItem(Item):
    """Override Item class to add custom validation logic."""

    def __init__(self, *args, **kwargs):
        """Initialize Item class."""
        super().__init__(*args, **kwargs)
        self.custom_combined_menus = None

    def validate(self):
        """Validate item and set combined menus field."""
        item_menus = self.get("custom_available_in_menus", [])
        combined: list[str] = [item.menu for item in item_menus]
        self.custom_combined_menus = ", ".join(combined)

        # validate item sections and combined items
        item_sections = self.get("custom_item_sections", [])
        c_sections = [section.section_name for section in item_sections]
        self.custom_combined_section = ", ".join(c_sections)

    def after_insert(self):
        """After insert event."""
        frappe.msgprint(f"After insert event: {self.name}")
        frappe.enqueue(create_catalog_item, queue="short", item_code=self.name)

    def on_update(self):
        """On update event."""
        is_new = is_new_doc(self)
        if not is_new:
            frappe.msgprint(f"On update event: {self.name}")
            frappe.enqueue(update_catalog_item, queue="short", item_code=self.name)

    def on_trash(self):
        """On trash event."""
        frappe.msgprint(f"On trash event: {self.name}")
        frappe.enqueue(delete_catalog_item, queue="short", item_code=self.name)
