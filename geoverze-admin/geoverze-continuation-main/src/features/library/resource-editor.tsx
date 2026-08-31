import { useMemo, useState } from "react";
import { Bold, Eye, Italic, List, Plus, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/features/library/data";
import {
  libraryDifficulties,
  libraryStatuses,
  type LibraryDifficulty,
  type LibraryResource,
  type LibraryStatus,
} from "@/features/library/types";
import { formatDate } from "@/features/users/format";
import { ResourceMediaPanel } from "@/features/library/components/ResourceMediaPanel";
import {
  allCountries,
  catalogDaysAgo,
  languages,
  libraryAuthors,
  libraryCategories,
  regions,
} from "@/lib/catalog";

export function createDraftResource(): LibraryResource {
  return {
    id: "",
    title: "",
    slug: "",
    category: "Article",
    country: "Worldwide",
    region: "Global",
    difficulty: "Easy",
    tags: [],
    language: "English",
    author: libraryAuthors[0] ?? "Editorial",
    status: "draft",
    featured: false,
    minAccessTier: null,
    views: 0,
    bookmarks: 0,
    readTime: 5,
    description: "",
    body: "",
    coverLabel: "",
    coverArtKey: null,
    gallery: [],
    attachments: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      keywords: [],
    },
    createdAt: catalogDaysAgo(0, 9),
    updatedAt: catalogDaysAgo(0, 9),
    viewsSeries: Array.from({ length: 12 }, () => 0),
    versions: [],
    activity: [],
  };
}

interface ResourceEditorProps {
  resource: LibraryResource;
  onSave: (resource: LibraryResource) => void;
  onCancel?: (() => void) | undefined;
  submitLabel?: string | undefined;
}

