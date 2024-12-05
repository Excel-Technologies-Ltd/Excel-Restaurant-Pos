
import frappe
def on_doctype_update(doc, method):
    frappe.msgprint(f"Sales Taxes and Charges Template {doc.name} updated")
    restaurant_settings = frappe.get_doc("Restaurant Settings")
    if not restaurant_settings:
        return
    if doc.name == restaurant_settings.taxes_and_charges_template:
        restaurant_settings.save()
    
