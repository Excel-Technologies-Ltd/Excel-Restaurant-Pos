

import frappe

def create_address_by_customer(doc,method=None):
    if doc.method=="before_save":
        address= doc