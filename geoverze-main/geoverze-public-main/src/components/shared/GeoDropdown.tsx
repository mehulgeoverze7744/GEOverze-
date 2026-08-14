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
}: {
  trigger: ReactNode;
  label?: string;
  align?: "start" | "center" | "end";
  children: ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={12}
        className={cn(
          "glass-panel-strong min-w-56 rounded-2xl border-bronze/20 bg-transparent p-2 text-foreground",
          className,
        )}
      >
        {label ? (
          <>
            <DropdownMenuLabel className="px-3 py-2 text-[0.6rem] uppercase tracking-[0.28em] text-bronze/90">
              {label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-bronze/12" />
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
