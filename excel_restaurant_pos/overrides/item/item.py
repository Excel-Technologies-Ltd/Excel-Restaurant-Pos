from erpnext.stock.doctype.item.item import Item


class OverrideItem(Item):
    def validate(self):

        print(self.get("available_menus", []))

        combined = ""
        for item in self.get("available_menus", []):
            combined += item.item_menus + ", "
        self.combined_menus = combined
