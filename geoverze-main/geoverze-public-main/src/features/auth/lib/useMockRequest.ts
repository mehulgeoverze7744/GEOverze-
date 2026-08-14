import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives the idle → pending → success/error state machine every auth screen
 * uses. Originally a fixed-delay simulation; now `run({ action })` awaits a
 * real Supabase call and resolves the same way, so every consumer's markup
 * (spinners, `ValidationMessage`, `SuccessBurst`) needed no changes to become
 * real. The old `failWith` + timer path is kept only as a fallback for any
 * call site that doesn't pass an `action`.
 */
export type RequestState = "idle" | "pending" | "success" | "error";

export type RequestOutcome = { ok: true } | { ok: false; error: string };

export function useMockRequest({ delay = 1100 }: { delay?: number } = {}) {
  const [state, setState] = useState<RequestState>("idle");
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  const run = useCallback(
    (options?: {
      action?: () => Promise<RequestOutcome>;
      failWith?: string | null;
      onSuccess?: () => void;
      delay?: number;
    }) => {
      setError(null);
      setState("pending");

      if (options?.action) {
        return options.action().then((outcome) => {
          if (!mounted.current) return outcome.ok;
          if (!outcome.ok) {
            setError(outcome.error);
            setState("error");
            return false;
          }
          setState("success");
          options.onSuccess?.();
          return true;
        });
      }

      return new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => {
          if (options?.failWith) {
            setError(options.failWith);
            setState("error");
            resolve(false);
            return;
          }
          setState("success");
          options?.onSuccess?.();
          resolve(true);
        }, options?.delay ?? delay);
        timers.current.push(timer);
      });
    },
    [delay],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, run, reset, isPending: state === "pending" } as const;
}
