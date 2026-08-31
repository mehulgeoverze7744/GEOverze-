import { useEffect, useRef, useState } from "react";
import { Paperclip, Plus, Upload, X } from "lucide-react";

import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LibraryAttachment, LibraryResource } from "@/features/library/types";
import {
  attachmentKindForMime,
  attachmentObjectPath,
  coverObjectPath,
  createLibraryMediaSignedUrl,
  formatFileSize,
  galleryObjectPath,
  removeLibraryMediaObject,
  uploadLibraryMediaObject,
} from "@/lib/supabase/library-media";

type ResourceMediaPanelProps = {
  draft: LibraryResource;
  onChange: (patch: Partial<LibraryResource>) => void;
  readOnly?: boolean;
};

function randomId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function ResourceMediaPanel({ draft, onChange, readOnly = false }: ResourceMediaPanelProps) {
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<Record<string, string>>({});

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (draft.coverArtKey) {
        const url = await createLibraryMediaSignedUrl(draft.coverArtKey);
        if (!cancelled) setCoverPreview(url);
      } else {
        setCoverPreview(null);
      }

      const previews: Record<string, string> = {};
      for (const path of draft.gallery) {
        const url = await createLibraryMediaSignedUrl(path);
        if (url) previews[path] = url;
      }
      if (!cancelled) setGalleryPreviews(previews);
    })();

    return () => {
      cancelled = true;
    };
  }, [draft.coverArtKey, draft.gallery]);

  const requireSlug = () => {
    if (!draft.slug.trim()) {
      throw new Error("Set a slug on the Details tab before uploading media.");
    }
    return draft.slug.trim();
  };

  const runUpload = async (task: () => Promise<void>) => {
    setMediaError(null);
    setBusy(true);
    try {
      await task();
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleCoverUpload = (file: File | undefined) => {
    if (!file || readOnly) return;
    void runUpload(async () => {
      const slug = requireSlug();
      const nextPath = coverObjectPath(slug, file.type);
      const previousPath = draft.coverArtKey;

      await uploadLibraryMediaObject(nextPath, file);
      onChange({ coverArtKey: nextPath });

      if (previousPath && previousPath !== nextPath) {
        try {
          await removeLibraryMediaObject(previousPath);
        } catch {
          /* old object cleanup is best-effort */
        }
      }
    });
  };

  const handleGalleryUpload = (file: File | undefined) => {
    if (!file || readOnly) return;
    void runUpload(async () => {
      const slug = requireSlug();
      const figureId = randomId("figure");
      const path = galleryObjectPath(slug, figureId, file.type);
      await uploadLibraryMediaObject(path, file);
      onChange({ gallery: [...draft.gallery, path] });
    });
  };

  const handleRemoveGallery = (path: string) => {
    if (readOnly) return;
    void runUpload(async () => {
      onChange({ gallery: draft.gallery.filter((entry) => entry !== path) });
      try {
        await removeLibraryMediaObject(path);
      } catch {
        /* best-effort cleanup */
      }
    });
  };

  const handleAttachmentUpload = (file: File | undefined) => {
    if (!file || readOnly) return;
    void runUpload(async () => {
      const slug = requireSlug();
      const attachmentId = randomId("file");
      const path = attachmentObjectPath(slug, attachmentId, file.type);
      await uploadLibraryMediaObject(path, file);

      const attachment: LibraryAttachment = {
        id: attachmentId,
        name: file.name,
        kind: attachmentKindForMime(file.type),
        size: formatFileSize(file.size),
        path,
        mimeType: file.type,
      };

      onChange({ attachments: [...draft.attachments, attachment] });
    });
  };

  const handleRemoveAttachment = (attachment: LibraryAttachment) => {
    if (readOnly) return;
    void runUpload(async () => {
      onChange({
        attachments: draft.attachments.filter((entry) => entry.id !== attachment.id),
      });
      if (attachment.path) {
        try {
          await removeLibraryMediaObject(attachment.path);
        } catch {
          /* best-effort cleanup */
        }
      }
    });
  };

  const openAttachment = async (attachment: LibraryAttachment) => {
    if (!attachment.path) return;
    const url = await createLibraryMediaSignedUrl(attachment.path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-4">
      {mediaError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mediaError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="res-cover">Cover image label</Label>
        <Input
          id="res-cover"
          value={draft.coverLabel}
          onChange={(event) => onChange({ coverLabel: event.target.value })}
          placeholder="Nile Delta · Africa"
          disabled={readOnly}
        />
        <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border-strong bg-muted/30">
          {coverPreview ? (
            <img src={coverPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="px-4 text-center text-sm text-muted-foreground">
              {draft.coverLabel || "No cover image uploaded"}
            </span>
          )}
        </div>
        {!readOnly ? (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                handleCoverUpload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => coverInputRef.current?.click()}
            >
              <Upload className="size-4" aria-hidden="true" />
              {draft.coverArtKey ? "Replace cover" : "Upload cover"}
            </Button>
          </>
        ) : null}
      </div>

      <div className="space-y-2">
        <SectionHeader title="Gallery" description="Figures rendered inside the article." />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {draft.gallery.map((figure) => (
            <div
              key={figure}
              className="relative flex h-20 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30"
            >
              {galleryPreviews[figure] ? (
                <img src={galleryPreviews[figure]} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-2 text-center text-[11px] text-muted-foreground">{figure}</span>
              )}
              {!readOnly ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 w-7 bg-background/80"
                  aria-label="Remove gallery image"
                  onClick={() => handleRemoveGallery(figure)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ))}
          {!readOnly ? (
            <>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  handleGalleryUpload(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="h-20"
                disabled={busy}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add figure
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <SectionHeader title="Attachments" description="PDFs, datasets and printable maps." />
        <ul className="divide-y divide-border rounded-lg border border-border">
          {draft.attachments.length === 0 && (
            <li className="p-3 text-sm text-muted-foreground">No attachments yet.</li>
          )}
          {draft.attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center gap-2 p-3 text-sm">
              <Paperclip className="size-4 text-muted-foreground" aria-hidden="true" />
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left hover:underline"
                onClick={() => void openAttachment(attachment)}
                disabled={!attachment.path}
              >
                {attachment.name}
              </button>
              <Badge variant="secondary">{attachment.kind}</Badge>
              <span className="text-xs text-muted-foreground tabular">{attachment.size}</span>
              {!readOnly ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => handleRemoveAttachment(attachment)}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
        {!readOnly ? (
          <>
            <input
              ref={attachmentInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={(event) => {
                handleAttachmentUpload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => attachmentInputRef.current?.click()}
            >
              <Paperclip className="size-4" aria-hidden="true" />
              Upload attachment
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
