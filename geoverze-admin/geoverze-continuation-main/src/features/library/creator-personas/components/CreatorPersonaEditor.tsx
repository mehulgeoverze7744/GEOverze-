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
import { useLibraryCollections } from "@/features/library/collections/hooks/useLibraryCollections";

import { CreatorMediaPanel } from "./CreatorMediaPanel";
import type { LibraryCreatorPersona } from "../types";

type CreatorPersonaEditorProps = {
  persona: LibraryCreatorPersona;
  onSave: (persona: LibraryCreatorPersona) => void;
  onCancel?: () => void;
  submitLabel?: string;
  readOnly?: boolean;
  isNew?: boolean;
};

export function CreatorPersonaEditor({
  persona,
  onSave,
  onCancel,
  submitLabel = "Save creator",
  readOnly = false,
  isNew = false,
}: CreatorPersonaEditorProps) {
  const [draft, setDraft] = useState(persona);
  const { collections } = useLibraryCollections();

  const set = <K extends keyof LibraryCreatorPersona>(key: K, value: LibraryCreatorPersona[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const errors = useMemo(() => {
    const list: string[] = [];
    if (!draft.handle.trim()) list.push("Handle is required.");
    if (draft.displayName.trim().length < 2) list.push("Display name is too short.");
    if (draft.role.trim().length < 2) list.push("Role is required.");
    if (draft.bio.trim().length < 10) list.push("Bio is too short.");
    if (!draft.joinedAt) list.push("Joined date is required.");
    return list;
  }, [draft]);

  const publishedCollections = useMemo(
    () => collections.filter((collection) => collection.status === "published"),
    [collections],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="creator-handle">Handle</Label>
          <Input
            id="creator-handle"
            value={draft.handle}
            disabled={readOnly || !isNew}
            onChange={(event) => {
              const handle = slugify(event.target.value);
              setDraft((prev) => ({
                ...prev,
                handle,
                artKey: prev.artKey || (handle ? `creator-${handle}` : ""),
              }));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="creator-name">Display name</Label>
          <Input
            id="creator-name"
            value={draft.displayName}
            disabled={readOnly}
            onChange={(event) => set("displayName", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="creator-role">Role</Label>
          <Input
            id="creator-role"
            value={draft.role}
            disabled={readOnly}
            onChange={(event) => set("role", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="creator-location">Location</Label>
          <Input
            id="creator-location"
            value={draft.location}
            disabled={readOnly}
            onChange={(event) => set("location", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="creator-bio">Bio</Label>
        <Textarea
          id="creator-bio"
          rows={4}
          value={draft.bio}
          disabled={readOnly}
          onChange={(event) => set("bio", event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="creator-joined">Joined</Label>
          <Input
            id="creator-joined"
            type="date"
            value={draft.joinedAt}
            disabled={readOnly}
            onChange={(event) => set("joinedAt", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Featured collection</Label>
          <Select
            value={draft.featuredCollectionSlug ?? "none"}
            disabled={readOnly}
            onValueChange={(value) =>
              set("featuredCollectionSlug", value === "none" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {publishedCollections.map((collection) => (
                <SelectItem key={collection.slug} value={collection.slug}>
                  {collection.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-7">
          <Switch
            checked={draft.verified}
            disabled={readOnly}
            onCheckedChange={(checked) => set("verified", checked)}
          />
          <Label>Verified creator</Label>
        </div>
      </div>

      <CreatorMediaPanel
        handle={draft.handle}
        artKey={draft.artKey || (draft.handle ? `creator-${draft.handle}` : "")}
        onChange={(artKey) => set("artKey", artKey)}
        readOnly={readOnly}
      />

      <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        {draft.userId ? (
          <p>Linked to auth user {draft.userId}. Ownership is enforced by RLS.</p>
        ) : (
          <p>
            Admin-managed persona (no linked account). Creator claiming remains future functionality
            — do not attach arbitrary users here.
          </p>
        )}
      </div>

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
                draft.artKey.trim() || (draft.handle ? `creator-${draft.handle}` : draft.artKey);
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
    </div>
  );
}
