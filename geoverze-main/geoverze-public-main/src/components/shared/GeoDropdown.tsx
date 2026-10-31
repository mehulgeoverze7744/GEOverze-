import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Glass dropdown surface — one styling for every menu on the platform. */
export function GeoDropdown({
  trigger,
  label,
  align = "end",
  children,
  className,
  labelClassName,
  separatorClassName,
  surface = "glass",
}: {
  trigger: ReactNode;
  label?: string;
  align?: "start" | "center" | "end";
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  separatorClassName?: string;
  /** `solid` is used by the shared notifications panel; other menus stay glass. */
  surface?: "glass" | "solid";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={12}
        className={cn(
          "min-w-56 rounded-2xl p-2",
          surface === "glass"
            ? "glass-panel-strong border-bronze/20 bg-transparent text-foreground"
            : "border border-[#E5E7EB] bg-[#FFFFFF] text-[#111111] shadow-[0_1px_2px_rgb(17_17_17_/_0.04),0_12px_28px_-16px_rgb(17_17_17_/_0.16)]",
          className,
        )}
      >
        {label ? (
          <>
            <DropdownMenuLabel
              className={cn(
                "px-3 py-2 text-[0.6rem] uppercase tracking-[0.28em] text-bronze/90",
                labelClassName,
              )}
            >
              {label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className={cn("bg-bronze/12", separatorClassName)} />
          </>
        ) : null}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Row inside a `GeoDropdown`. */
export function GeoDropdownItem({
  children,
  onSelect,
  className,
  asChild,
}: {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
  asChild?: boolean;
}) {
  return (
    <DropdownMenuItem
      asChild={asChild ?? false}
      {...(onSelect ? { onSelect } : {})}
      className={cn(
        "cursor-pointer rounded-xl px-3 py-2.5 text-sm text-foreground/70 focus:bg-bronze/12 focus:text-bronze",
        className,
      )}
    >
      {children}
    </DropdownMenuItem>
  );
}
