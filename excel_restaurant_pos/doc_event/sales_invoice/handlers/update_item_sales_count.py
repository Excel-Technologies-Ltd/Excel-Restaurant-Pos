import frappe


def update_item_sales_count(item_codes_and_qty):
    """
    Update item sales count in bulk using SQL
    This function is queued to run in background

    Args:
        item_codes_and_qty: List of tuples (item_code, qty) to update
    """
    if not item_codes_and_qty:
        return

    # Step 1: Group quantities by item_code (sum if same item appears multiple times)
    quantities_by_item = _group_quantities_by_item(item_codes_and_qty)
    if not quantities_by_item:
        return

    # Step 2: Get item info (including variant relationships) from database
    item_codes = list(quantities_by_item.keys())
    items_info = _get_items_info(item_codes)
    if not items_info:
        return

    # Step 3: Separate regular items and variants
    regular_items, variant_to_parent = _categorize_items(items_info)

    # Step 4: Update all items (regular + variants) in bulk
    _update_items_bulk(regular_items, quantities_by_item)

    # Step 5: Update parent items for variants in bulk
    if variant_to_parent:
        _update_parent_items_bulk(variant_to_parent, quantities_by_item)

    frappe.db.commit()


def _group_quantities_by_item(item_codes_and_qty):
    """Group and sum quantities by item_code"""
    quantities = {}
    for item_code, qty in item_codes_and_qty:
        if item_code:
            quantities[item_code] = quantities.get(item_code, 0) + qty
    return quantities


def _get_items_info(item_codes):
    """Fetch item names and variant_of relationships from database"""
    if not item_codes:
        return []

    placeholders = ", ".join(["%s"] * len(item_codes))
    return frappe.db.sql(
        f"""
        SELECT name, variant_of
        FROM `tabItem`
        WHERE name IN ({placeholders})
        """,
        tuple(item_codes),
        as_dict=True,
    )


def _categorize_items(items_info):
    """Separate regular items from variants and create variant-to-parent mapping"""
    regular_items = []
    variant_to_parent = {}

    for item in items_info:
        regular_items.append(item.name)
        if item.variant_of:
            variant_to_parent[item.name] = item.variant_of

    return regular_items, variant_to_parent


def _update_items_bulk(item_codes, quantities_by_item):
    """Update custom_total_sold_qty for all items using bulk SQL UPDATE"""
    if not item_codes:
        return

    # Build SQL CASE statement for each item
    case_when_clauses = []
    params = []

    for item_code in item_codes:
        if item_code in quantities_by_item:
            qty = quantities_by_item[item_code]
            case_when_clauses.append(
                "WHEN %s THEN COALESCE(custom_total_sold_qty, 0) + %s"
            )
            params.extend([item_code, qty])

    if not case_when_clauses:
        return

    # Build the complete SQL query
    placeholders = ", ".join(["%s"] * len(item_codes))
    sql_query = f"""
        UPDATE `tabItem`
        SET custom_total_sold_qty = CASE name
            {' '.join(case_when_clauses)}
            ELSE COALESCE(custom_total_sold_qty, 0)
        END
        WHERE name IN ({placeholders})
    """

    frappe.db.sql(sql_query, tuple(params + item_codes), as_dict=False)


def _update_parent_items_bulk(variant_to_parent, quantities_by_item):
    """Update parent items' sales count based on variant sales"""
    # Group quantities by parent item
    parent_quantities = {}
    for variant_code, parent_code in variant_to_parent.items():
        if variant_code in quantities_by_item:
            qty = quantities_by_item[variant_code]
            parent_quantities[parent_code] = parent_quantities.get(parent_code, 0) + qty

    if not parent_quantities:
        return

    # Build SQL CASE statement for each parent item
    case_when_clauses = []
    params = []
    parent_codes = list(parent_quantities.keys())

    for parent_code in parent_codes:
        qty = parent_quantities[parent_code]
        case_when_clauses.append("WHEN %s THEN COALESCE(custom_total_sold_qty, 0) + %s")
        params.extend([parent_code, qty])

    # Build the complete SQL query
    placeholders = ", ".join(["%s"] * len(parent_codes))
    sql_query = f"""
        UPDATE `tabItem`
        SET custom_total_sold_qty = CASE name
            {' '.join(case_when_clauses)}
            ELSE COALESCE(custom_total_sold_qty, 0)
        END
        WHERE name IN ({placeholders})
    """

    frappe.db.sql(sql_query, tuple(params + parent_codes), as_dict=False)
