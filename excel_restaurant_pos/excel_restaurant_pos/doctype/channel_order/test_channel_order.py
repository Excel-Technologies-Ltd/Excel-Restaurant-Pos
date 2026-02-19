# Copyright (c) 2026, Excel Technologies Ltd and Contributors
# See license.txt

import json
from unittest.mock import MagicMock, patch

import frappe
from frappe.tests.utils import FrappeTestCase
from frappe.utils import now_datetime


def make_uber_order(**kwargs):
    """Return a minimal Uber Eats order dict suitable for _create_channel_order."""
    base = {
        "id": "test-order-uuid-0001",
        "display_id": "ABCD1",
        "current_state": "CREATED",
        "type": "DELIVERY_BY_UBER",
        "placed_at": "2026-02-19T08:05:04Z",
        "store": {"id": "store-uuid-001", "name": "Test Store"},
        "eater": {
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+1 647-555-0100",
        },
        "cart": {
            "items": [
                {
                    "id": "item-001",
                    "title": "Burger",
                    "quantity": 2,
                    "price": {
                        "unit_price": {"amount": 500, "currency_code": "CAD"},
                        "total_price": {"amount": 1000, "currency_code": "CAD"},
                    },
                    "selected_modifier_groups": None,
                    "special_instructions": "",
                }
            ],
            "special_instructions": "",
        },
        "payment": {
            "charges": {
                "sub_total": {"amount": 1000, "currency_code": "CAD"},
                "total": {"amount": 1000, "currency_code": "CAD"},
            }
        },
    }
    base.update(kwargs)
    return base


