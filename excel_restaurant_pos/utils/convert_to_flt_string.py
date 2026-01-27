"""Convert numeric values to formatted string with specified decimal precision."""

from frappe.utils import flt


def convert_to_flt_string(value: float | int | str | None, precision: int = 2) -> str:
    """
    Convert a numeric value to a formatted string with specified decimal precision.
    
    Uses Frappe's flt() function for consistent number handling and formatting.
    
    Args:
        value: The numeric value to convert (float, int, string, or None)
        precision: Number of decimal places (default: 2)
        
    Returns:
        str: Formatted string with specified precision (e.g., "123.45" for precision=2)
        
    Examples:
        >>> convert_to_flt_string(123.456)
        '123.46'
        >>> convert_to_flt_string(100, precision=2)
        '100.00'
        >>> convert_to_flt_string("99.9", precision=2)
        '99.90'
        >>> convert_to_flt_string(None)
        '0.00'
    """
    if value is None:
        value = 0
    
    # Use Frappe's flt() for consistent number handling
    numeric_value = flt(value)
    
    # Round and format to string with specified precision
    return f"{round(numeric_value, precision):.{precision}f}"
