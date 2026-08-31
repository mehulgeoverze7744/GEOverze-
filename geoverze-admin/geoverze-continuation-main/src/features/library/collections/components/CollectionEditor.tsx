import { useMemo, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/features/library/data";
import { libraryStatuses } from "@/features/library/types";
import { useLibraryResources } from "@/features/library/hooks/useLibraryResources";
import { fetchLibraryCreators } from "@/features/library/data/fetchLibraryResources";
import { useQuery } from "@tanstack/react-query";
import { regions } from "@/lib/catalog";

import { CollectionItemsPanel } from "./CollectionItemsPanel";
import { CollectionMediaPanel } from "./CollectionMediaPanel";
import type { LibraryCollection } from "../types";

const SUBJECT_CATEGORIES = [
  "countries",
  "capitals",
  "flags",
  "landmarks",
  "physical",
  "oceans",
  "culture",
  "climate",
  "heritage",
  "basics",
] as const;

type CollectionEditorProps = {
  collection: LibraryCollection;
  onSave: (collection: LibraryCollection) => void;
  onCancel?: () => void;
  submitLabel?: string;
  readOnly?: boolean;
};

export function CollectionEditor({
  collection,
  onSave,
  onCancel,
  submitLabel = "Save collection",
  readOnly = false,
}: CollectionEditorProps) {
  const [draft, setDraft] = useState(collection);
  const { resources } = useLibraryResources();
  const creatorsQuery = useQuery({
    queryKey: ["library-creators"],
    queryFn: fetchLibraryCreators,
  });

  const set = <K extends keyof LibraryCollection>(key: K, value: LibraryCollection[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const errors = useMemo(() => {
    const list: string[] = [];
    if (draft.title.trim().length < 4) list.push("Title needs at least 4 characters.");
    if (!draft.slug.trim()) list.push("Slug is required.");
    if (draft.description.trim().length < 10) list.push("Description is too short.");
    if (!draft.curatorHandle.trim()) list.push("Curator is required.");
    return list;
  }, [draft]);

  const continentOptions = useMemo(
    () =>
      regions.map((region) => ({
        label: region,
        value:
          region === "Africa"
            ? "africa"
            : region === "Asia"
              ? "asia"
              : region === "Europe"
                ? "europe"
                : region === "North America"
                  ? "north-america"
                  : region === "South America"
                    ? "south-america"
                    : region === "Oceania"
                      ? "oceania"
                      : "global",
      })),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="col-title">Title</Label>
          <Input
            id="col-title"
            value={draft.title}
            disabled={readOnly}
            onChange={(event) => {
              const title = event.target.value;
              setDraft((prev) => ({
                ...prev,
                title,
                slug: prev.slug && prev.slug !== slugify(prev.title) ? prev.slug : slugify(title),
                artKey: prev.artKey || (prev.slug ? `collection-${prev.slug}` : ""),
              }));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="col-slug">Slug</Label>
          <Input
            id="col-slug"
            value={draft.slug}
            disabled={readOnly}
            onChange={(event) => set("slug", slugify(event.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="col-description">Description</Label>
        <Textarea
          id="col-description"
          rows={3}
          value={draft.description}
          disabled={readOnly}
          onChange={(event) => set("description", event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={draft.subjectCategory}
            disabled={readOnly}
            onValueChange={(value) => set("subjectCategory", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Continent</Label>
          <Select
            value={draft.continent}
            disabled={readOnly}
            onValueChange={(value) => set("continent", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {continentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Curator</Label>
          <Select
            value={draft.curatorHandle}
            disabled={readOnly}
            onValueChange={(value) => set("curatorHandle", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select curator" />
            </SelectTrigger>
            <SelectContent>
              {(creatorsQuery.data ?? []).map((creator) => (
                <SelectItem key={creator.handle} value={creator.handle}>
                  {creator.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={draft.status}
            disabled={readOnly}
            onValueChange={(value) => set("status", value as LibraryCollection["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {libraryStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-7">
          <Switch
            checked={draft.featured}
            disabled={readOnly}
            onCheckedChange={(checked) => set("featured", checked)}
          />
          <Label>Featured collection</Label>
        </div>
      </div>

      <CollectionMediaPanel
        slug={draft.slug}
        artKey={draft.artKey || `collection-${draft.slug}`}
        onChange={(artKey) => set("artKey", artKey)}
        readOnly={readOnly}
      />

      <CollectionItemsPanel
        memberResourceIds={draft.memberResourceIds}
        onChange={(memberResourceIds) => set("memberResourceIds", memberResourceIds)}
        readOnly={readOnly}
      />

      {errors.length > 0 ? (
        <ul className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={errors.length > 0}
            onClick={() => {
              const artKey =
                draft.artKey.trim() || (draft.slug ? `collection-${draft.slug}` : draft.artKey);
              onSave({ ...draft, artKey });
            }}
          >
            <Save className="size-4" aria-hidden="true" />
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      ) : null}

      {resources.length === 0 ? null : (
        <p className="text-xs text-muted-foreground">
          {draft.memberResourceIds.length} resources selected for this shelf.
        </p>
      )}
    </div>
  );
}
