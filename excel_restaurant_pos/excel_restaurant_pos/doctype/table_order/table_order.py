import frappe
from frappe.model.document import Document

class TableOrder(Document):
    def before_save(self):
        # Initialize discount and calculate total amount
        discount = float(self.discount) if self.discount else 0.0
        total_amount = self.get_total_amount()
        tax_amount = self.get_tax_amount()

        # Calculate total amount after discount and include tax
        total_amount_after_discount = total_amount - discount
        self.tax = tax_amount
        self.amount = total_amount

        self.total_amount = total_amount_after_discount + tax_amount
        
   
        if self.status == 'Ready to Serve':
            self.update_item_readiness(is_ready=1)
            if self.is_paid:
                self.status = 'Completed'
                self.docstatus = 1
        if self.status == 'Completed' and self.is_paid:
            self.docstatus = 1

        # Handle 'Work in progress' status
        if self.status == 'Work in progress':
            if self.is_paid and all(item.is_ready == 1 for item in self.item_list):
                self.status = 'Completed'
                self.docstatus = 1
                return
            if all(item.is_ready == 1 for item in self.item_list):
                self.status = 'Ready to Serve'
    def get_total_amount(self):
        # Calculate the total amount based on rate and qty
        return sum(float(item.rate) * float(item.qty) for item in self.item_list)

    def get_tax_amount(self):
        # Calculate the tax amount based on settings
        restaurant_settings = frappe.get_doc("Restaurant Settings")
        if restaurant_settings.charge_type == 'On Net Total' and restaurant_settings.tax_rate:
            tax_rate = float(restaurant_settings.tax_rate) / 100
            discount = float(self.discount) if self.discount else 0.0
            return (self.get_total_amount() - discount) * tax_rate
        return 0.0

    def update_item_readiness(self, is_ready):
        # Helper method to update item readiness
        for item in self.item_list:
            item.is_ready = is_ready
