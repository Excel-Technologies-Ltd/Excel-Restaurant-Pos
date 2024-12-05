# Copyright (c) 2024, Sohanur Rahman and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class RestaurantSettings(Document):
    def before_save(self):
        if self.taxes_and_charges_template:
            taxData = frappe.get_doc("Sales Taxes and Charges Template", self.taxes_and_charges_template)
            self.tax_rate = taxData.taxes[0].get('rate')
            self.charge_type = taxData.taxes[0].get('charge_type')
