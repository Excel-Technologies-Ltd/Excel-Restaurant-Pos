"""
Override Frappe's PDF utility to use custom margins.
"""

import frappe
from frappe.utils.pdf import read_options_from_html, get_cookie_options, inline_private_images


def prepare_options(html, options):
    """
    Custom prepare_options that sets margin-left and margin-right to 5mm
    instead of the default 15mm.
    """
    if not options:
        options = {}

    options.update(
        {
            "print-media-type": None,
            "background": None,
            "images": None,
            "quiet": None,
            "encoding": "UTF-8",
        }
    )

    # Custom margins: 5mm instead of default 15mm
    if not options.get("margin-right"):
        options["margin-right"] = "5mm"

    if not options.get("margin-left"):
        options["margin-left"] = "5mm"

    html, html_options = read_options_from_html(html)
    options.update(html_options or {})

    # cookies
    options.update(get_cookie_options())
    html = inline_private_images(html)

    # page size
    pdf_page_size = (
        options.get("page-size")
        or frappe.db.get_single_value("Print Settings", "pdf_page_size")
        or "A4"
    )

    if pdf_page_size == "Custom":
        options["page-height"] = options.get("page-height") or frappe.db.get_single_value(
            "Print Settings", "pdf_page_height"
        )
        options["page-width"] = options.get("page-width") or frappe.db.get_single_value(
            "Print Settings", "pdf_page_width"
        )
    else:
        options["page-size"] = pdf_page_size

    return html, options
