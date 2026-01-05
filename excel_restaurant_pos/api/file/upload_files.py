import frappe
from excel_restaurant_pos.utils import rate_limit_guest


@frappe.whitelist(allow_guest=True)
def upload_public_file():
    rate_limit_guest("upload_public_file", limit=10)

    file = frappe.request.files.get("file")
    if not file:
        frappe.throw("File is required")

    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        frappe.throw("Invalid file type")

    # Read file content to check size
    file_content = file.stream.read()
    file_size = len(file_content)

    if file_size > 5 * 1024 * 1024:  # 5 MB
        frappe.throw("File size is too large")

    doc = frappe.get_doc(
        {
            "doctype": "File",
            "file_name": file.filename,
            "content": file_content,
            "is_private": 0,
        }
    )
    doc.insert(ignore_permissions=True)

    return doc.file_url
