import frappe

from .prepare_item import prepare_item
from .call_catalog_api import call_catalog_api
from .catalog_products import get_catalog_product_by_retailer_id


def update_catalog_item(item_code: str):
    """
    Update a catalog item for the given item code
    """
    # prepare the item
    item = prepare_item(item_code)

    # get the catalog product by retailer id
    catalog_product = get_catalog_product_by_retailer_id(item_code)
    frappe.logger().info(f"Catalog Product: {catalog_product}")

    # update the item with the catalog product id
    item["retailer_id"] = item.get("id")
    item["id"] = catalog_product["id"]

    # prepare the payload
    payload = [{"method": "UPDATE", "data": item}]

    # print the payload
    frappe.logger().info(f"Payload: {payload}")

    # call the catalog API
    response = call_catalog_api(method="POST", data=payload)

    # return the response
    return response
