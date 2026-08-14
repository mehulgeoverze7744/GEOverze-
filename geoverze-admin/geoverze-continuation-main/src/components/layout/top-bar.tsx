import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  Command,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { signOut } from "@/lib/supabase/auth-sync";
import { selectRole, selectUser, useAuthStore } from "@/stores/authStore";

export interface TopBarProps {
  onOpenCommand: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenMobileNav: () => void;
  unreadCount: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

function initialsFor(email: string) {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]/).filter(Boolean);
  const initials =
    parts.length > 1 ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}` : name.slice(0, 2);
  return (initials || "?").toUpperCase();
}

function roleLabel(role: string | null) {
  if (!role) return "Signed in";
  return role
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function TopBar({
  onOpenCommand,
  onOpenSearch,
  onOpenNotifications,
  onOpenMobileNav,
  unreadCount,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const role = useAuthStore(selectRole);

  const handleSignOut = () => {
    void signOut().then(() => navigate({ to: "/login" }));
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/80 px-3 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-4" aria-hidden="true" />
      </Button>

      <button
        type="button"
        onClick={onOpenSearch}
        className="focus-visible:ring-ring/50 group flex h-9 max-w-md min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background/60 px-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Open global search"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Search users, quizzes, orders…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          /
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Badge
          variant="outline"
          className="hidden border-warning/40 bg-warning/10 text-[10px] tracking-wide text-warning uppercase md:inline-flex"
        >
          Development
        </Badge>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenCommand}
              aria-label="Open command palette"
            >
              <Command className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Command palette · ⌘K</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Quick actions">
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Quick actions</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {["New quiz", "Invite admin", "Create announcement", "Issue credits"].map((action) => (
              <DropdownMenuItem
                key={action}
                onSelect={() => toast.info(`${action} — available once modules ship.`)}
              >
                {action}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onOpenNotifications}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="size-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 pl-1.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                {initialsFor(user?.email ?? "?")}
              </span>
              <span className="hidden text-sm sm:inline">{user?.email ?? "Signed in"}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="space-y-0.5">
              <span className="block truncate text-sm">{user?.email ?? "Signed in"}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {roleLabel(role)}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => toast.info("Profile management arrives in a later phase.")}
            >
              <UserCircle2 className="size-4" aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="size-4" aria-hidden="true" />
                System settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/support">
                <LifeBuoy className="size-4" aria-hidden="true" />
                Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
