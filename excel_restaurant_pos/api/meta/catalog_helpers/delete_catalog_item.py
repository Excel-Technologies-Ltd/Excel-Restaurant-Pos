import frappe

from .prepare_item import prepare_item
from .call_catalog_api import call_catalog_api


def delete_catalog_item(item_code: str):
    """
    Delete a catalog item for the given item code
    """
    frappe.msgprint(f"Deleting catalog item for: {item_code}")

    # prepare the item
    item = prepare_item(item_code)

    # make id to retailer_id and than pop id
    item["retailer_id"] = item.pop("id")

    # prepare the payload
    payload = [{"method": "DELETE", "data": item}]

    # print the payload
    frappe.logger.info(f"Payload: {payload}")

    # call the catalog API
    response = call_catalog_api(method="POST", data=payload)

    # return the response
    return response
