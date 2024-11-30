# Copyright (c) 2024, Sohanur Rahman and contributors
# For license information, please see license.txt
from frappe.model.document import Document

class TableOrder(Document):
    def before_save(self):
        # Check if the status is 'Ready for Pickup'
        if self.status == 'Ready for Pickup':
            for item in self.item_list:
                item.is_ready = 1
        
        # Check if the status is 'Work in progress'
        if self.status == 'Work in progress':
            # Check if all items have is_ready == 1
            all_items_ready = all(item.is_ready == 1 for item in self.item_list)

            # If all items are ready, change the status to 'Ready for Pickup'
            if all_items_ready:
                self.status = 'Ready for Pickup'

            

