import { useCallback, useEffect, useRef, useState } from "react";

/** Standard lifecycle for every submit/mutation in the app. */
export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export type AsyncActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * One submit lifecycle for every form and mutation.
 *
 * Callers pass an async function; this owns idle → submitting → success/error,
 * the error message and cleanup after unmount. When Supabase mutations land the
 * action body changes and no consumer moves.
 */
export function useAsyncAction<TArgs extends unknown[], TData>(
  action: (...args: TArgs) => Promise<TData>,
  options: { onSuccess?: (data: TData) => void; onError?: (message: string) => void } = {},
) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args: TArgs): Promise<AsyncActionResult<TData>> => {
      setError(null);
      setStatus("submitting");
      try {
        const data = await action(...args);
        if (mounted.current) setStatus("success");
        latest.current.onSuccess?.(data);
        return { ok: true, data };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Something went wrong.";
        if (mounted.current) {
          setError(message);
          setStatus("error");
        }
        latest.current.onError?.(message);
        return { ok: false, error: message };
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    run,
    reset,
    status,
    error,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    isError: status === "error",
  } as const;
}
