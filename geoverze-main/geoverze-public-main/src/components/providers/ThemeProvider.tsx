import { useEffect, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Applies platform-level presentation preferences to the document.
 *
 * GVRZE ships one light theme (white / light-grey / light-blue). The provider
 * keeps `color-scheme: light` on the root and reflects the motion preference
 * (`data-motion`) so utilities can key off it. It never waits on route state.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }, []);

  useEffect(() => {
    document.documentElement.dataset["motion"] = reducedMotion ? "reduced" : "full";
  }, [reducedMotion]);

  return children;
}
