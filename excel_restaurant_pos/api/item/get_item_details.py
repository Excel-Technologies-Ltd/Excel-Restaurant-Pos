import frappe


# get item details
@frappe.whitelist(allow_guest=True)
def get_item_details():
    """
    Get item details with variants
    """

    item_code = frappe.form_dict.get("item_code")
    if not item_code:
        frappe.throw("item_code is required")

    # Get item document and convert to dict
    item_details = frappe.get_doc("Item", item_code).as_dict()

    # Get variant items
    variant_fields = [
        "name",
        "item_name",
        "item_code",
        "item_group",
        "image",
        "description",
    ]
    variants_items = frappe.get_all(
        "Item", filters={"variant_of": item_code}, fields=variant_fields
    )

    # prepare attributes
    attributes_fields = ["attribute", "attribute_value", "parent", "variant_of"]
    attributes = frappe.get_all(
        "Item Variant Attribute",
        filters={"variant_of": item_code},
        fields=attributes_fields,
        order_by="creation",
    )

    attributes_map: dict[str, list[dict]] = {}
    for attribute in attributes:
        if attribute.parent not in attributes_map:
            attributes_map[attribute.parent] = []
        attributes_map[attribute.parent].append(attribute)

    # prepare addons items
    addons_items = item_details.get("custom_addons_items", [])
    addon_item_codes = [item.item_code for item in addons_items]

    regular_item_codes = [item.item_code for item in variants_items]

    for variant in variants_items:
        regular_item_codes.append(variant.item_code)
        variant.attributes = attributes_map.get(variant.item_code, [])

    # add docs item code
    regular_item_codes.append(item_code)

    # item prices
    regular_prices = frappe.get_all(
        "Item Price",
        filters={
            "item_code": ["in", regular_item_codes],
            "price_list": "Standard Selling",
        },
        fields=["item_code", "price_list_rate"],
    )

    addon_prices = frappe.get_all(
        "Item Price",
        filters={"item_code": ["in", addon_item_codes], "price_list": "Add-on Price"},
        fields=["item_code", "price_list_rate"],
    )

    addon_price_map = {price.item_code: price.price_list_rate for price in addon_prices}

    regular_price_map = {
        price.item_code: price.price_list_rate for price in regular_prices
    }

    # attach price to variants and addons
    for variant in variants_items:
        variant.price = regular_price_map.get(variant.item_code, 0)

    # attach price to addons
    for addon in addons_items:
        addon.price = addon_price_map.get(addon.item_code, 0)

    # attach variants and addons to item details
    item_details["variants_items"] = variants_items
    item_details["price"] = regular_price_map.get(item_code, 0)

    return item_details
