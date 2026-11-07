import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { resolveFlagUrl } from "../lib/flagImage";
import { resolveMediaSrc } from "../lib/mediaUrl";

function FallbackPlate({
  className,
  label = "Image unavailable",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 text-[0.78rem]">
        <ImageOff className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        {label}
      </span>
    </div>
  );
}

function LoadingPlate({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
        className,
      )}
      aria-busy="true"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2b74c4]/30 border-t-[#2b74c4]" />
      <p className="text-[0.75rem] font-medium">Loading image…</p>
    </div>
  );
}

/**
 * Production image surface: lazy-loads, never shows a broken icon, and
 * resolves flag: / wiki: art keys to real HTTPS assets.
 */
export function QuizImage({
  src,
  alt,
  caption,
  className,
  imgClassName,
  flagHint,
}: {
  src?: string | null;
  alt: string;
  caption?: string;
  className?: string;
  imgClassName?: string;
  flagHint?: { glyph?: string; art?: string; label?: string };
}) {
  const flagUrl = resolveFlagUrl({
    glyph: flagHint?.glyph,
    art: flagHint?.art ?? src ?? undefined,
    label: flagHint?.label,
    width: 640,
  });
  const initial = flagUrl ?? (src && /^(https?:\/\/|\/)/i.test(src) ? src : null);
  const [resolved, setResolved] = useState<string | null>(initial);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(!initial && Boolean(src));
  const [painted, setPainted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setPainted(false);
    if (flagUrl) {
      setResolved(flagUrl);
      setPending(false);
      return;
    }
    if (!src) {
      setResolved(null);
      setPending(false);
      return;
    }
    if (/^(https?:\/\/|\/)/i.test(src)) {
      setResolved(src);
      setPending(false);
      return;
    }
    setPending(true);
    setResolved(null);
    void resolveMediaSrc(src).then((url) => {
      if (cancelled) return;
      setResolved(url);
      setPending(false);
      if (!url) setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [flagUrl, src]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setPainted(true);
  }, [resolved]);

  if (failed || (!resolved && !pending)) {
    return <FallbackPlate className={className} />;
  }

  if (!resolved) {
    return <LoadingPlate className={className} />;
  }

  return (
    <figure className={cn("flex w-full flex-col gap-2", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        {!painted ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#F8FAFC]" aria-busy="true">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2b74c4]/30 border-t-[#2b74c4]" />
            <p className="text-[0.75rem] font-medium text-[#64748B]">Loading image…</p>
          </div>
        ) : null}
        <img
          ref={imgRef}
          src={resolved}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setPainted(true)}
          onError={() => setFailed(true)}
          className={cn(
            "mx-auto max-h-[22rem] w-full object-contain",
            !painted && "opacity-0",
            imgClassName,
          )}
        />
      </div>
      {caption ? (
        <figcaption className="text-center text-[0.75rem] leading-relaxed text-[#64748B]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function FlagTile({
  glyph,
  art,
  label,
  className,
}: {
  glyph?: string;
  art?: string;
  label?: string;
  className?: string;
}) {
  const url = resolveFlagUrl({ glyph, art, label, width: 320 });
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <span
        className={cn(
          "flex aspect-[3/2] w-full items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[2.4rem] leading-none",
          className,
        )}
        role="img"
        aria-label={label ?? "Flag"}
      >
        {glyph ?? "🏳️"}
      </span>
    );
  }

  return (
    <span className={cn("block overflow-hidden rounded-xl border border-[#E2E8F0] bg-white", className)}>
      <img
        src={url}
        alt={label ? `Flag of ${label}` : "Flag"}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="aspect-[3/2] w-full object-cover"
      />
    </span>
  );
}
