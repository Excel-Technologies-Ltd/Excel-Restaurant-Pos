import frappe
from .handlers.create_feedback import create_feedback
from .handlers.create_payment_entry import create_payment_entry
from .handlers.update_item_sales_count import update_item_sales_count


def submit_sales_invoice(doc, method=None):
    """
    Submit Sales Invoice
    tasks:
        Create arcpos feedback doc (in short queue)
        Increase item sales count
    """
    # create payment entry based on condition
    if doc.custom_with_arcpos_payment:
        frappe.enqueue(
            create_payment_entry,
            queue="short",
            sales_invoice=doc.name,
        )

    # Enqueue feedback doc creation in short queue
    frappe.enqueue(
        create_feedback,
        queue="short",
        doc_dict=doc.as_dict(),
    )

    # Enqueue item sales count update in short queue (bulk update)
    item_codes_and_qty = [(item.item_code, item.qty) for item in doc.items]
    frappe.enqueue(
        update_item_sales_count,
        queue="short",
        item_codes_and_qty=item_codes_and_qty,
    )
