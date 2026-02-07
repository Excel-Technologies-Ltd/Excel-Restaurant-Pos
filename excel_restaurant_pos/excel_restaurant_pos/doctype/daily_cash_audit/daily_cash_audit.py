# Copyright (c) 2026, Sohanur Rahman and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime, flt


class DailyCashAudit(Document):
    def validate(self):
        self.validate_counter()
        self.calculate_difference()
        self.validate_reason()
        if self.submission_type == "Clock In":
            self.validate_no_open_shift()
        if self.submission_type == "Clock Out":
            self.validate_clock_out()

    def on_submit(self):
        self.db_set("submitted_by", frappe.session.user)
        self.db_set("submitted_on", now_datetime())

        if flt(self.difference) != 0:
            je_name = self.create_journal_entry()
            self.db_set("journal_entry", je_name)

    def validate_counter(self):
        outlet = frappe.db.get_single_value("ArcPOS Settings", "default_outlet")
        if not outlet:
            frappe.throw(_("Default Outlet is not set in ArcPOS Settings"))

        counters = frappe.get_all(
            "Outlet wise Counters",
            filters={"parent": outlet, "parenttype": "Territory"},
            pluck="counter_name",
        )
        if self.counter_name not in counters:
            frappe.throw(
                _("Counter {0} is not assigned to outlet {1}").format(
                    self.counter_name, outlet
                )
            )

    def calculate_difference(self):
        self.difference = flt(self.submitted_total) - flt(self.expected_cash)

    def validate_reason(self):
        if flt(self.difference) != 0 and not self.reason:
            frappe.throw(_("Reason is mandatory when there is a cash difference"))

    def validate_no_open_shift(self):
        last_clock_in = frappe.db.get_value(
            "Daily Cash Audit",
            {
                "counter_name": self.counter_name,
                "submission_type": "Clock In",
                "docstatus": ["in", [0, 1]],
                "name": ["!=", self.name or ""],
            },
            ["name", "submitted_on"],
            order_by="submitted_on desc",
        )
        if not last_clock_in:
            return

        has_clock_out = frappe.db.exists(
            "Daily Cash Audit",
            {
                "counter_name": self.counter_name,
                "submission_type": "Clock Out",
                "docstatus": ["in", [0, 1]],
                "clock_in_reference": last_clock_in[0],
            },
        )
        if not has_clock_out:
            frappe.throw(
                _("Counter {0} has an open shift that was never Clocked Out. Please Clock Out first.").format(
                    self.counter_name
                )
            )

    def validate_clock_out(self):
        if not self.clock_in_reference:
            frappe.throw(_("Clock In Reference is required for Clock Out"))

        # Validate the referenced Clock In exists and belongs to the same counter
        clock_in = frappe.db.get_value(
            "Daily Cash Audit",
            self.clock_in_reference,
            ["counter_name", "submission_type", "docstatus"],
            as_dict=True,
        )
        if not clock_in:
            frappe.throw(_("Referenced Clock In {0} does not exist").format(self.clock_in_reference))
        if clock_in.submission_type != "Clock In":
            frappe.throw(_("Referenced document {0} is not a Clock In").format(self.clock_in_reference))
        if clock_in.counter_name != self.counter_name:
            frappe.throw(_("Clock In Reference must belong to the same counter"))

        # Only one Clock Out per Clock In
        existing_clock_out = frappe.db.exists(
            "Daily Cash Audit",
            {
                "clock_in_reference": self.clock_in_reference,
                "submission_type": "Clock Out",
                "docstatus": ["in", [0, 1]],
                "name": ["!=", self.name or ""],
            },
        )
        if existing_clock_out:
            frappe.throw(
                _("A Clock Out already exists for this Clock In ({0})").format(self.clock_in_reference)
            )

    def create_journal_entry(self):
        company = frappe.db.get_single_value("ArcPOS Settings", "company")
        if not company:
            frappe.throw(_("Default Company is not set in ArcPOS Settings"))

        cash_account = frappe.db.get_value("Company", company, "default_cash_account")
        if not cash_account:
            frappe.throw(_("Default Cash Account is not set for Company {0}").format(company))

        diff = flt(self.difference)
        abs_diff = abs(diff)

        if diff > 0:
            # Surplus: Debit Cash, Credit Income
            income_account = frappe.db.get_value("Company", company, "default_income_account")
            if not income_account:
                frappe.throw(_("Default Income Account is not set for Company {0}").format(company))

            debit_account = cash_account
            credit_account = income_account
        else:
            # Shortage: Debit Deferred Expense, Credit Cash
            deferred_expense_account = frappe.db.get_value(
                "Company", company, "default_deferred_expense_account"
            )
            if not deferred_expense_account:
                frappe.throw(
                    _("Default Deferred Expense Account is not set for Company {0}").format(company)
                )

            debit_account = deferred_expense_account
            credit_account = cash_account

        je = frappe.new_doc("Journal Entry")
        je.voucher_type = "Journal Entry"
        je.company = company
        je.posting_date = frappe.utils.nowdate()
        je.user_remark = _("Cash Audit Difference - {0} - {1}").format(
            self.submission_type, self.counter_name
        )

        je.append("accounts", {
            "account": debit_account,
            "debit_in_account_currency": abs_diff,
            "credit_in_account_currency": 0,
        })
        je.append("accounts", {
            "account": credit_account,
            "debit_in_account_currency": 0,
            "credit_in_account_currency": abs_diff,
        })

        je.insert(ignore_permissions=True)
        frappe.enqueue(
            submit_journal_entry,
            queue="short",
            je_name=je.name,
        )

        return je.name

    def notify_managers(self):
        managers = frappe.get_all(
            "User",
            filters={"enabled": 1},
            fields=["name"],
        )

        arcpos_managers = []
        for user in managers:
            user_roles = frappe.get_doc("User", user.name).get("roles")
            for role in user_roles:
                if role.role == "ArcPOS Manager":
                    arcpos_managers.append(user.name)
                    break

        current_user = frappe.session.user
        diff_type = "Surplus" if flt(self.difference) > 0 else "Shortage"

        for manager in arcpos_managers:
            frappe.get_doc({
                "doctype": "Notification Log",
                "for_user": manager,
                "from_user": current_user,
                "subject": _("Cash Audit Difference Found - {0}").format(self.counter_name),
                "email_content": _(
                    "{0} of {1} detected at counter {2} during {3}. Reason: {4}"
                ).format(diff_type, abs(flt(self.difference)), self.counter_name, self.submission_type, self.reason),
                "document_type": "Daily Cash Audit",
                "document_name": self.name,
                "type": "Alert",
                "read": 0,
            }).insert(ignore_permissions=True)


def submit_journal_entry(je_name):
    je = frappe.get_doc("Journal Entry", je_name)
    je.submit()
