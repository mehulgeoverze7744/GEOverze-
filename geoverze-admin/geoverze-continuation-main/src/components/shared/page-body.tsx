import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageBodyProps {
  children: ReactNode;
  /** Vertical rhythm between page sections. */
  gap?: "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
}

const gaps = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
} as const;

/**
 * Standard body wrapper rendered under a `PageHeader`.
 * Keeps vertical rhythm identical across every module.
 */
export function PageBody({ children, gap = "md", className }: PageBodyProps) {
  return <div className={cn(gaps[gap], className)}>{children}</div>;
}
