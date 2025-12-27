import frappe


def update_item_sales_count(item_codes):
    """
    Update item sales count in bulk using SQL
    This function is queued to run in background

    Args:
        item_codes: List of item codes to update
    """
    if not item_codes:
        return

    # Use bulk SQL update instead of individual get_doc/save calls
    # Create placeholders for IN clause
    placeholders = ", ".join(["%s"] * len(item_codes))

    frappe.db.sql(
        f"""
        UPDATE `tabItem`
        SET custom_total_sold_qty = COALESCE(custom_total_sold_qty, 0) + 1
        WHERE name IN ({placeholders})
        """,
        tuple(item_codes),
        as_dict=False,
    )
    frappe.db.commit()
