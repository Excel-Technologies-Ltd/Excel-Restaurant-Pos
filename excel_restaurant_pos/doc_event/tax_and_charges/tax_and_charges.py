import frappe


def on_doctype_update(doc, method):
    """
    On update of Sales Taxes and Charges Template, update the Restaurant Settings
    """
    frappe.msgprint(f"Sales Taxes and Charges Template {doc.name} updated")

    restaurant_settings = frappe.get_doc("Restaurant Settings")
    if not restaurant_settings:
        return

    # if the taxes and charges template is the same as the restaurant settings, save the restaurant settings
    if doc.name == restaurant_settings.taxes_and_charges_template:
        restaurant_settings.save()
