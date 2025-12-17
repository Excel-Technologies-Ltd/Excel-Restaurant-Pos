
import frappe


def default_system_settings():
    return frappe.get_single("ArcPOS System Settings")