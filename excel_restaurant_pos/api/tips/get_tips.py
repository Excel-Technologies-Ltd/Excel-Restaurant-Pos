from frappe import whitelist, form_dict, get_all


@whitelist(allow_guest=True)
def get_tips():
    """Get tips for a criteria"""

    # remove cmd from form_dict
    if form_dict.get("cmd"):
        form_dict.pop("cmd")

    # get tips
    tips = get_all("TIPS Criteria", **form_dict)

    return tips
