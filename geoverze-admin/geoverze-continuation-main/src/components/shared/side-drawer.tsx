import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface SideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | undefined;
  side?: "right" | "left" | undefined;
  width?: string | undefined;
  footer?: ReactNode | undefined;
  /** Removes body padding for edge-to-edge lists. */
  flush?: boolean | undefined;
  children: ReactNode;
}

export function SideDrawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  width = "sm:max-w-md",
  footer,
  flush,
  children,
}: SideDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("flex w-full flex-col gap-0 p-0", width)}>
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-base">{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : (
            <SheetDescription className="sr-only">{title} panel</SheetDescription>
          )}
        </SheetHeader>
        <div className={cn("flex-1 overflow-y-auto", !flush && "p-4")}>{children}</div>
        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
