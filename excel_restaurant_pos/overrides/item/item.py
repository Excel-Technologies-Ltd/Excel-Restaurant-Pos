from erpnext.stock.doctype.item.item import Item
import frappe


class OverrideItem(Item):
    def validate(self):
        frappe.msgprint("Hello")
