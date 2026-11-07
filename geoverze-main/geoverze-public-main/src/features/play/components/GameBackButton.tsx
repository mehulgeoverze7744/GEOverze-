import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";

import { playBackFallback } from "../lib/playBackNavigation";

/**
 * Persistent top-left back control for every /play gameplay, lobby, quiz and
 * challenge screen. Prefers in-app history so listing filters stay intact;
 * falls back to the parent play route — never the marketing homepage.
 */
export function GameBackButton() {
  const router = useRouter();
  const navigate = useNavigate();
  const location = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      search: state.location.search as Record<string, unknown>,
      href: `${state.location.pathname}${state.location.searchStr}`,
    }),
  });

  const stackRef = useRef<string[]>([location.href]);
  const busyRef = useRef(false);

  useEffect(() => {
    const key = location.href;
    const stack = stackRef.current;
    const existing = stack.lastIndexOf(key);
    if (existing >= 0 && existing < stack.length - 1) {
      stackRef.current = stack.slice(0, existing + 1);
      return;
    }
    if (stack[stack.length - 1] !== key) {
      stack.push(key);
    }
  }, [location.href]);

  const goBack = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    window.setTimeout(() => {
      busyRef.current = false;
    }, 400);

    if (stackRef.current.length >= 2 && router.history.canGoBack()) {
      router.history.back();
      return;
    }

    const target = playBackFallback(location.pathname, location.search);
    void navigate({ ...target, replace: true });
  };

  return (
    <button type="button" className="game-back-button" aria-label="Go back" onClick={goBack}>
      <ArrowLeft strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
