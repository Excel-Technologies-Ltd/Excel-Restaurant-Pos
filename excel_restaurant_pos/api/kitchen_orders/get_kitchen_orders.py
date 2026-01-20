import frappe


# get sales invoice with invoice items
@frappe.whitelist(methods=["GET"])
def get_kitchen_orders():
    """
    Get sales invoices with invoice items
    filters:
        - docstatus: defaults to != 1 (not submitted)
        - custom_order_status: defaults to in ["Accepted", "Waiting", "In kitchen"]
    """

    # pop cmd
    if frappe.form_dict.get("cmd"):
        frappe.form_dict.pop("cmd")

    # set default value
    frappe.form_dict.setdefault("limit", 10)
    frappe.form_dict.setdefault("limit_page_length", 10)

    # Use creation desc as default ordering
    if not frappe.form_dict.get("order_by"):
        frappe.form_dict["order_by"] = "creation desc"

    # update filters
    filters = frappe.form_dict.get("filters")
    default_filters = [
        ["docstatus", "!=", 2],
        ["custom_order_status", "in", ["Accepted", "Waiting", "In kitchen", "Preparing"]],
    ]

    # Convert filters to list format if needed
    if not filters:
        filters = default_filters
    else:
        filters = frappe.parse_json(filters)
        filters.extend(default_filters)

    # Update form_dict with modified filters
    frappe.form_dict["filters"] = filters

    # get sales invoice list
    sales_invoices = frappe.get_all("Sales Invoice", **frappe.form_dict)

    invoice_names = [invoice.name for invoice in sales_invoices]

    # get invoice items
    invoice_items = frappe.get_all(
        "Sales Invoice Item",
        filters={"parent": ["in", invoice_names]},
        fields=[
            "name",
            "parent",
            "item_code",
            "item_name",
            "qty",
            "rate",
            "amount",
            "description",
            "custom_parent_item",
            "custom_serve_type",
            "custom_order_item_status",
            "custom_special_note",
            "custom_kitchen_note",
            "custom_is_print",
            "custom_guest_choice"
        ],
    )

    # group items by parent invoice
    items_map = {}
    for item in invoice_items:
        parent = item.parent
        if parent not in items_map:
            items_map[parent] = []
        items_map[parent].append(item)

    # attach items to sales invoice list
    for invoice in sales_invoices:
        invoice.items = items_map.get(invoice.name, [])

    # return sales invoice list with items
    return sales_invoices