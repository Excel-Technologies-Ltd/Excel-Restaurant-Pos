import requests
import json

from .get_catalog_config import get_catalog_config


def call_products_api(method: str="GET", filter: dict | None=None, data: dict | None=None):
    """
    Call the products API
    """

    # get catalog config
    catalog_config = get_catalog_config()
    catalog_id = catalog_config["catalog_id"]
    catalog_token = catalog_config["catalog_token"]

    # query params
    query_params = ""
    if filter:
        query_params = f"?filter={json.dumps(filter)}"

    # build the url
    b_url = f"https://graph.facebook.com/v24.0/{catalog_id}/products{query_params}"
    
    # build the header
    headers = {
        "Authorization": f"Bearer {catalog_token}",
        "Content-Type": "application/json",
    }


    # make the request
    response = requests.request(method, b_url, headers=headers, json=data)
    return response.json()
