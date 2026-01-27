"""Convert numeric values to formatted string with specified decimal precision."""

from frappe.utils import flt


def convert_to_decimal_string(
    value: float | int | str | None, precision: int | None = None
) -> str:
    """
    Convert a numeric value to a formatted string.
    
    If precision is None or 0, returns an integer string (no decimal places).
    Otherwise, returns a decimal string with specified precision.
    
    Uses Frappe's flt() function for consistent number handling.
    
    Args:
        value: The numeric value to convert (float, int, string, or None)
        precision: Number of decimal places. If None or 0, returns integer string.
        
    Returns:
        str: Formatted string - integer if precision is None/0, decimal otherwise
        
    Examples:
        >>> convert_to_decimal_string(123.456)
        '123'
        >>> convert_to_decimal_string(123.456, precision=2)
        '123.46'
        >>> convert_to_decimal_string(100, precision=0)
        '100'
        >>> convert_to_decimal_string(None)
        '0'
    """
    if value is None:
        value = 0
    
    # Use Frappe's flt() for consistent number handling
    numeric_value = flt(value)
    
    # If precision is None or 0, return integer string
    if precision is None or precision == 0:
        return str(int(round(numeric_value)))
    
    # Otherwise, return decimal string with specified precision
    return f"{round(numeric_value, precision):.{precision}f}"
