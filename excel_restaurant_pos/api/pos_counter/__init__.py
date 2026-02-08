from .cash_audit import get_expected_cash, submit_clock_in_clock_out, check_open_shift, approve_cash_audit

__all__ = ["get_expected_cash", "submit_clock_in_clock_out", "check_open_shift", "approve_cash_audit"]

pos_counter_api_routes = {
    "api.pos_counter.get_expected_cash": "excel_restaurant_pos.api.pos_counter.cash_audit.get_expected_cash",
    "api.pos_counter.submit_clock_in_clock_out": "excel_restaurant_pos.api.pos_counter.cash_audit.submit_clock_in_clock_out",
    "api.pos_counter.check_open_shift": "excel_restaurant_pos.api.pos_counter.cash_audit.check_open_shift",
    "api.pos_counter.approve_cash_audit": "excel_restaurant_pos.api.pos_counter.cash_audit.approve_cash_audit",
}
