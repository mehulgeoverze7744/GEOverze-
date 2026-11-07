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
          "geo-drawer flex max-h-[100dvh] flex-col overflow-hidden rounded-none border-l p-0 backdrop-blur-[16px] backdrop-saturate-[1.12]",
          className,
        )}
      >
        <SheetHeader className="geo-drawer-header shrink-0 space-y-0 text-left">
          <SheetTitle className="geo-drawer-title">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="geo-drawer-description">{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="geo-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
