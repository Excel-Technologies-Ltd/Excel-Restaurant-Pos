from erpnext.stock.doctype.item.item import Item


class OverrideItem(Item):
    def validate(self):
        item_menus = self.get("custom_available_in_menus", [])
        combined: list[str] = [item.menu for item in item_menus]
        self.custom_combined_menus = ", ".join(combined)
