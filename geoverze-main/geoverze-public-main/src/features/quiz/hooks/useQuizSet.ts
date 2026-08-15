import { useEffect, useState } from "react";

import { fetchQuizSet } from "../data/fetchQuizSet";
import type { QuizSet } from "../data/types";

export type UseQuizSetResult = {
  set: QuizSet | null;
  loading: boolean;
  error: string | null;
};

/**
 * React hook that resolves a QuizSet from Supabase and exposes
 * loading / error states.
 *
 * Fetches on mount and whenever `id` changes.  Falls back to the
 * static in-memory resolver via fetchQuizSet() so the hook never
 * returns an empty quiz even when the database is unreachable.
 */
export function useQuizSet(id: string | undefined): UseQuizSetResult {
  const [set, setSet] = useState<QuizSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setLoading(false);
      setError("No quiz ID provided");
      setSet(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchQuizSet(id)
      .then((result) => {
        if (cancelled) return;
        setSet(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load quiz";
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { set, loading, error };
}
