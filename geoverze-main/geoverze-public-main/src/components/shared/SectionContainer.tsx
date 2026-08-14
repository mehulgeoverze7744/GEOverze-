import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Constrains page content to the platform's reading width and rhythm. */
export function SectionContainer({
  className,
  children,
  size = "default",
  ...props
}: ComponentProps<"div"> & { children?: ReactNode; size?: "narrow" | "default" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-10",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
