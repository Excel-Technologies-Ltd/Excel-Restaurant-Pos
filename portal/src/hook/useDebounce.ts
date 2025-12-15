import { useEffect, useState } from "react";

/**
 * Debounces a value
 *
 * @param {T} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {T} The debounced value
 */

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
