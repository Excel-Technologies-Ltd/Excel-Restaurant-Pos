import frappe

from .prepare_item import prepare_item
from .call_catalog_api import call_catalog_api


def create_catalog_item(item_code: str):
    """
    Create a catalog item for the given item code
    """
    # prepare the item
    item = prepare_item(item_code)

    # prepare the payload
    payload = [{"method": "CREATE", "data": item}]

    frappe.logger().info(f"Payload: {payload}")

    # call the catalog API
    response = call_catalog_api(method="POST", data=payload)

    # return the response
    return response
