from .call_products_api import call_products_api

def get_catalog_product_by_retailer_id(retailer_id: str):
    """
    Get the catalog product by retailer id
    """

    # prepare the filter
    filter = {"retailer_id": {"i_contains": retailer_id}}

    # call the products API
    response = call_products_api(method="GET", filter=filter)

    # return the response
    return response.get("data", [])[0]