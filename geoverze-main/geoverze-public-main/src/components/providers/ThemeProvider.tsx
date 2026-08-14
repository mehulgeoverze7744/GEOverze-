import { useEffect, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Applies platform-level presentation preferences to the document.
 *
 * GEOverze ships one theme — the dark cinematic universe — so the provider's
 * job today is to keep the `dark` class pinned and to reflect the motion
 * preference on the root element (`data-motion`), which utilities and future
 * themes can key off. Additional themes plug in here without touching pages.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }, []);

  useEffect(() => {
    document.documentElement.dataset["motion"] = reducedMotion ? "reduced" : "full";
  }, [reducedMotion]);

  return children;
}
