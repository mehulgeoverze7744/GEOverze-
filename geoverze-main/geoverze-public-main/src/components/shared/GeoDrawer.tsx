import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import "./geo-drawer.css";

/**
 * Glass side panel. Used by mobile navigation and any future contextual panel
 * (filters, cart, notifications) so drawers never diverge in styling.
 */
export function GeoDrawer({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "glass-panel-strong flex max-h-[100dvh] flex-col overflow-hidden rounded-none border-bronze/20 bg-transparent p-0 text-foreground",
          className,
        )}
      >
        <SheetHeader className="shrink-0 border-b border-bronze/12 px-7 py-6 text-left">
          <SheetTitle className="text-[0.68rem] uppercase tracking-[0.3em] text-bronze">
            {title}
          </SheetTitle>
          {description ? (
            <SheetDescription className="text-sm text-foreground/50">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="geo-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 py-7 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
