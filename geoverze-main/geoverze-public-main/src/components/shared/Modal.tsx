import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Glass modal wrapper — shared shell for every future dialog. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          className?.includes("gvrze-global-search")
            ? "border text-foreground sm:rounded-2xl"
            : "glass-panel-strong border-bronze/25 bg-transparent text-foreground sm:rounded-2xl",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-light tracking-tight">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-foreground/55">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
