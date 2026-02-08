import requests
import frappe

from .get_catalog_config import get_catalog_config


def call_catalog_api(method="POST", data=None):
    """
    Call the catalog API
    """

    # get catalog config
    catalog_config = get_catalog_config()
    catalog_id = catalog_config["catalog_id"]
    catalog_token = catalog_config["catalog_token"]

    # build the url
    meta_graph_url = f"https://graph.facebook.com/v24.0/{catalog_id}/items_batch"

    # build the header
    headers = {
        "Authorization": f"Bearer {catalog_token}",
        "Content-Type": "application/json",
    }

    # build the payload
    payload = {"requests": data, "item_type": "PRODUCT_ITEM"}

    # make the request
    response = requests.request(method, meta_graph_url, headers=headers, json=payload)
    return response.json()
