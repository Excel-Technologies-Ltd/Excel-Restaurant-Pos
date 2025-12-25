import frappe
import traceback
from frappe.utils import flt
from datetime import datetime
from excel_restaurant_pos.api.item import (
    make_as_create_recipe_item,
    make_as_unready_recipe_item,
)


def create_work_order(
    bom_id=None,
    qty=None,
    source_warehouse=None,
    wip_warehouse=None,
    target_warehouse=None,
):
    """Create a work order from BOM"""
    bom_doc = frappe.get_doc("BOM", bom_id)
    work_order_doc = frappe.new_doc("Work Order")
    work_order_doc.production_item = bom_doc.item
    work_order_doc.bom_no = bom_doc.name
    work_order_doc.item = bom_doc.item
    work_order_doc.qty = flt(qty)
    work_order_doc.source_warehouse = source_warehouse
    work_order_doc.fg_warehouse = target_warehouse
    work_order_doc.wip_warehouse = wip_warehouse

    work_order_doc.save()
    work_order_doc.submit()
    print(f"Work Order {work_order_doc.name} created successfully")
    return work_order_doc


def make_stock_entry_custom(
    work_order_id, purpose="Manufacture", qty=5, target_warehouse="Finished Goods - ETL"
):
    """Create stock entry for work order"""
    stock_entry_dict = frappe.call(
        "erpnext.manufacturing.doctype.work_order.work_order.make_stock_entry",
        work_order_id=work_order_id,
        purpose=purpose,
        qty=qty,
    )

    if isinstance(stock_entry_dict, dict):
        stock_entry = frappe.get_doc(stock_entry_dict)
        stock_entry.to_warehouse = target_warehouse
        stock_entry.save()
        stock_entry.submit()
        print(
            f"Stock Entry {stock_entry.name} created successfully for purpose: {purpose}"
        )
        return stock_entry
    else:
        return stock_entry_dict


def create_process_log(bom_id, item_code, log_message, status="Success"):
    """Create BOM Process Log entry"""
    try:
        log_doc = frappe.new_doc("BOM Process Log")
        log_doc.bom_id = bom_id
        log_doc.item_code = item_code
        log_doc.status = status
        log_doc.log = log_message
        log_doc.process_date = frappe.utils.now()
        log_doc.save()
        frappe.db.commit()
        return log_doc
    except Exception as log_error:
        print(f"Error creating process log: {str(log_error)}")


