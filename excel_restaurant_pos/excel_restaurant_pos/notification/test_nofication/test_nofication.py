import frappe


def get_context(context):
    doc = context.get("doc")
    doc.custom_receiver_email = "amir.dev@excelbd.com"
