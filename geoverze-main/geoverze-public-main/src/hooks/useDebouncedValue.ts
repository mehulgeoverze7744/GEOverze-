import { useEffect, useState } from "react";

/**
 * Debounces any value. Search inputs use this so a future server query fires
 * once per pause instead of once per keystroke — swapping in a backend needs no
 * component change.
 */
export function useDebouncedValue<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (delay <= 0) {
      setDebounced(value);
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
