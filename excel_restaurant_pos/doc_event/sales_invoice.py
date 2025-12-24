import frappe
from frappe.utils import flt, cint, nowdate
from excel_restaurant_pos.api.bom import run_bom_process


def submit_sales_invoice(doc, method=None):
    """
    Submit Sales Invoice
    tasks: 
        Create arcpos feedback doc
        Increase item sales count
    """
    # need to generate doc for getting feedback
    feedback_doc = frappe.new_doc("ArcPOS Feedback")
    feedback_doc.sales_invoice_no = doc.name
    feedback_doc.feedback_from = doc.custom_order_from
    
    # Append child table rows
    for item in doc.items:
        feedback_doc.append("item_wise_feedback", {
            "item_name": item.item_code,
            "rating": "",
            "feedback": ""
        })
    
    feedback_doc.insert(
        ignore_permissions=True,
        ignore_mandatory=True
    )

    # need to increase item sales count
    for item in doc.items:
        item_doc = frappe.get_doc("Item", item.item_code)
        item_doc.custom_total_sold_qty += 1
        item_doc.save(ignore_permissions=True)


def create_sales_invoice(doc, method=None, create_payment=True):
    """
    Create Sales Invoice with support for multiple payment methods
    """
    if doc.status != 'Completed':
        return
    
    try:
        # Validate required fields
        if not doc.customer:
            frappe.throw("Customer is required")
        if not doc.item_list or len(doc.item_list) == 0:
            frappe.throw("At least one item is required")
        
        # Get restaurant settings and tax configuration
        get_restaurant_settings = frappe.get_doc("Restaurant Settings")
        tax_template_name = get_restaurant_settings.taxes_and_charges_template
        bom_settings = frappe.get_doc("Restaurant Production Config")
        
        if not tax_template_name:
            frappe.throw("Tax template not configured in Restaurant Settings")
            
        tax_template = frappe.get_doc("Sales Taxes and Charges Template", tax_template_name)
        
        # Get tax details (handle empty taxes)
        tax_rate = 0
        charge_type = "On Net Total"
        account_head = ""
        
        if tax_template.taxes and len(tax_template.taxes) > 0:
            tax_rate = flt(tax_template.taxes[0].get('rate', 0))
            charge_type = tax_template.taxes[0].get('charge_type', 'On Net Total')
            account_head = tax_template.taxes[0].get('account_head', '')

        # Create Sales Invoice
        invoice_doc = frappe.get_doc({
            "doctype": "Sales Invoice",
            "customer": doc.customer,
            "docstatus": 0,
            "customer_name": doc.customer_name,
            "company": doc.company,
            "posting_date": frappe.utils.today(),
            "discount_amount": flt(doc.discount or 0),
            "apply_discount_on": "Net Total",
            "set_posting_time": 1,
            "update_stock": 1,
            "items": [],
            "taxes": [],
        })

        # Add items to the invoice
        for item in doc.item_list:
            if not item.item:
                continue  # Skip items without item code
                
            invoice_doc.append("items", {
                "item_code": item.item,
                "qty": flt(item.qty or 0),
                "rate": flt(item.rate or 0),
                "amount": flt(item.amount or 0),
                "warehouse": bom_settings.target_warehouse
            })

        # Add taxes if configured
        if tax_rate > 0 and account_head:
            invoice_doc.append("taxes", {
                "charge_type": charge_type,
                "account_head": account_head,
                "rate": tax_rate,
                "description": "Sales Tax",
                "included_in_print_rate": 0,
            })

        # Insert and submit the invoice
        invoice_doc.insert(ignore_permissions=True)
        invoice_doc.submit()

        # Create Payment Entries for multiple payment methods
        payment_methods = doc.payment_methods
        payment_entries = []

        # Debug: Log the payment methods received
        frappe.log_error(f"Payment count: {len(payment_methods)}, Type: {type(payment_methods)}", "Payment Debug 1")

        # Convert Frappe document objects to dictionaries
        if payment_methods and len(payment_methods) > 0:
            # Check if first element is a Frappe document
            if hasattr(payment_methods[0], 'as_dict'):
                payment_methods = [p.as_dict() for p in payment_methods]
                frappe.log_error(f"Converted {len(payment_methods)} payments", "Payment Debug 2")

        if len(payment_methods) > 0:
            for idx, payment in enumerate(payment_methods):
                payment_amount = 0
                mode_of_payment = "Cash"
                reference_no = ""
                
                # Parse payment data
                if isinstance(payment, dict):
                    payment_amount = flt(payment.get("amount", 0))
                    mode_of_payment = payment.get("method", "Cash")
                    reference_no = payment.get("reference", "")
                    frappe.log_error(f"Pay {idx+1}: {mode_of_payment} = {payment_amount}", "Payment Debug 3")
                else:
                    # Try to access as object attributes
                    try:
                        payment_amount = flt(getattr(payment, "amount", 0))
                        mode_of_payment = getattr(payment, "method", "Cash")
                        reference_no = getattr(payment, "reference", "")
                        frappe.log_error(f"Pay {idx+1} obj: {mode_of_payment} = {payment_amount}", "Payment Debug 4")
                    except Exception as attr_error:
                        frappe.log_error(f"Parse err {idx+1}: {str(attr_error)}", "Payment Parse Error")
                        continue
                
                # Create payment entry if amount is valid
                if payment_amount > 0:
                    try:
                        frappe.log_error(f"Creating: {mode_of_payment} = {payment_amount}", "Payment Debug 5")
                        payment_entry = create_payment_entry(
                            invoice_doc=invoice_doc,
                            mode_of_payment=mode_of_payment,
                            amount=payment_amount,
                            company=doc.company,
                            reference_no=reference_no
                        )
                        payment_entries.append(payment_entry.name)
                        frappe.log_error(f"Created: {payment_entry.name}", "Payment Debug 6")
                    except Exception as pe_error:
                        frappe.log_error(
                            f"Failed {mode_of_payment}: {str(pe_error)}\n{frappe.get_traceback()}", 
                            "Payment Entry Error"
                        )
                else:
                    frappe.log_error(f"Skip {idx+1}: zero amount", "Payment Debug 7")

        # Update Table Order if provided
        if doc.name:
            try:
                frappe.db.set_value("Table Order", doc.name, "sales_invoice", invoice_doc.name)
                frappe.db.commit()
            except Exception as update_error:
                frappe.log_error(f"Failed Table Order update: {str(update_error)}", "Table Order Error")

        return {
            "status": "success",
            "invoice_name": invoice_doc.name,
            "payment_entries": payment_entries,
            "message": f"Sales Invoice created successfully with {len(payment_entries)} payment(s)"
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Sales Invoice Error")
        frappe.throw(f"Failed to create Sales Invoice: {str(e)}")


def create_payment_entry(invoice_doc, mode_of_payment, amount, company,reference_no):
    """
    Create a Payment Entry against Sales Invoice
    """
    
    try:
        
        receivable_account = get_receivable_account(invoice_doc.customer, company)
        if not receivable_account:
            frappe.throw(f"Receivable account not found for customer {invoice_doc.customer}")
        
        payment_account = get_mode_of_payment_account(mode_of_payment, company)
        if not payment_account:
            frappe.throw(f"Payment account not found for {mode_of_payment}")
        
        # Create Payment Entry
        payment_entry = frappe.get_doc({
            "doctype": "Payment Entry",
            "payment_type": "Receive",
            "posting_date": nowdate(),
            "mode_of_payment": mode_of_payment,
            "party_type": "Customer",
            "party": invoice_doc.customer,
            "company": company,
            "target_exchange_rate": 1,
            "paid_from": receivable_account,
            "paid_to": payment_account,
            "paid_amount": amount,
            "received_amount": amount,
            "reference_no": reference_no if reference_no else "",
            "reference_date": nowdate(),
            "references": []
        })
        # Add reference to the Sales Invoice
        payment_entry.append("references", {
            "reference_doctype": "Sales Invoice",
            "reference_name": invoice_doc.name,
            "allocated_amount": amount
        })
        
        # Insert and submit the payment entry
        payment_entry.insert(ignore_permissions=True)
        payment_entry.submit()
        frappe.db.commit()
        
        return payment_entry
        
    except Exception as e:
        frappe.log_error(f"Error: {str(e)}\n{frappe.get_traceback()}", "Payment Entry Error")
        raise


def get_mode_of_payment_account(mode_of_payment, company):
    """
    Get the default account for a mode of payment
    """
    try:
        frappe.log_error(f"Mode: {mode_of_payment}, Co: {company}", "MOP Account 1")
        
        mode_of_payment_doc = frappe.get_doc("Mode of Payment", mode_of_payment)
        print(f"Mode of Payment Doc: {mode_of_payment_doc}")
        
        # First try to find company-specific account
        for account in mode_of_payment_doc.accounts:
            if account.company == company:
                print(f"Found: {account.default_account}")
                return account.default_account
        
        # If no company-specific account found, return the first one
        if mode_of_payment_doc.accounts:
            frappe.log_error(f"First: {mode_of_payment_doc.accounts[0].default_account}", "MOP Account 3")
            return mode_of_payment_doc.accounts[0].default_account
        
        # Fallback to a default cash account if no account is configured
        frappe.log_error(f"Looking for default cash", "MOP Account 4")
        cash_account = frappe.db.get_value("Account", 
            {"account_type": "Cash", "company": company, "is_group": 0}, 
            "name")
        
        frappe.log_error(f"Cash: {cash_account}", "MOP Account 5")
        return cash_account
            
    except Exception as e:
        frappe.log_error(f"Error: {str(e)}\n{frappe.get_traceback()}", "MOP Account Error")
        # Return a default cash account as fallback
        cash_account = frappe.db.get_value("Account", 
            {"account_type": "Cash", "company": company, "is_group": 0}, 
            "name")
        return cash_account


def get_receivable_account(customer, company):
    account = ""
    customer_doc = frappe.get_doc("Customer", customer)
    accounts=customer_doc.accounts
    for account in accounts:
        if account.company == company:
            account = account.account
    if not account:
        account = frappe.get_value("Company", company, "default_receivable_account")
    return account