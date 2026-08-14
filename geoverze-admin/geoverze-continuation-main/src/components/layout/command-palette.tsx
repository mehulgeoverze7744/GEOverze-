import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowRight, Moon, Plus, Search, Settings } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { navigation } from "@/lib/nav";
import { useTheme } from "@/hooks/use-theme";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch?: (() => void) | undefined;
}

export function CommandPalette({ open, onOpenChange, onOpenSearch }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (url: string) => {
    onOpenChange(false);
    navigate({ to: url });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a section or run an action…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {navigation.map((group) => {
          const items =
            group.items ??
            (group.url ? [{ title: group.label, url: group.url, icon: group.icon }] : []);
          return (
            <CommandGroup key={group.id} heading={group.label}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={`${group.label} ${item.title} ${"keywords" in item ? (item.keywords ?? "") : ""}`}
                  onSelect={() => go(item.url)}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.title}
                  <CommandShortcut>
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          {onOpenSearch && (
            <CommandItem
              value="global search records"
              onSelect={() => {
                onOpenChange(false);
                onOpenSearch();
              }}
            >
              <Search className="size-4" aria-hidden="true" />
              Search records…
              <CommandShortcut>/</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem
            value="quick create new"
            onSelect={() => {
              onOpenChange(false);
              toast.info("Quick create becomes available once modules ship.");
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Quick create…
          </CommandItem>
          <CommandItem
            value="toggle theme appearance"
            onSelect={() => {
              onOpenChange(false);
              toggleTheme();
            }}
          >
            <Moon className="size-4" aria-hidden="true" />
            Toggle theme
          </CommandItem>
          <CommandItem value="system settings" onSelect={() => go("/settings")}>
            <Settings className="size-4" aria-hidden="true" />
            Open system settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