def process(
    bom_id=None,
    qty=None,
    source_warehouse=None,
    wip_warehouse=None,
    target_warehouse=None,
    order_id=None,
):
    """
    Process BOM with proper rollback and logging
    """
    log_messages = []
    work_order_doc = None
    material_transfer_entry = None
    manufacture_entry = None
    item_code = None

    try:
        # Start transaction
        log_messages.append(f"[{datetime.now()}] Starting BOM process for {bom_id}")

        # Get BOM document
        bom_doc = frappe.get_doc("BOM", bom_id)
        item_code = bom_doc.item
        item_code = item_code
        log_messages.append(
            f"[{datetime.now()}] BOM {bom_id} found for item {bom_doc.item}"
        )

        # Step 1: Create Work Order
        log_messages.append(f"[{datetime.now()}] Creating work order...")
        work_order_doc = create_work_order(
            bom_id, flt(qty), source_warehouse, wip_warehouse, target_warehouse
        )
        log_messages.append(
            f"[{datetime.now()}] Work Order {work_order_doc.name} created successfully"
        )

        # Step 2: Create Material Transfer Stock Entry
        log_messages.append(
            f"[{datetime.now()}] Creating material transfer stock entry..."
        )
        material_transfer_entry = make_stock_entry_custom(
            work_order_id=work_order_doc.name,
            purpose="Material Transfer for Manufacture",
            qty=qty,
            target_warehouse=wip_warehouse,
        )
        log_messages.append(
            f"[{datetime.now()}] Material Transfer Stock Entry {material_transfer_entry.name} created successfully"
        )

        # Step 3: Create Manufacture Stock Entry
        log_messages.append(f"[{datetime.now()}] Creating manufacture stock entry...")
        manufacture_entry = make_stock_entry_custom(
            work_order_id=work_order_doc.name,
            purpose="Manufacture",
            qty=qty,
            target_warehouse=target_warehouse,
        )
        log_messages.append(
            f"[{datetime.now()}] Manufacture Stock Entry {manufacture_entry.name} created successfully"
        )

        # Commit all changes
        frappe.db.commit()

        log_messages.append(f"[{datetime.now()}] BOM process completed successfully")
        log_messages.append(f"Work Order: {work_order_doc.name}")
        log_messages.append(f"Material Transfer Entry: {material_transfer_entry.name}")
        log_messages.append(f"Manufacture Entry: {manufacture_entry.name}")

        print("BOM process completed successfully")
        if order_id:
            make_as_create_recipe_item(order_id, item_code)
            log_messages.append(
                f"[{datetime.now()}] Product {item_code} made as ready for order {order_id}"
            )
        # Create success log
        final_log = "\n".join(log_messages)
        create_process_log(bom_id, item_code, final_log, "Success")
        return {
            "status": "success",
            "work_order": work_order_doc.name,
            "material_transfer_entry": material_transfer_entry.name,
            "manufacture_entry": manufacture_entry.name,
        }

    except Exception as e:
        # Rollback all changes
        frappe.db.rollback()
        error_message = str(e)
        if order_id:
            make_as_unready_recipe_item(order_id, item_code, error_message)
            log_messages.append(
                f"[{datetime.now()}] Product {item_code} made as unready for order {order_id}"
            )

        error_traceback = traceback.format_exc()
        log_messages.append(f"[{datetime.now()}] ERROR: {error_message}")
        log_messages.append(f"[{datetime.now()}] Traceback: {error_traceback}")
        log_messages.append(f"[{datetime.now()}] Rolling back all changes...")

        # Log what was created before failure
        if work_order_doc:
            log_messages.append(
                f"[{datetime.now()}] Work Order {work_order_doc.name} was created but rolled back"
            )
        if material_transfer_entry:
            log_messages.append(
                f"[{datetime.now()}] Material Transfer Entry {material_transfer_entry.name} was created but rolled back"
            )
        if manufacture_entry:
            log_messages.append(
                f"[{datetime.now()}] Manufacture Entry {manufacture_entry.name} was created but rolled back"
            )

        log_messages.append(
            f"[{datetime.now()}] All changes have been rolled back due to error"
        )

        # Create error log
        final_log = "\n".join(log_messages)
        create_process_log(bom_id, item_code, final_log, "Failed")

        print(f"BOM process failed: {error_message}")
        raise e


# Example usage function
@frappe.whitelist()
def run_bom_process(bom_id=None, qty=None, order_id=None):
    """Example function to run the BOM process"""
    get_warehouse_config = frappe.get_doc("Restaurant Production Config")
    if not get_warehouse_config:
        frappe.throw("Warehouse config not found")
    frappe.enqueue(
        process,
        queue="long",
        bom_id=bom_id,
        qty=flt(qty),
        source_warehouse=get_warehouse_config.source_warehouse,
        wip_warehouse=get_warehouse_config.wip_warehouse,
        target_warehouse=get_warehouse_config.target_warehouse,
        order_id=order_id,
    )
    return f"process enqueued for bom {bom_id} qty {qty} order {order_id}"


# Utility function to view process logs
def get_process_logs(bom_id=None, item_code=None, status=None, limit=10):
    """Get BOM process logs with optional filters"""
    filters = {}
    if bom_id:
        filters["bom_id"] = bom_id
    if item_code:
        filters["item_code"] = item_code
    if status:
        filters["status"] = status

    logs = frappe.get_list(
        "BOM Process Log",
        filters=filters,
        fields=["name", "bom_id", "item_code", "status", "process_date", "log"],
        order_by="creation desc",
        limit=limit,
    )

    return logs