class TestChannelOrder(FrappeTestCase):
    """Tests for Channel Order doctype and Uber Eats order processing."""

    def tearDown(self):
        """Clean up test Channel Orders after each test."""
        frappe.db.delete("Channel Order", {"order_id": ["like", "test-%"]})
        frappe.db.commit()

    # ------------------------------------------------------------------
    # Creation
    # ------------------------------------------------------------------

    def test_channel_order_created_via_helper(self):
        """_create_channel_order builds a saved Channel Order from Uber data."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order()
        co = _create_channel_order(order, event_id="evt-001")

        self.assertTrue(frappe.db.exists("Channel Order", co.name))
        self.assertEqual(co.order_id, "test-order-uuid-0001")
        self.assertEqual(co.display_id, "ABCD1")
        self.assertEqual(co.current_state, "CREATED")
        self.assertEqual(co.order_from, "Uber Eats")

    def test_channel_order_store_fields(self):
        """Store ID and name are mapped correctly."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0002")
        co = _create_channel_order(order, event_id="evt-002")

        self.assertEqual(co.store_id, "store-uuid-001")
        self.assertEqual(co.store_name, "Test Store")

    def test_channel_order_eater_fields(self):
        """Eater name and phone are mapped correctly."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0003")
        co = _create_channel_order(order, event_id="evt-003")

        self.assertEqual(co.eater_first_name, "John")
        self.assertEqual(co.eater_last_name, "Doe")
        self.assertEqual(co.eater_phone, "+1 647-555-0100")

    def test_channel_order_payment_amounts(self):
        """Subtotal and total are converted from cents to dollars."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0004")
        co = _create_channel_order(order, event_id="evt-004")

        self.assertAlmostEqual(co.subtotal, 10.00)
        self.assertAlmostEqual(co.total, 10.00)
        self.assertEqual(co.currency, "CAD")

    def test_channel_order_items_appended(self):
        """Cart items are added to the items child table."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0005")
        co = _create_channel_order(order, event_id="evt-005")

        self.assertEqual(len(co.items), 1)
        item = co.items[0]
        self.assertEqual(item.item_id, "item-001")
        self.assertEqual(item.title, "Burger")
        self.assertEqual(item.quantity, 2)
        self.assertAlmostEqual(item.unit_price, 5.00)
        self.assertAlmostEqual(item.total_price, 10.00)

    # ------------------------------------------------------------------
    # Phone field edge cases
    # ------------------------------------------------------------------

    def test_phone_as_string(self):
        """Phone as a plain string is stored as-is."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0006")
        order["eater"]["phone"] = "+1 416-000-0000"
        co = _create_channel_order(order, event_id="evt-006")

        self.assertEqual(co.eater_phone, "+1 416-000-0000")

    def test_phone_as_dict(self):
        """Phone as a dict {'number': '...'} extracts the number."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0007")
        order["eater"]["phone"] = {"number": "+1 416-111-1111"}
        co = _create_channel_order(order, event_id="evt-007")

        self.assertEqual(co.eater_phone, "+1 416-111-1111")

    def test_phone_missing(self):
        """Missing phone field does not crash."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0008")
        order["eater"].pop("phone", None)
        co = _create_channel_order(order, event_id="evt-008")

        self.assertEqual(co.eater_phone, "")

    # ------------------------------------------------------------------
    # Null modifier groups
    # ------------------------------------------------------------------

    def test_null_modifier_groups_do_not_crash(self):
        """selected_modifier_groups: null does not raise an exception."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0009")
        # null modifier groups (as returned by Uber Eats)
        order["cart"]["items"][0]["selected_modifier_groups"] = None
        co = _create_channel_order(order, event_id="evt-009")

        self.assertEqual(co.items[0].modifiers, "")

    def test_modifier_groups_mapped(self):
        """Modifier names are joined into the modifiers string."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0010")
        order["cart"]["items"][0]["selected_modifier_groups"] = [
            {
                "selected_items": [
                    {"title": "Extra Cheese", "quantity": 1},
                    {"title": "Bacon", "quantity": 2},
                ]
            }
        ]
        co = _create_channel_order(order, event_id="evt-010")

        self.assertIn("Extra Cheese x1", co.items[0].modifiers)
        self.assertIn("Bacon x2", co.items[0].modifiers)

    # ------------------------------------------------------------------
    # placed_at datetime parsing
    # ------------------------------------------------------------------

    def test_placed_at_utc(self):
        """UTC ISO datetime is stored as naive UTC string."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0011", placed_at="2026-02-19T08:05:04Z")
        co = _create_channel_order(order, event_id="evt-011")

        self.assertEqual(str(co.placed_at), "2026-02-19 08:05:04")

    def test_placed_at_with_offset(self):
        """Timezone-offset ISO datetime is converted to UTC."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        # -05:00 offset → +5h in UTC → 13:05:04
        order = make_uber_order(id="test-order-uuid-0012", placed_at="2026-02-19T08:05:04-05:00")
        co = _create_channel_order(order, event_id="evt-012")

        self.assertEqual(str(co.placed_at), "2026-02-19 13:05:04")

    def test_placed_at_missing_falls_back(self):
        """Missing placed_at falls back to now without crashing."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0013")
        order.pop("placed_at", None)
        co = _create_channel_order(order, event_id="evt-013")

        self.assertIsNotNone(co.placed_at)

    # ------------------------------------------------------------------
    # Special instructions
    # ------------------------------------------------------------------

    def test_special_instructions_from_cart(self):
        """Cart-level special_instructions is stored on the Channel Order."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0014")
        order["cart"]["special_instructions"] = "No onions please"
        co = _create_channel_order(order, event_id="evt-014")

        self.assertEqual(co.special_instructions, "No onions please")

    def test_special_instructions_null_stored_as_empty(self):
        """Null special_instructions is stored as empty string."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _create_channel_order

        order = make_uber_order(id="test-order-uuid-0015")
        order["cart"]["special_instructions"] = None
        co = _create_channel_order(order, event_id="evt-015")

        self.assertEqual(co.special_instructions, "")

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def test_state_defaults_to_created(self):
        """A newly created Channel Order has current_state = CREATED."""
        co = frappe.get_doc({
            "doctype": "Channel Order",
            "order_from": "Uber Eats",
            "order_id": "test-order-uuid-0016",
            "display_id": "TEST1",
            "current_state": "CREATED",
            "placed_at": now_datetime(),
        })
        co.insert(ignore_permissions=True)
        frappe.db.commit()

        loaded = frappe.get_doc("Channel Order", co.name)
        self.assertEqual(loaded.current_state, "CREATED")

    def test_state_can_be_set_to_accepted(self):
        """current_state can be updated to ACCEPTED."""
        co = frappe.get_doc({
            "doctype": "Channel Order",
            "order_from": "Uber Eats",
            "order_id": "test-order-uuid-0017",
            "display_id": "TEST2",
            "current_state": "CREATED",
            "placed_at": now_datetime(),
        })
        co.insert(ignore_permissions=True)
        frappe.db.set_value("Channel Order", co.name, "current_state", "ACCEPTED")
        frappe.db.commit()

        self.assertEqual(
            frappe.db.get_value("Channel Order", co.name, "current_state"),
            "ACCEPTED",
        )

    def test_state_can_be_set_to_rejected(self):
        """current_state can be updated to REJECTED."""
        co = frappe.get_doc({
            "doctype": "Channel Order",
            "order_from": "Uber Eats",
            "order_id": "test-order-uuid-0018",
            "display_id": "TEST3",
            "current_state": "CREATED",
            "placed_at": now_datetime(),
        })
        co.insert(ignore_permissions=True)
        frappe.db.set_value("Channel Order", co.name, "current_state", "REJECTED")
        frappe.db.commit()

        self.assertEqual(
            frappe.db.get_value("Channel Order", co.name, "current_state"),
            "REJECTED",
        )

    # ------------------------------------------------------------------
    # Idempotency
    # ------------------------------------------------------------------

    def test_duplicate_order_id_not_created(self):
        """Webhook idempotency: second event for same order_id is skipped."""
        from excel_restaurant_pos.api.uber_eats.uber_eats import _handle_order_notification

        order_id = "test-order-uuid-0019"

        # Pre-create a Channel Order for this order_id
        frappe.get_doc({
            "doctype": "Channel Order",
            "order_from": "Uber Eats",
            "order_id": order_id,
            "display_id": "DUPE1",
            "current_state": "CREATED",
            "placed_at": now_datetime(),
        }).insert(ignore_permissions=True)
        frappe.db.commit()

        # Calling _handle_order_notification for a duplicate should not enqueue
        with patch("frappe.enqueue") as mock_enqueue:
            _handle_order_notification(
                event_type="orders.notification",
                event_id="evt-dupe",
                order_id=order_id,
                resource_href="https://test-api.uber.com/v2/eats/order/" + order_id,
            )
            mock_enqueue.assert_not_called()

    # ------------------------------------------------------------------
    # accept / deny API wrappers
    # ------------------------------------------------------------------

    def test_accept_uber_eats_order_calls_api(self):
        """accept_uber_eats_order calls accept_order with the correct order_id."""
        # accept_order is imported inside the function from uber_eats_api, patch at source
        with patch(
            "excel_restaurant_pos.api.uber_eats.uber_eats_api.accept_order"
        ) as mock_accept:
            from excel_restaurant_pos.api.uber_eats.uber_eats_orders import accept_uber_eats_order

            result = accept_uber_eats_order("test-order-uuid-0020")

            mock_accept.assert_called_once_with(
                "test-order-uuid-0020", external_reference_id=None
            )
            self.assertEqual(result["status"], "accepted")

    def test_deny_uber_eats_order_calls_api(self):
        """deny_uber_eats_order calls deny_order with reason_code and explanation."""
        with patch(
            "excel_restaurant_pos.api.uber_eats.uber_eats_api.deny_order"
        ) as mock_deny:
            from excel_restaurant_pos.api.uber_eats.uber_eats_orders import deny_uber_eats_order

            result = deny_uber_eats_order(
                "test-order-uuid-0021",
                reason_code="KITCHEN_CLOSED",
                explanation="We are closed",
            )

            mock_deny.assert_called_once_with(
                "test-order-uuid-0021",
                reason_code="KITCHEN_CLOSED",
                explanation="We are closed",
            )
            self.assertEqual(result["status"], "denied")

    def test_cancel_invalid_reason_raises(self):
        """cancel_uber_eats_order raises for unknown reason codes (has validation)."""
        from excel_restaurant_pos.api.uber_eats.uber_eats_orders import cancel_uber_eats_order

        with self.assertRaises(Exception):
            cancel_uber_eats_order("test-order-uuid-0022", reason="INVALID_REASON")

    def test_accept_requires_order_id(self):
        """accept_uber_eats_order raises if order_id is empty."""
        with self.assertRaises(Exception):
            from excel_restaurant_pos.api.uber_eats.uber_eats_orders import accept_uber_eats_order
            accept_uber_eats_order("")

    def test_deny_requires_order_id(self):
        """deny_uber_eats_order raises if order_id is empty."""
        with self.assertRaises(Exception):
            from excel_restaurant_pos.api.uber_eats.uber_eats_orders import deny_uber_eats_order
            deny_uber_eats_order("")
