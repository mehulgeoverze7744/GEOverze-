import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createLibraryMediaSignedUrl,
  creatorAssetObjectPath,
  isLibraryMediaPath,
  removeLibraryMediaObject,
  uploadLibraryMediaObject,
} from "@/lib/supabase/library-media";

type CreatorMediaPanelProps = {
  handle: string;
  artKey: string;
  onChange: (artKey: string) => void;
  readOnly?: boolean;
};

const AVATAR_ASSET_ID = "avatar";

export function CreatorMediaPanel({
  handle,
  artKey,
  onChange,
  readOnly = false,
}: CreatorMediaPanelProps) {
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
    if (!handle.trim()) {
      setMediaError("Set a handle before uploading creator media.");
      return;
    }

    setMediaError(null);
    setBusy(true);
    void (async () => {
      try {
        const nextPath = creatorAssetObjectPath(handle, AVATAR_ASSET_ID, file.type);
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
      <Label>Creator avatar</Label>
      <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-dashed border-border-strong bg-muted/30">
        {preview ? (
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-xs text-muted-foreground">
            {artKey || "No avatar uploaded"}
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
            {isLibraryMediaPath(artKey) ? "Replace avatar" : "Upload avatar"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Stored at creators/&#123;handle&#125;/avatar.&#123;ext&#125; in the private
            library-media bucket.
          </p>
        </>
      ) : null}
    </div>
  );
}
