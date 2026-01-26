from datetime import datetime
from frappe.utils import get_datetime, format_datetime

def iso_to_frappe_datetime(iso_str: str) -> str:
    """
    Convert ISO-8601 datetime string to Frappe-compatible datetime string
    """

    if not iso_str:
        return None

    # converted time
    dt = get_datetime(iso_str)
    return dt.strftime("%Y-%m-%d %H:%M:%S")
