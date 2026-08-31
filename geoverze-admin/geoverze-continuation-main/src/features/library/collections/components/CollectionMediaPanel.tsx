import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  collectionCoverObjectPath,
  createLibraryMediaSignedUrl,
  isLibraryMediaPath,
  removeLibraryMediaObject,
  uploadLibraryMediaObject,
} from "@/lib/supabase/library-media";

type CollectionMediaPanelProps = {
  slug: string;
  artKey: string;
  onChange: (artKey: string) => void;
  readOnly?: boolean;
};

export function CollectionMediaPanel({
  slug,
  artKey,
  onChange,
  readOnly = false,
}: CollectionMediaPanelProps) {
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isLibraryMediaPath(artKey)) {
        const url = await createLibraryMediaSignedUrl(artKey);
        if (!cancelled) setPreview(url);
      } else {
        setPreview(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [artKey]);

  const handleUpload = (file: File | undefined) => {
    if (!file || readOnly) return;
    if (!slug.trim()) {
      setMediaError("Set a slug before uploading cover art.");
      return;
    }

    setMediaError(null);
    setBusy(true);
    void (async () => {
      try {
        const nextPath = collectionCoverObjectPath(slug, file.type);
        const previousPath = isLibraryMediaPath(artKey) ? artKey : null;
        await uploadLibraryMediaObject(nextPath, file);
        onChange(nextPath);
        if (previousPath && previousPath !== nextPath) {
          try {
            await removeLibraryMediaObject(previousPath);
          } catch {
            /* best-effort */
          }
        }
      } catch (error) {
        setMediaError(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setBusy(false);
      }
    })();
  };

  return (
    <div className="space-y-2">
      {mediaError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mediaError}
        </p>
      ) : null}
      <Label>Cover art</Label>
      <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border-strong bg-muted/30">
        {preview ? (
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-sm text-muted-foreground">
            {artKey || "No cover uploaded"}
          </span>
        )}
      </div>
      {!readOnly ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              handleUpload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" aria-hidden="true" />
            {isLibraryMediaPath(artKey) ? "Replace cover" : "Upload cover"}
          </Button>
        </>
      ) : null}
    </div>
  );
}
