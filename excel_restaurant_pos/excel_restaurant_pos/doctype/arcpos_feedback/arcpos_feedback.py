# Copyright (c) 2025, Sohanur Rahman and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ArcPOSFeedback(Document):
	def after_insert(self):
		if self.sales_invoice_no:
			frappe.db.set_value(
				"Sales Invoice",
				self.sales_invoice_no,
				"custom_feedback_url",
				self.name,
			)
			frappe.db.commit()
