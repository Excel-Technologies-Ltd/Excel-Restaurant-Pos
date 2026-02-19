// Copyright (c) 2026, Excel Technologies Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on("Channel Order", {
	current_state: function (frm) {
		const state = frm.doc.current_state;
		const order_id = frm.doc.order_id;

		if (!order_id) {
			frappe.msgprint(__("Order ID is missing."));
			frm.reload_doc();
			return;
		}

		if (state === "ACCEPTED") {
			frappe.confirm(
				__("Accept this order on Uber Eats?"),
				function () {
					frappe.call({
						method: "excel_restaurant_pos.api.uber_eats.uber_eats_orders.accept_uber_eats_order",
						args: { order_id: order_id },
						freeze: true,
						freeze_message: __("Accepting order..."),
						callback: function (r) {
							if (r.message && r.message.status === "accepted") {
								frappe.show_alert({ message: __("Order accepted successfully."), indicator: "green" });
								frm.save();
							}
						},
						error: function () {
							frm.reload_doc();
						},
					});
				},
				function () {
					frm.reload_doc();
				}
			);
		} else if (state === "REJECTED") {
			const reason_options = [
				"OTHER",
				"STORE_CLOSED",
				"POS_NOT_READY",
				"POS_OFFLINE",
				"ITEM_AVAILABILITY",
				"MISSING_ITEM",
				"MISSING_INFO",
				"PRICING",
				"CAPACITY",
				"ADDRESS",
				"SPECIAL_INSTRUCTIONS",
			];

			const fields = [
				{
					label: __("Reason Code"),
					fieldname: "reason_code",
					fieldtype: "Select",
					options: reason_options.join("\n"),
					default: "OTHER",
					reqd: 1,
				},
				{
					label: __("Explanation"),
					fieldname: "explanation",
					fieldtype: "Small Text",
					default: __("Order denied by restaurant"),
					reqd: 1,
				},
			];

			frappe.prompt(
				fields,
				function (values) {
					frappe.call({
						method: "excel_restaurant_pos.api.uber_eats.uber_eats_orders.deny_uber_eats_order",
						args: {
							order_id: order_id,
							reason_code: values.reason_code,
							explanation: values.explanation,
						},
						freeze: true,
						freeze_message: __("Rejecting order..."),
						callback: function (r) {
							if (r.message && r.message.status === "denied") {
								frappe.show_alert({ message: __("Order rejected successfully."), indicator: "orange" });
								frm.save();
							}
						},
						error: function () {
							frm.reload_doc();
						},
					});
				},
				__("Reject Order"),
				__("Reject"),
				function () {
					frm.reload_doc();
				}
			);
		}
	},
});
