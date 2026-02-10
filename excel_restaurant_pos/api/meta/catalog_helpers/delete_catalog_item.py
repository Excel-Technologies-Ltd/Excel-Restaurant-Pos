import frappe

from .prepare_item import prepare_item
from .call_catalog_api import call_catalog_api
from .catalog_products import get_catalog_product_by_retailer_id


def delete_catalog_item(item_code: str):
    """
    Delete a catalog item for the given item code
    """
    frappe.msgprint(f"Deleting catalog item for: {item_code}")

    # get the catalog product by retailer id
    catalog_product = get_catalog_product_by_retailer_id(item_code)
    frappe.logger().info(f"Catalog Product: {catalog_product}")

    # prepare the payload
    payload = [{"method": "DELETE", "data": {"id": catalog_product["id"]}}]

    # print the payload
    frappe.logger().info(f"Catalog API Payload: {payload}")

    # call the catalog API
    response = call_catalog_api(method="POST", data=payload)

    # return the response
    return response
