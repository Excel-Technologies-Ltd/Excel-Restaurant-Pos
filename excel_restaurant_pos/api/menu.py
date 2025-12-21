import frappe
from frappe.utils import today
from datetime import datetime

@frappe.whitelist(allow_guest=True)
def get_menu_list():
    """
    Get menu list
    filters:
        - name: menu name
        - parent_menu: parent menu name
        - is_active: 1 (active menu)
        - is_deleted: 0 (exclude deleted menus)
    """
    # date calculations
    today_date = datetime.now().date()
    day_name = datetime.now().strftime("%A")
    current_time = datetime.now().strftime("%H:%M:%S")

    print(today_date)
    print(day_name)
    print(current_time)

    # pop cmd
    if frappe.form_dict.get("cmd"):
        frappe.form_dict.pop("cmd")

    # prepare filters
    filters = frappe.form_dict.get("filters")
    if not filters:
        filters = list()

    filters.append(["days", "in",  [day_name,"Everyday"] ])
    filters.append(["time", "<=", current_time])
    filters.append(["to_time", ">=", current_time])
    frappe.form_dict["filters"] = filters

    # prepare fields
    frappe.form_dict.setdefault("fields", ["name","outlet_name", "parent", "days", "time", "to_time","publish_pos","publish_website"])

    # prepare items
    items: dict[str, list[dict]] = {}

    # get available items
    available_items = frappe.get_all("Menu Availability", **frappe.form_dict)

    # prepare items
    for item in available_items:
        if item.parent not in items:
            items[item.parent] = []
        items[item.parent].append(item)


    # prepare menu filters and fields
    menu_filters = [["name", "in", items.keys()], ["enabled","=",1], ["start_date", "<=", today_date], ["expires_on", ">=", today_date]]
    menu_fields = ["name", "menu_name", "image", "start_date", "expires_on"]
    menus = frappe.get_all("Menus", filters=menu_filters, fields=menu_fields)

    # prepare menus
    for menu in menus:
        menu.items = items[menu.name]
    
    return menus