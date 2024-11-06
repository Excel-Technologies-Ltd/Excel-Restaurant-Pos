import io
import qrcode
import frappe
from frappe.model.document import Document
from frappe.utils import get_url
from frappe.utils.file_manager import save_file

class RestaurantTable(Document):
    def before_save(self):
        # Generate the base URL and construct the specific URL with the table_id parameter
        # check this frm is new
        if not self.is_new():
            return
        host = get_url()
        url = f"{host}/restaurant/items?table_id={self.name}&order_type=DineIn"
        frappe.msgprint(url)
        
        # Generate the QR code with the URL data
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=20,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        # Create the QR code image and save it to a BytesIO stream
        img = qr.make_image(fill='black', back_color='white')
        qr_bytes_io = io.BytesIO()
        img.save(qr_bytes_io, format='PNG')
        qr_bytes = qr_bytes_io.getvalue()
        
        
        # Save the image as an attachment and get the file path
        filename = f"{self.name}_QRCode.png"
        self.file_path = filename
        save_file(filename, qr_bytes, self.doctype, self.name, is_private=0)
