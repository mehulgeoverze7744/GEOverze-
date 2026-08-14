import { FileText, Grid3x3, Image as ImageIcon, Package, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";
import { MEDIA_ASSETS } from "../data/media";
import type { MediaKind } from "../data/types";
import { CoverThumb } from "../components/CoverThumb";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatBytes, formatDate } from "../lib/format";

const KIND_FILTERS: { id: MediaKind | "all"; label: string }[] = [
  { id: "all", label: "All files" },
  { id: "image", label: "Images" },
  { id: "quiz-asset", label: "Quiz assets" },
  { id: "document", label: "Documents" },
];

const KIND_ICON = { image: ImageIcon, document: FileText, "quiz-asset": Package } as const;

/** Media library: assets available to quizzes and articles. */
export function MediaScreen() {
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(MEDIA_ASSETS[0]?.id ?? null);

  const assets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEDIA_ASSETS.filter(
      (a) =>
        (kind === "all" || a.kind === kind) &&
        (q === "" || a.name.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q))),
    );
  }, [kind, query]);

  const active = MEDIA_ASSETS.find((a) => a.id === selected);
  const totalBytes = MEDIA_ASSETS.reduce((n, a) => n + a.size, 0);

  return (
    <StudioShell
      context={
        <div className="space-y-4">
          <StudioPanel>
            <StudioPanelHeader title="Storage" hint="Placeholder allocation" />
            <p className="text-[1.4rem] font-semibold tabular-nums text-foreground">
              {formatBytes(totalBytes)}
            </p>
            <p className="mt-1 text-[0.75rem] text-foreground/50">of 5 GB used</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bronze/10">
              <div
                className="h-full rounded-full bg-gradient-bronze"
                style={{ width: `${Math.min(100, (totalBytes / 5_368_709_120) * 100 + 4)}%` }}
              />
            </div>
          </StudioPanel>

          {active ? (
            <StudioPanel>
              <StudioPanelHeader title="File details" />
              <CoverThumb artKey={active.artKey} label={active.name} className="h-28 w-full" />
              <dl className="mt-3 space-y-2 text-[0.78rem]">
                <div>
                  <dt className="text-foreground/50">Name</dt>
                  <dd className="mt-0.5 break-all text-foreground/85">{active.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Size</dt>
                  <dd className="tabular-nums text-foreground/80">{formatBytes(active.size)}</dd>
                </div>
                {active.dimensions ? (
                  <div className="flex justify-between">
                    <dt className="text-foreground/50">Dimensions</dt>
                    <dd className="tabular-nums text-foreground/80">{active.dimensions}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Used in</dt>
                  <dd className="tabular-nums text-foreground/80">
                    {active.usedIn} {active.usedIn === 1 ? "item" : "items"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Uploaded</dt>
                  <dd className="text-foreground/80">{formatDate(active.uploadedAt)}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {active.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-bronze/15 px-2 py-0.5 text-[0.68rem] text-foreground/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </StudioPanel>
          ) : null}
        </div>
      }
    >
      <StudioHeader
        eyebrow="Create"
        title="Media library"
        description="Images, quiz assets and documents you can attach to any quiz question or article block."
        actions={
          <GeoButton size="sm" variant="primary" className="gap-2" disabled>
            <Upload className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Upload
          </GeoButton>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex min-w-[14rem] flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-foreground/50"
            strokeWidth={1.8}
            aria-hidden
          />
          <label htmlFor="media-filter" className="sr-only">
            Filter media
          </label>
          <input
            id="media-filter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by filename or tag"
            className="h-9 w-full rounded-lg border border-bronze/15 bg-[oklch(0.175_0.006_60)] pl-9 pr-3 text-[0.8rem] text-foreground outline-none placeholder:text-foreground/50 focus:border-bronze/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setKind(f.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.72rem] transition-colors",
                kind === f.id
                  ? "border-bronze/60 bg-bronze/12 text-bronze-glow"
                  : "border-bronze/12 text-foreground/50 hover:border-bronze/30 hover:text-foreground/80",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <StudioPanel
        className="mb-4 flex items-center gap-3 border-dashed border-bronze/25 bg-transparent"
        aria-label="Upload area"
      >
        <Grid3x3 className="h-5 w-5 shrink-0 text-bronze/90" strokeWidth={1.7} aria-hidden />
        <p className="text-[0.82rem] text-foreground/55">
          Drag files here to upload. Uploads are a placeholder until storage is connected.
        </p>
      </StudioPanel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => {
          const Icon = KIND_ICON[asset.kind];
          const isActive = asset.id === selected;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => setSelected(asset.id)}
              aria-pressed={isActive}
              className={cn(
                "overflow-hidden rounded-xl border text-left transition-colors",
                isActive
                  ? "border-bronze/55 bg-bronze/[0.07]"
                  : "border-bronze/12 hover:border-bronze/35",
              )}
            >
              <CoverThumb
                artKey={asset.artKey}
                label={asset.name}
                className="h-24 w-full rounded-none border-0 border-b border-bronze/12"
              />
              <div className="p-3">
                <p className="flex items-center gap-1.5 truncate text-[0.78rem] text-foreground/85">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-bronze/90"
                    strokeWidth={1.9}
                    aria-hidden
                  />
                  <span className="truncate">{asset.name}</span>
                </p>
                <p className="mt-1 text-[0.68rem] tabular-nums text-foreground/50">
                  {formatBytes(asset.size)} · used in {asset.usedIn}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </StudioShell>
  );
}
