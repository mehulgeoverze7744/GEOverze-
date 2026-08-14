import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Globe2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isItemActive, navigation, type NavGroup } from "@/lib/nav";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (() => void) | undefined;
}

export function AppSidebar({ collapsed, onToggle, onNavigate }: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const activeGroupId = useMemo(
    () =>
      navigation.find((group) =>
        (group.items ?? []).some((item) => isItemActive(pathname, item.url)),
      )?.id,
    [pathname],
  );

  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    activeGroupId ? [activeGroupId] : ["users"],
  );

  // Keep the group containing the active route expanded.
  useEffect(() => {
    if (activeGroupId) {
      setOpenGroups((current) =>
        current.includes(activeGroupId) ? current : [...current, activeGroupId],
      );
    }
  }, [activeGroupId]);

  const toggleGroup = (id: string) =>
    setOpenGroups((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-60",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Globe2 className="size-4" aria-hidden="true" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">GEOverze</p>
            <p className="truncate text-[11px] text-muted-foreground">Admin Console</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {navigation.map((group) =>
            collapsed ? (
              <CollapsedGroup
                key={group.id}
                group={group}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ) : (
              <ExpandedGroup
                key={group.id}
                group={group}
                pathname={pathname}
                open={openGroups.includes(group.id)}
                onToggle={() => toggleGroup(group.id)}
                onNavigate={onNavigate}
              />
            ),
          )}
        </ul>
      </div>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "w-full justify-start text-muted-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </nav>
  );
}

const rowBase =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";
const rowIdle =
  "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground";
const rowActive = "bg-sidebar-accent font-medium text-sidebar-accent-foreground";

function ExpandedGroup({
  group,
  pathname,
  open,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onNavigate?: (() => void) | undefined;
}) {
  if (!group.items) {
    const active = isItemActive(pathname, group.url ?? "");
    return (
      <li>
        <Link
          to={group.url ?? "/"}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(rowBase, active ? rowActive : rowIdle)}
        >
          <group.icon
            className={cn("size-4 shrink-0", active && "text-primary")}
            aria-hidden="true"
          />
          <span className="truncate">{group.label}</span>
        </Link>
      </li>
    );
  }

  const groupActive = group.items.some((item) => isItemActive(pathname, item.url));

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`nav-group-${group.id}`}
        className={cn(rowBase, groupActive && !open ? rowActive : rowIdle)}
      >
        <group.icon
          className={cn("size-4 shrink-0", groupActive && "text-primary")}
          aria-hidden="true"
        />
        <span className="truncate">{group.label}</span>
        <ChevronRight
          className={cn(
            "ml-auto size-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul id={`nav-group-${group.id}`} className="mt-0.5 space-y-0.5 pl-4">
          {group.items.map((item) => {
            const active = isItemActive(pathname, item.url);
            return (
              <li key={item.url}>
                <Link
                  to={item.url}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    rowBase,
                    "border-l border-sidebar-border pl-3",
                    active ? rowActive : rowIdle,
                  )}
                >
                  <item.icon
                    className={cn("size-3.5 shrink-0", active && "text-primary")}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function CollapsedGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: (() => void) | undefined;
}) {
  const groupActive = group.items
    ? group.items.some((item) => isItemActive(pathname, item.url))
    : isItemActive(pathname, group.url ?? "");

  const iconRow = cn(rowBase, "justify-center px-0", groupActive ? rowActive : rowIdle);

  if (!group.items) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={group.url ?? "/"}
              onClick={onNavigate}
              aria-label={group.label}
              aria-current={groupActive ? "page" : undefined}
              className={iconRow}
            >
              <group.icon
                className={cn("size-4", groupActive && "text-primary")}
                aria-hidden="true"
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{group.label}</TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label={group.label} className={iconRow}>
                <group.icon
                  className={cn("size-4", groupActive && "text-primary")}
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{group.label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="w-52">
          <DropdownMenuLabel className="text-xs">{group.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {group.items.map((item) => (
            <DropdownMenuItem key={item.url} asChild>
              <Link to={item.url} onClick={onNavigate}>
                <item.icon className="size-3.5" aria-hidden="true" />
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
