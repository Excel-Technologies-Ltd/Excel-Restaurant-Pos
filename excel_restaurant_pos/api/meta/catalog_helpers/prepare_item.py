import frappe


def prepare_item(item_code: str):
    """
    Prepare the item for the catalog API
    """

    # get the item
    item = frappe.get_doc("Item", item_code)
    if not item:
        frappe.throw(f"Item {item_code} not found")

    # prepare item as like meta catalog item
    selling_prices = frappe.get_all(
        "Item Price",
        filters={"item_code": item_code, "selling": 1},
        fields=["price_list", "price_list_rate"],
    )

    # price map
    price_map = {
        price["price_list"]: f"{price['price_list_rate']} CAD"
        for price in selling_prices
    }

    # catalog item
    description = (
        frappe.utils.strip_html(item.description or "") if item.description else ""
    )
    img_url = frappe.utils.get_url(item.image) if item.image else ""

    catalog_item = {
        "id": item_code,
        "title": item.item_name,
        "description": description,
        "image": [{"url": img_url}],
        "price": price_map["Standard Selling"],
        "sale_price": price_map["Standard Selling"],
        "availability": "in stock",
        "condition": "new",
        "brand": "BanCan",
        "link": f"https://order.bancankitchen.ca",
    }

    if "Offer Price" in price_map:
        catalog_item["sale_price"] = price_map["Offer Price"]

    return catalog_item
