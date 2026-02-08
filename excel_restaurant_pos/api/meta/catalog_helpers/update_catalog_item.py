import frappe

from .prepare_item import prepare_item
from .call_catalog_api import call_catalog_api


def update_catalog_item(item_code: str):
    """
    Update a catalog item for the given item code
    """
    # prepare the item
    item = prepare_item(item_code)

    # make id to retailer_id and than pop id
    item["retailer_id"] = item.pop("id")

    # prepare the payload
    payload = [{"method": "UPDATE", "data": item}]

    # print the payload
    frappe.logger().info(f"Payload: {payload}")

    # call the catalog API
    response = call_catalog_api(method="POST", data=payload)

    # return the response
    return response
