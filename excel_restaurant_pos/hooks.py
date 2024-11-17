app_name = "excel_restaurant_pos"
app_title = "Excel Restaurant Pos"
app_publisher = "Sohanur Rahman"
app_description = "Restaurant Order and Billing Management System"
app_email = "sohan.dev@excelbd.com"
app_license = "MIT"

# Includes in <head>
# ------------------

fixtures = [
    {"dt": "Role", "filters": [
        [
            "name", "in", [
                "Restaurant Waiter",
                "Restaurant Manager",
                "Restaurant Chef"
            ]
        ]
    ]},
    {"dt": "Custom Field", "filters": [
        [
            "name", "in", [
                "Item-add_ons_item",
                "Item-add_ons_item_list",
                # "Item-frequently_bought_item_list",
                # "Item-frequently_bought_items",
                "Item Group-is_add_ons",
                "Item Group-is_restaurant_pos",
                "Item-default_variant",
                "Item Group-column_break_qf15o",
                "Item Group-column_break_uytx9"
            ]
        ]
    ]},
    {"dt": "Property Setter", "filters": [
        [
            "name", "in", [
                "Item-main-quick_entry",
                "Item Group-main-make_attachments_public",
                "Item Group-image-hidden"
            ]
        ]
    ]}
]
# include js, css files in header of desk.html
# app_include_css = "/assets/excel_restaurant_pos/css/excel_restaurant_pos.css"
# app_include_js = "/assets/excel_restaurant_pos/js/excel_restaurant_pos.js"

# include js, css files in header of web template
# web_include_css = "/assets/excel_restaurant_pos/css/excel_restaurant_pos.css"
# web_include_js = "/assets/excel_restaurant_pos/js/excel_restaurant_pos.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "excel_restaurant_pos/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "excel_restaurant_pos.utils.jinja_methods",
# 	"filters": "excel_restaurant_pos.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "excel_restaurant_pos.install.before_install"
# after_install = "excel_restaurant_pos.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "excel_restaurant_pos.uninstall.before_uninstall"
# after_uninstall = "excel_restaurant_pos.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "excel_restaurant_pos.utils.before_app_install"
# after_app_install = "excel_restaurant_pos.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "excel_restaurant_pos.utils.before_app_uninstall"
# after_app_uninstall = "excel_restaurant_pos.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "excel_restaurant_pos.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Item": {
		# "on_create": "excel_restaurant_pos.doc_event.item.create_add_on_item",
		"on_update": "excel_restaurant_pos.doc_event.item.create_add_on_item"
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"excel_restaurant_pos.tasks.all"
# 	],
# 	"daily": [
# 		"excel_restaurant_pos.tasks.daily"
# 	],
# 	"hourly": [
# 		"excel_restaurant_pos.tasks.hourly"
# 	],
# 	"weekly": [
# 		"excel_restaurant_pos.tasks.weekly"
# 	],
# 	"monthly": [
# 		"excel_restaurant_pos.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "excel_restaurant_pos.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "excel_restaurant_pos.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "excel_restaurant_pos.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["excel_restaurant_pos.utils.before_request"]
# after_request = ["excel_restaurant_pos.utils.after_request"]

# Job Events
# ----------
# before_job = ["excel_restaurant_pos.utils.before_job"]
# after_job = ["excel_restaurant_pos.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"excel_restaurant_pos.auth.validate"
# ]

website_route_rules = [{'from_route': '/restaurant/<path:app_path>', 'to_route': 'restaurant'},]
