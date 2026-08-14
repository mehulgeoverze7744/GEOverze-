import { useEffect, useState } from "react";

import { usePreferencesStore } from "@/stores/preferencesStore";

/**
 * Single source of truth for motion. Components read this instead of
 * duplicating media-query checks, so the Settings preference and the OS
 * setting can never disagree.
 */
export function useReducedMotion() {
  const motion = usePreferencesStore((s) => s.motion);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (motion === "reduced") return true;
  if (motion === "full") return false;
  return systemReduced;
}
