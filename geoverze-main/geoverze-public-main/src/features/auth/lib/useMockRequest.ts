import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Simulates a network round-trip so every auth screen can show real
 * idle → pending → success/error states without a backend.
 *
 * Swap the body for a server call in the backend phase; the state machine and
 * every consumer stay untouched.
 */
export type RequestState = "idle" | "pending" | "success" | "error";

export function useMockRequest({ delay = 1100 }: { delay?: number } = {}) {
  const [state, setState] = useState<RequestState>("idle");
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  const run = useCallback(
    (options?: { failWith?: string | null; onSuccess?: () => void; delay?: number }) =>
      new Promise<boolean>((resolve) => {
        setError(null);
        setState("pending");
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
      }),
    [delay],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return { state, error, run, reset, isPending: state === "pending" } as const;
}

/**
 * Demo failure hook: this address always fails so the error state is
 * reviewable without a backend.
 */
export const DEMO_FAILING_EMAIL = "error@geoverze.com";

export function demoFailureFor(email: string) {
  return email.trim().toLowerCase() === DEMO_FAILING_EMAIL
    ? "We couldn't verify those credentials. Check your details and try again."
    : null;
}
