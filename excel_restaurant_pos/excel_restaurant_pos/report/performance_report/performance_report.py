# Copyright (c) 2025, Sohanur Rahman and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from datetime import datetime

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_columns():
    return [
        {
            "label": _("Order ID"),
            "fieldname": "order_id",
            "fieldtype": "Link",
            "options": "Table Order",
            "width": 120
        },
        # {
        #     "label": _("Customer"),
        #     "fieldname": "customer_name",
        #     "fieldtype": "Data",
        #     "width": 150
        # },
        {
            "label": _("Item"),
            "fieldname": "item",
            "fieldtype": "Data",
            "width": 150
        },
        {
            "label": _("Qty"),
            "fieldname": "qty",
            "fieldtype": "Float",
            "width": 80
        },
        {
            "label": _("Order Placed"),
            "fieldname": "order_placed_time_formatted",
            "fieldtype": "Data",
            "width": 180
        },
        # {
        #     "label": _("Order Ready"),
        #     "fieldname": "order_ready_time",
        #     "fieldtype": "Datetime",
        #     "width": 150
        # },
        # {
        #     "label": _("Order Confirmed"),
        #     "fieldname": "order_confirm_time",
        #     "fieldtype": "Datetime",
        #     "width": 150
        # },
        {
            "label": _("Placed to Accepted (mins)"),
            "fieldname": "placed_to_accepted_duration",
            "fieldtype": "Float",
            "width": 200,
            "precision": 2
        },
        {
            "label": _("Accepted to Ready (mins)"),
            "fieldname": "accepted_to_ready_duration",
            "fieldtype": "Float",
            "width": 200,
            "precision": 2
        },
        {
            "label": _("Ready to Confirmed (mins)"),
            "fieldname": "ready_to_confirmed_duration",
            "fieldtype": "Float",
            "width": 150,
            "precision": 2
        },
        {
            "label": _("Total Duration (mins)"),
            "fieldname": "total_duration",
            "fieldtype": "Float",
            "width": 200,
            "precision": 2
        },
        {
            "label": _("Status"),
            "fieldname": "status",
            "fieldtype": "Data",
            "width": 100
        }
    ]

def get_data(filters=None):
    conditions = get_conditions(filters)
    
    query = """
        SELECT 
            toi.parent as order_id,
            to_order.customer_name,
            toi.item,
            toi.qty,
            toi.order_placed_time,
            toi.order_accepted_time,
            toi.order_ready_time,
            toi.order_confirm_time,
            toi.is_accepted,
            toi.is_ready,
            to_order.status,
            to_order.creation as order_creation
        FROM `tabTable Order Item` as toi
        LEFT JOIN `tabTable Order` as to_order ON toi.parent = to_order.name
        WHERE to_order.docstatus = 1 {conditions}
        ORDER BY toi.parent DESC, toi.idx ASC
    """.format(conditions=conditions)
    
    data = frappe.db.sql(query, as_dict=1)
    
    # Calculate durations and format dates
    for row in data:
        # Format order_accepted_time with proper error handling
        if row.order_placed_time:
            try:
                if isinstance(row.order_placed_time, str):
                    accepted_datetime = datetime.strptime(row.order_placed_time, '%Y-%m-%d %H:%M:%S.%f')
                else:
                    accepted_datetime = row.order_placed_time
                
                # Format as: 10-20-2023 04:56pm
                row['order_placed_time_formatted'] = accepted_datetime.strftime('%m-%d-%Y %I:%M%p').lower()
            except Exception:
                # Fallback to original value if formatting fails
                row['order_placed_time_formatted'] = str(row.order_placed_time) if row.order_accepted_time else None
        else:
            row['order_placed_time_formatted'] = None
        
        # Calculate duration between stages
        placed_to_accepted = calculate_duration(row.order_placed_time, row.order_accepted_time)
        accepted_to_ready = calculate_duration(row.order_accepted_time, row.order_ready_time)
        ready_to_confirmed = calculate_duration(row.order_ready_time, row.order_confirm_time)
        
        # Total duration from placed to confirmed
        total_duration = calculate_duration(row.order_placed_time, row.order_confirm_time)
        
        row.update({
            'placed_to_accepted_duration': placed_to_accepted,
            'accepted_to_ready_duration': accepted_to_ready,
            'ready_to_confirmed_duration': ready_to_confirmed,
            'total_duration': total_duration
        })
    
    return data

def calculate_duration(start_time, end_time):
    """Calculate duration between two datetime objects in minutes"""
    if not start_time or not end_time:
        return None
    
    try:
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S.%f')
        if isinstance(end_time, str):
            end_time = datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S.%f')
        
        duration = end_time - start_time
        return round(duration.total_seconds() / 60, 2)  # Convert to minutes
    except:
        return None

def get_conditions(filters):
    conditions = ""
    
    if filters:
        if filters.get("from_date"):
            conditions += " AND DATE(to_order.creation) >= %(from_date)s"
        
        if filters.get("to_date"):
            conditions += " AND DATE(to_order.creation) <= %(to_date)s"
        
        if filters.get("customer"):
            conditions += " AND to_order.customer = %(customer)s"
        
        if filters.get("item"):
            conditions += " AND toi.item = %(item)s"
        
        if filters.get("status"):
            conditions += " AND to_order.status = %(status)s"
    
    return conditions

# Additional utility functions for summary statistics
def get_summary_data(filters=None):
    """Get summary statistics for performance metrics"""
    conditions = get_conditions(filters)
    
    summary_query = """
        SELECT 
            COUNT(*) as total_orders,
            AVG(TIMESTAMPDIFF(MINUTE, toi.order_placed_time, toi.order_accepted_time)) as avg_placed_to_accepted,
            AVG(TIMESTAMPDIFF(MINUTE, toi.order_accepted_time, toi.order_ready_time)) as avg_accepted_to_ready,
            AVG(TIMESTAMPDIFF(MINUTE, toi.order_ready_time, toi.order_confirm_time)) as avg_ready_to_confirmed,
            AVG(TIMESTAMPDIFF(MINUTE, toi.order_placed_time, toi.order_confirm_time)) as avg_total_duration,
            MAX(TIMESTAMPDIFF(MINUTE, toi.order_placed_time, toi.order_confirm_time)) as max_total_duration,
            MIN(TIMESTAMPDIFF(MINUTE, toi.order_placed_time, toi.order_confirm_time)) as min_total_duration
        FROM `tabTable Order Item` as toi
        LEFT JOIN `tabTable Order` as to_order ON toi.parent = to_order.name
        WHERE to_order.docstatus = 1 
        AND toi.order_placed_time IS NOT NULL 
        AND toi.order_confirm_time IS NOT NULL
        {conditions}
    """.format(conditions=conditions)
    
    return frappe.db.sql(summary_query, as_dict=1)