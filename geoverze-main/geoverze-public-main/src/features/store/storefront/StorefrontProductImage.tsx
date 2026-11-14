import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type StorefrontProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** High-priority LCP image — skip lazy loading. */
  priority?: boolean;
  comingSoon?: boolean;
};

/**
 * Product photo with a first-paint placeholder, preload, and a single retry.
 * Empty `src` never renders a broken `<img>` (the previous first-visit blank).
 */
export function StorefrontProductImage({
  src,
  alt,
  className,
  priority = false,
  comingSoon = false,
}: StorefrontProductImageProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    src ? "loading" : "idle",
  );
  const [shownSrc, setShownSrc] = useState(src);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!src) {
      setShownSrc("");
      setStatus("idle");
      return;
    }

    setShownSrc(src);
    setStatus("loading");

    let cancelled = false;
    const preload = new Image();
    preload.decoding = "async";
    preload.onload = () => {
      if (!cancelled) setStatus("ready");
    };
    preload.onerror = () => {
      if (!cancelled) setStatus("error");
    };
    preload.src = src;
    if (preload.complete && preload.naturalWidth > 0) {
      setStatus("ready");
    }

    return () => {
      cancelled = true;
      preload.onload = null;
      preload.onerror = null;
    };
  }, [src, retryKey]);

  if (!shownSrc) {
    return (
      <div
        className={cn("bg-[#ececec]", className)}
        role="img"
        aria-label={alt || "Product image unavailable"}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-[#f0f0f0]", className)}>
      {status !== "ready" && status !== "error" ? (
        <div className="absolute inset-0 animate-pulse bg-[#e8e8e8]" aria-hidden="true" />
      ) : null}

      <img
        src={shownSrc}
        alt={alt}
        draggable={false}
        decoding="async"
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
        onLoad={() => setStatus("ready")}
        onError={() => {
          if (retryKey === 0) {
            setRetryKey(1);
            return;
          }
          setStatus("error");
        }}
        className={cn(
          "h-full w-full object-cover object-center transition-opacity duration-200",
          comingSoon && "scale-[1.14] blur-[12px]",
          status === "ready" ? "opacity-100" : "opacity-0",
        )}
      />

      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f0f0f0] px-4 text-center">
          <p className="text-[12px] text-[#555]">Image could not load.</p>
          <button
            type="button"
            onClick={() => {
              setRetryKey((n) => n + 1);
              setStatus("loading");
            }}
            className="text-[12px] font-medium text-black underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
