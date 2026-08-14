import { useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { notifications as seedNotifications } from "@/lib/mock-data";
import type { NotificationItem } from "@/types";
import { cn } from "@/lib/utils";

const sections = [
  "Platform Alerts",
  "Creator Requests",
  "Reports",
  "Orders",
  "Support Tickets",
  "System Alerts",
] as const;

export interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const [items, setItems] = useState<NotificationItem[]>(seedNotifications);
  const [filter, setFilter] = useState<string>("all");

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const unread = items.filter((item) => item.unread).length;

  const markAllRead = () => setItems((current) => current.map((i) => ({ ...i, unread: false })));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="gap-1 border-b border-border p-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base">Notifications</SheetTitle>
            {unread > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {unread} unread
              </Badge>
            )}
          </div>
          <SheetDescription className="text-xs">
            Platform alerts, creator requests, reports, orders and support activity.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {sections.map((section) => (
            <FilterChip
              key={section}
              active={filter === section}
              onClick={() => setFilter(section)}
            >
              {section}
            </FilterChip>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nothing here yet"
              description="New activity for this category will appear in the drawer."
            />
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-accent/40",
                    item.unread && "bg-primary/[0.04]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      item.unread ? "bg-primary" : "bg-border",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      {item.category}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all as read
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "focus-visible:ring-ring/50 rounded-md border px-2 py-1 text-[11px] transition-colors focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
