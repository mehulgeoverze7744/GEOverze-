import { useEffect, useState } from "react";

import { resolveLibraryMediaUrl } from "@/lib/supabase/library-media";

export function useLibraryMediaUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void resolveLibraryMediaUrl(path)
      .then((resolved) => {
        if (cancelled) return;
        if (!resolved) {
          setError("Media unavailable");
          setUrl(null);
        } else {
          setUrl(resolved);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Media unavailable");
        setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { url, loading, error };
}
