"""Override Item doctype class for custom functionality."""

from erpnext.stock.doctype.item.item import Item


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
