// Copyright (c) 2025, Sohanur Rahman and contributors
// For license information, please see license.txt

frappe.query_reports["Table Order Performance Report"] = {
    "filters": [
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
            "width": "80"
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "width": "80"
        },
        {
            "fieldname": "customer",
            "label": __("Customer"),
            "fieldtype": "Link",
            "options": "Customer",
            "width": "100"
        },
        {
            "fieldname": "item",
            "label": __("Item"),
            "fieldtype": "Link",
            "options": "Item",
            "width": "100"
        },
        {
            "fieldname": "status",
            "label": __("Order Status"),
            "fieldtype": "Select",
            "options": ["", "Pending", "In Progress", "Completed", "Cancelled"],
            "width": "100"
        }
    ],
    
    "formatter": function(value, row, column, data, default_formatter) {
        value = default_formatter(value, row, column, data);
        
        // Highlight slow orders in red
        if (column.fieldname === "total_duration" && data && data.total_duration > 30) {
            value = `<span style='color:red; font-weight: bold;'>${value}</span>`;
        }
        
        // Highlight fast orders in green
        else if (column.fieldname === "total_duration" && data && data.total_duration < 10) {
            value = `<span style='color:green; font-weight: bold;'>${value}</span>`;
        }
        
        // Color code durations
        if (column.fieldname.includes("_duration") && data) {
            let duration_value = data[column.fieldname];
            if (duration_value > 15) {
                value = `<span style='color:orange;'>${value}</span>`;
            } else if (duration_value > 30) {
                value = `<span style='color:red;'>${value}</span>`;
            }
        }
        
        return value;
    },
    
    "onload": function(report) {
        // Add a summary button
        report.page.add_inner_button(__("Performance Summary"), function() {
            frappe.call({
                method: "frappe.desk.query_report.run",
                args: {
                    report_name: "Table Order Performance Report",
                    filters: report.get_values()
                },
                callback: function(r) {
                    if (r.message && r.message.result) {
                        show_performance_summary(r.message.result);
                    }
                }
            });
        });
    }
};

function show_performance_summary(data) {
    if (!data || data.length === 0) {
        frappe.msgprint(__("No data available for summary"));
        return;
    }
    
    let total_orders = data.length;
    let completed_orders = data.filter(row => row.order_confirm_time).length;
    
    // Calculate averages
    let total_durations = data.filter(row => row.total_duration).map(row => row.total_duration);
    let avg_total_duration = total_durations.length > 0 ? 
        (total_durations.reduce((a, b) => a + b, 0) / total_durations.length).toFixed(2) : 0;
    
    let placed_to_accepted = data.filter(row => row.placed_to_accepted_duration)
        .map(row => row.placed_to_accepted_duration);
    let avg_placed_to_accepted = placed_to_accepted.length > 0 ? 
        (placed_to_accepted.reduce((a, b) => a + b, 0) / placed_to_accepted.length).toFixed(2) : 0;
    
    let accepted_to_ready = data.filter(row => row.accepted_to_ready_duration)
        .map(row => row.accepted_to_ready_duration);
    let avg_accepted_to_ready = accepted_to_ready.length > 0 ? 
        (accepted_to_ready.reduce((a, b) => a + b, 0) / accepted_to_ready.length).toFixed(2) : 0;
    
    let ready_to_confirmed = data.filter(row => row.ready_to_confirmed_duration)
        .map(row => row.ready_to_confirmed_duration);
    let avg_ready_to_confirmed = ready_to_confirmed.length > 0 ? 
        (ready_to_confirmed.reduce((a, b) => a + b, 0) / ready_to_confirmed.length).toFixed(2) : 0;
    
    let summary_html = `
        <div class="performance-summary">
            <h4>Performance Summary</h4>
            <table class="table table-bordered">
                <tr><td><b>Total Orders:</b></td><td>${total_orders}</td></tr>
                <tr><td><b>Completed Orders:</b></td><td>${completed_orders}</td></tr>
                <tr><td><b>Completion Rate:</b></td><td>${((completed_orders/total_orders)*100).toFixed(1)}%</td></tr>
                <tr><td><b>Average Total Duration:</b></td><td>${avg_total_duration} minutes</td></tr>
                <tr><td><b>Average Placed to Accepted:</b></td><td>${avg_placed_to_accepted} minutes</td></tr>
                <tr><td><b>Average Accepted to Ready:</b></td><td>${avg_accepted_to_ready} minutes</td></tr>
                <tr><td><b>Average Ready to Confirmed:</b></td><td>${avg_ready_to_confirmed} minutes</td></tr>
            </table>
        </div>
    `;
    
    frappe.msgprint({
        title: __("Performance Summary"),
        message: summary_html,
        wide: true
    });
}