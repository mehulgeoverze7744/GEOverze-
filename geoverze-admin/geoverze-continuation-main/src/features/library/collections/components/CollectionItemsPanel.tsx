import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLibraryResources } from "@/features/library/hooks/useLibraryResources";

type CollectionItemsPanelProps = {
  memberResourceIds: string[];
  onChange: (resourceIds: string[]) => void;
  readOnly?: boolean;
};

export function CollectionItemsPanel({
  memberResourceIds,
  onChange,
  readOnly = false,
}: CollectionItemsPanelProps) {
  const [query, setQuery] = useState("");
  const { resources, loading } = useLibraryResources();

  const resourceById = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);

  const members = memberResourceIds
    .map((id) => resourceById.get(id))
    .filter((resource): resource is NonNullable<typeof resource> => Boolean(resource));

  const available = useMemo(() => {
    const memberSet = new Set(memberResourceIds);
    const q = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (memberSet.has(resource.id)) return false;
      if (!q) return true;
      return (
        resource.title.toLowerCase().includes(q) ||
        resource.slug.toLowerCase().includes(q) ||
        resource.category.toLowerCase().includes(q)
      );
    });
  }, [memberResourceIds, query, resources]);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= memberResourceIds.length) return;
    const next = [...memberResourceIds];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item!);
    onChange(next);
  };

  const add = (resourceId: string) => {
    if (memberResourceIds.includes(resourceId)) return;
    onChange([...memberResourceIds, resourceId]);
  };

  const remove = (resourceId: string) => {
    onChange(memberResourceIds.filter((id) => id !== resourceId));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Collection membership</p>
        <p className="text-xs text-muted-foreground">
          Add GEOlibrary resources and set the reading order. Positions save when the collection is
          saved.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading resources…</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {members.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">
              No resources in this collection yet.
            </li>
          ) : (
            members.map((resource, index) => (
              <li key={resource.id} className="flex items-center gap-2 p-3 text-sm">
                <span className="w-6 text-xs text-muted-foreground tabular">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{resource.title}</p>
                  <p className="truncate text-xs text-muted-foreground">/{resource.slug}</p>
                </div>
                <StatusBadge status={resource.status} />
                {!readOnly ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Move down"
                      disabled={index === members.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${resource.title}`}
                      onClick={() => remove(resource.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      )}

      {!readOnly ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search resources to add"
            placeholder="Search title or slug…"
          />
          <ul className="max-h-56 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {available.length === 0 ? (
              <li className="p-3 text-sm text-muted-foreground">No matching resources.</li>
            ) : (
              available.slice(0, 20).map((resource) => (
                <li key={resource.id} className="flex items-center gap-2 p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{resource.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /{resource.slug} · {resource.category}
                    </p>
                  </div>
                  <StatusBadge status={resource.status} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => add(resource.id)}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
