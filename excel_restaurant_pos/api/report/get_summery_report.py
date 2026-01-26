import pymysql
import frappe
from calendar import monthrange
from frappe.utils import getdate

@frappe.whitelist(allow_guest=True)
def get_summery_report(start_date=None, end_date=None, item_group=None):
    """
    Get item performance summary report.
    """
    # ... (same date handling code as above) ...
    
    if not item_group:
        frappe.throw("item_group is required for get_summery_report")

    # Get database connection details from frappe.conf
    db_settings = frappe.conf.get('db_settings') or frappe.local.conf.db_name
    
    try:
        # Create a new connection
        conn = pymysql.connect(
            host=frappe.conf.db_host or 'localhost',
            user=frappe.conf.db_name,  # This is usually the username in Frappe
            password=frappe.conf.db_password,
            database=frappe.conf.db_name,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            read_timeout=60,  # Increase timeout
            write_timeout=60
        )
        
        with conn.cursor() as cursor:
            cursor.callproc('get_Item_Performance', [start_date, end_date, item_group])
            result = cursor.fetchall()
            
            # If stored procedure returns multiple result sets
            while cursor.nextset():
                pass
                
        conn.close()
        return result
        
    except Exception as e:
        frappe.log_error(f"Direct connection error in get_summery_report: {str(e)}", "Summary Report Error")
        
        # Fall back to frappe.db.sql
        return frappe.db.sql(
            """
            CALL get_Item_Performance(%(start_date)s, %(end_date)s, %(item_group)s);
            """,
            values={"start_date": start_date, "end_date": end_date, "item_group": item_group},
            as_dict=True,
        )