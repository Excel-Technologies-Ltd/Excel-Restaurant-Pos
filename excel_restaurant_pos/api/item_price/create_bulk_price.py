"""API endpoint for creating bulk item prices."""

import frappe


@frappe.whitelist(allow_guest=False, methods=["POST"])
def create_bulk_price():
    """Create multiple item prices efficiently."""
    item_prices = frappe.form_dict.get("item_prices", [])

    if not item_prices:
        return {"message": "No item prices provided", "status": "error"}

    created_count = 0
    errors = []

    for price_data in item_prices:
        try:
            # Use get_doc with dict for cleaner syntax and better performance
            doc = frappe.get_doc(
                {
                    "doctype": "Item Price",
                    "item_code": price_data.get("item_code"),
                    "price_list": price_data.get("price_list"),
                    "price_list_rate": price_data.get("price_list_rate"),
                }
            )
            doc.insert(ignore_permissions=True)
            created_count += 1
        except frappe.DuplicateEntryError as e:
            errors.append(
                {
                    "item_code": price_data.get("item_code"),
                    "error": f"Duplicate entry: {str(e)}",
                }
            )
        except frappe.ValidationError as e:
            # Catches ValidationError and its subclasses (MandatoryError, DataError, etc.)
            errors.append(
                {
                    "item_code": price_data.get("item_code"),
                    "error": str(e),
                }
            )
        except (ValueError, TypeError, AttributeError) as e:
            # Catch common Python exceptions that might occur
            errors.append(
                {
                    "item_code": price_data.get("item_code"),
                    "error": str(e),
                }
            )

    frappe.db.commit()

    return {
        "message": f"Created {created_count} item price(s)",
        "status": "success",
        "created": created_count,
        "errors": errors if errors else None,
    }
