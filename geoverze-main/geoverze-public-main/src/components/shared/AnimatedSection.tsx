import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Reveals its children once when scrolled into view.
 *
 * The reveal is applied imperatively via a data attribute so entering the
 * viewport never re-renders the wrapped subtree.
 */
export function AnimatedSection({
  className,
  children,
  delay = 0,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => {
      node.dataset["shown"] = "true";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown="false"
      className={cn(
        "translate-y-6 opacity-0 transition-all motion-slow data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 motion-reduce:transition-none",
        className,
      )}
      style={{ transitionDelay: `${Math.min(delay, 240)}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}
