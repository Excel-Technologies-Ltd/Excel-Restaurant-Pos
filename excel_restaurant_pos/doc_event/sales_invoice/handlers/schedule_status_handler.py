import frappe

from datetime import timedelta
from frappe.utils import get_datetime, now_datetime, get_system_timezone
import pytz
from frappe_uberdirect.utils.background_jobs import enqueue_delayed
from excel_restaurant_pos.doc_event.sales_invoice.handlers.delayed_order_status_handler import (
    delayed_order_status_handler,
)


def schedule_status_handler(doc):
    """
    Handle schedule status
    """
    order_status = doc.get("custom_order_status", "").lower()
    service_type = doc.get("custom_service_type", "").lower()

    # log the order status change
    msg = f"Order status changed to {order_status}"
    frappe.log_error("Schedule order change", msg)

    # check service is valid
    if service_type not in ["delivery", "pickup"]:
        msg = f"Invalid service type: {service_type}"
        frappe.logger().error("Schedule order change", msg)
        return

    # get the pickup date
    min_diff = 0
    timezone_str = get_system_timezone()
    timezone = pytz.timezone(timezone_str)

    if service_type == "delivery":
        pickup_ready = doc.get("custom_pickup_ready", False)
        if pickup_ready:
            pickup_datetime = get_datetime(pickup_ready)
            current_datetime = now_datetime()
            # Ensure both datetimes are timezone-aware in the same timezone
            if pickup_datetime.tzinfo is None:
                pickup_datetime = timezone.localize(pickup_datetime)
            else:
                pickup_datetime = pickup_datetime.astimezone(timezone)
            if current_datetime.tzinfo is None:
                current_datetime = timezone.localize(current_datetime)
            else:
                current_datetime = current_datetime.astimezone(timezone)
            min_diff = (pickup_datetime - current_datetime).total_seconds() / 60

    elif service_type == "pickup":
        pickup_date = doc.get("custom_pickup_date")
        pickup_time = doc.get("custom_pickup_time")
        if pickup_date and pickup_time:
            # Combine date and time into a datetime string
            pickup_datetime_str = f"{pickup_date} {pickup_time}"
            pickup_datetime = get_datetime(pickup_datetime_str)
            current_datetime = now_datetime()
            # Ensure both datetimes are timezone-aware in the same timezone
            if pickup_datetime.tzinfo is None:
                pickup_datetime = timezone.localize(pickup_datetime)
            else:
                pickup_datetime = pickup_datetime.astimezone(timezone)
            if current_datetime.tzinfo is None:
                current_datetime = timezone.localize(current_datetime)
            else:
                current_datetime = current_datetime.astimezone(timezone)
            min_diff = (pickup_datetime - current_datetime).total_seconds() / 60

    # Calculate delay based on time difference:
    # - If difference > 20 minutes: delay = (difference - 20) minutes
    # - Otherwise: delay = difference minutes
    if min_diff > 20:
        delay_minutes = min_diff - 20
    else:
        delay_minutes = 1

    # enqueue the delayed order status handler
    enqueue_delayed(
        delayed_order_status_handler,
        delay=timedelta(minutes=delay_minutes),
        invoice_name=doc.name,
    )
