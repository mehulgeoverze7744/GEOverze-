import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Fades page content in on every route change. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      className={cn(
        "transition-opacity motion-slow motion-reduce:transition-none",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      {children}
    </div>
  );
}