export function ResourceEditor({
  resource,
  onSave,
  onCancel,
  submitLabel = "Save resource",
}: ResourceEditorProps) {
  const [draft, setDraft] = useState<LibraryResource>(resource);
  const [tagInput, setTagInput] = useState("");

  const set = <K extends keyof LibraryResource>(key: K, value: LibraryResource[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setSeo = (key: keyof LibraryResource["seo"], value: string | string[]) =>
    setDraft((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));

  const errors = useMemo(() => {
    const list: string[] = [];
    if (draft.title.trim().length < 4) list.push("Title needs at least 4 characters.");
    if (!draft.slug.trim()) list.push("Slug is required.");
    if (draft.description.trim().length < 10) list.push("Description is too short.");
    if (draft.status === "published" && draft.body.trim().length < 40)
      list.push("Published resources need a longer body.");
    return list;
  }, [draft]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || draft.tags.includes(tag)) return;
    set("tags", [...draft.tags, tag]);
    setTagInput("");
  };

  const wrap = (token: string) => set("body", `${draft.body}${draft.body ? "\n" : ""}${token}`);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="res-title">Title</Label>
              <Input
                id="res-title"
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    title,
                    slug:
                      prev.slug && prev.slug !== slugify(prev.title) ? prev.slug : slugify(title),
                  }));
                }}
                placeholder="Atlas of the Nile Delta"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-slug">Slug</Label>
              <Input
                id="res-slug"
                value={draft.slug}
                onChange={(event) => set("slug", slugify(event.target.value))}
                placeholder="atlas-of-the-nile-delta"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="res-description">Description</Label>
            <Textarea
              id="res-description"
              rows={3}
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="One-paragraph summary shown in listings."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <EditorSelect
              label="Category"
              value={draft.category}
              options={[...libraryCategories]}
              onChange={(value) => set("category", value)}
            />
            <EditorSelect
              label="Region"
              value={draft.region}
              options={regions}
              onChange={(value) => set("region", value)}
            />
            <EditorSelect
              label="Country"
              value={draft.country}
              options={allCountries}
              onChange={(value) => set("country", value)}
            />
            <EditorSelect
              label="Difficulty"
              value={draft.difficulty}
              options={libraryDifficulties}
              onChange={(value) => set("difficulty", value as LibraryDifficulty)}
            />
            <EditorSelect
              label="Access tier"
              value={draft.minAccessTier ?? "free"}
              options={["free", "basic", "pro", "advance"]}
              onChange={(value) =>
                set("minAccessTier", value === "free" ? null : value)
              }
            />
            <EditorSelect
              label="Language"
              value={draft.language}
              options={languages}
              onChange={(value) => set("language", value)}
            />
            <EditorSelect
              label="Author"
              value={draft.author}
              options={libraryAuthors}
              onChange={(value) => set("author", value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="res-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="res-tags"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="size-4" aria-hidden="true" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {draft.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    onClick={() =>
                      set(
                        "tags",
                        draft.tags.filter((entry) => entry !== tag),
                      )
                    }
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4 space-y-3">
          <div
            role="toolbar"
            aria-label="Formatting"
            className="flex flex-wrap gap-2 rounded-lg border border-border bg-card px-3 py-2"
          >
            <Button type="button" size="sm" variant="outline" onClick={() => wrap("**bold**")}>
              <Bold className="size-4" aria-hidden="true" />
              Bold
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => wrap("_italic_")}>
              <Italic className="size-4" aria-hidden="true" />
              Italic
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => wrap("- list item")}>
              <List className="size-4" aria-hidden="true" />
              List
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => wrap("## Heading")}>
              Heading
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-body">Rich text body (Markdown)</Label>
            <Textarea
              id="res-body"
              rows={16}
              value={draft.body}
              onChange={(event) => set("body", event.target.value)}
              className="font-mono text-xs"
              placeholder="## Overview…"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="res-read">Read time (minutes)</Label>
              <Input
                id="res-read"
                type="number"
                min={1}
                value={draft.readTime}
                onChange={(event) => set("readTime", Number(event.target.value) || 1)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-4 space-y-4">
          <ResourceMediaPanel
            draft={draft}
            onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
          />
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="seo-title">Meta title</Label>
              <Input
                id="seo-title"
                value={draft.seo.metaTitle}
                onChange={(event) => setSeo("metaTitle", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo-canonical">Canonical URL</Label>
              <Input
                id="seo-canonical"
                value={draft.seo.canonicalUrl}
                onChange={(event) => setSeo("canonicalUrl", event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo-description">Meta description</Label>
            <Textarea
              id="seo-description"
              rows={2}
              value={draft.seo.metaDescription}
              onChange={(event) => setSeo("metaDescription", event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="seo-og-title">OG title</Label>
              <Input
                id="seo-og-title"
                value={draft.seo.ogTitle}
                onChange={(event) => setSeo("ogTitle", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo-og-description">OG description</Label>
              <Input
                id="seo-og-description"
                value={draft.seo.ogDescription}
                onChange={(event) => setSeo("ogDescription", event.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <article className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase">{draft.category}</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {draft.title || "Untitled resource"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{draft.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{draft.author}</span>
              <span>·</span>
              <span>{draft.readTime} min read</span>
              <span>·</span>
              <span>{draft.language}</span>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-foreground">
              {draft.body || "Body preview appears here."}
            </pre>
          </article>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <ol className="divide-y divide-border rounded-lg border border-border">
            {draft.versions.length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">
                No versions yet — history starts after the first save.
              </li>
            )}
            {draft.versions.map((version) => (
              <li key={version.id} className="flex flex-wrap items-center gap-2 p-3 text-sm">
                <Badge variant="secondary">v{version.version}</Badge>
                <span className="min-w-0 flex-1 truncate">{version.summary}</span>
                <span className="text-xs text-muted-foreground">{version.author}</span>
                <span className="text-xs text-muted-foreground tabular">
                  {formatDate(version.at)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => notReadyNow("Version restore arrives with the backend.")}
                >
                  Restore
                </Button>
              </li>
            ))}
          </ol>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Switch
            id="res-featured"
            checked={draft.featured}
            onCheckedChange={(checked) => set("featured", checked)}
          />
          <Label htmlFor="res-featured">Featured</Label>
        </div>
        <div className="w-40">
          <EditorSelect
            label="Status"
            value={draft.status}
            options={libraryStatuses}
            onChange={(value) => set("status", value as LibraryStatus)}
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {errors.length > 0 && (
            <span className="text-xs text-destructive" role="alert">
              {errors[0]}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => notReadyNow("Live preview opens once the reader app is connected.")}
          >
            <Eye className="size-4" aria-hidden="true" />
            Open preview
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={errors.length > 0}
            onClick={() => onSave({ ...draft, updatedAt: catalogDaysAgo(0, 12) })}
          >
            <Save className="size-4" aria-hidden="true" />
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditorSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="capitalize">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
