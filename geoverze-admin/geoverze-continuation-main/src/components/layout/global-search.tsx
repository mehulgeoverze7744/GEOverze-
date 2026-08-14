import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Database,
  Flag,
  ListChecks,
  Search,
  ShoppingBag,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SearchBar } from "@/components/shared/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { articles, creators, orders, questions, quizzes, reports, users } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Every resource type the enterprise search can surface. */
export type SearchResourceType =
  "users" | "creators" | "quizzes" | "questions" | "articles" | "orders" | "reports";

export interface SearchResult {
  id: string;
  type: SearchResourceType;
  title: string;
  subtitle: string;
  url: string;
}

const resourceMeta: Record<SearchResourceType, { label: string; icon: LucideIcon }> = {
  users: { label: "Users", icon: Users },
  creators: { label: "Creators", icon: UserCog },
  quizzes: { label: "Quizzes", icon: ListChecks },
  questions: { label: "Questions", icon: Database },
  articles: { label: "Articles", icon: BookOpen },
  orders: { label: "Orders", icon: ShoppingBag },
  reports: { label: "Reports", icon: Flag },
};

const index: SearchResult[] = [
  ...users.slice(0, 40).map((row) => ({
    id: row.id,
    type: "users" as const,
    title: row.name,
    subtitle: `${row.email} · ${row.role}`,
    url: "/users",
  })),
  ...creators.slice(0, 30).map((row) => ({
    id: row.id,
    type: "creators" as const,
    title: row.name,
    subtitle: `${row.handle} · ${row.tier}`,
    url: "/creators",
  })),
  ...quizzes.slice(0, 30).map((row) => ({
    id: row.id,
    type: "quizzes" as const,
    title: row.title,
    subtitle: `${row.category} · ${row.author}`,
    url: "/quizzes",
  })),
  ...questions.slice(0, 30).map((row) => ({
    id: row.id,
    type: "questions" as const,
    title: row.prompt,
    subtitle: `${row.type} · ${row.difficulty}`,
    url: "/questions",
  })),
  ...articles.slice(0, 20).map((row) => ({
    id: row.id,
    type: "articles" as const,
    title: row.title,
    subtitle: `${row.section} · ${row.author}`,
    url: "/library",
  })),
  ...orders.slice(0, 25).map((row) => ({
    id: row.id,
    type: "orders" as const,
    title: `${row.id} — ${row.product}`,
    subtitle: `${row.customer} · ${row.status}`,
    url: "/store",
  })),
  ...reports.slice(0, 25).map((row) => ({
    id: row.id,
    type: "reports" as const,
    title: row.subject,
    subtitle: `${row.type} · ${row.severity}`,
    url: "/reports",
  })),
];

const recentSearches = ["suspended users", "refunded orders", "critical reports", "gold creators"];

export interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchResourceType | "all">("all");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return index
      .filter((entry) => (type === "all" ? true : entry.type === type))
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(term) || entry.subtitle.toLowerCase().includes(term),
      )
      .slice(0, 24);
  }, [query, type]);

  const go = (url: string) => {
    onOpenChange(false);
    setQuery("");
    navigate({ to: url });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <DialogDescription className="sr-only">
          Search users, creators, quizzes, questions, articles, orders and reports.
        </DialogDescription>

        <div className="border-b border-border p-3">
          <SearchBar
            autoFocus
            value={query}
            onChange={setQuery}
            label="Global search"
            placeholder="Search across the platform…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
          <TypeChip active={type === "all"} onClick={() => setType("all")}>
            All
          </TypeChip>
          {(Object.keys(resourceMeta) as SearchResourceType[]).map((key) => (
            <TypeChip key={key} active={type === key} onClick={() => setType(key)}>
              {resourceMeta[key].label}
            </TypeChip>
          ))}
        </div>

        <div className="max-h-[52vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-3">
              <p className="px-1 pb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Recent searches
              </p>
              <ul className="space-y-0.5">
                {recentSearches.map((entry) => (
                  <li key={entry}>
                    <Button
                      variant="ghost"
                      className="h-8 w-full justify-start gap-2 px-2 text-sm font-normal"
                      onClick={() => setQuery(entry)}
                    >
                      <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      {entry}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matches found"
              description={`Nothing matches “${query}”. Try a different term or resource type.`}
            />
          ) : (
            <ul className="divide-y divide-border" role="listbox" aria-label="Search results">
              {results.map((result) => {
                const Icon = resourceMeta[result.type].icon;
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      type="button"
                      onClick={() => go(result.url)}
                      className="focus-visible:ring-ring/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">
                          {result.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </span>
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {resourceMeta[result.type].label}
                      </Badge>
                      <ArrowRight
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          <span>Enterprise search preview — results come from sample data.</span>
          <span className="hidden sm:inline">Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TypeChip({
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
        "focus-visible:ring-ring/50 rounded-md border px-2 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
