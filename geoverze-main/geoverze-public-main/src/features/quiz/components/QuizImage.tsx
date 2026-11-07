import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (flagUrl) {
      setResolved(flagUrl);
      return;
    }
    if (!src) {
      setResolved(null);
      return;
    }
    if (/^(https?:\/\/|\/)/i.test(src)) {
      setResolved(src);
      return;
    }
    void resolveMediaSrc(src).then((url) => {
      if (!cancelled) setResolved(url);
    });
    return () => {
      cancelled = true;
    };
  }, [flagUrl, src]);

  if (!resolved || failed) {
    return <FallbackPlate className={className} />;
  }

  return (
    <figure className={cn("flex w-full flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn("mx-auto max-h-[22rem] w-full object-contain", imgClassName)}
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
