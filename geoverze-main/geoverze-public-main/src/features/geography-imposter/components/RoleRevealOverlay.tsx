import { Eye, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";

import { GeoButton } from "@/components/shared";
import type { ImpPrivateInfo } from "../types";

type RoleRevealOverlayProps = {
  privateInfo: ImpPrivateInfo;
  onDismiss: () => void;
};

const COUNTDOWN_SECS = 8;

/** Full-screen overlay shown once at game start so each player sees their word/role. */
export function RoleRevealOverlay({ privateInfo, onDismiss }: RoleRevealOverlayProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);

  useEffect(() => {
    if (countdown <= 0) {
      onDismiss();
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1_000);
    return () => window.clearTimeout(id);
  }, [countdown, onDismiss]);

  const isImposter = privateInfo.role === "imposter";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[oklch(0.10_0.006_60/0.96)] px-6 text-center">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            isImposter
              ? "bg-red-500/20 ring-2 ring-red-500/40"
              : "bg-emerald-500/20 ring-2 ring-emerald-500/40"
          }`}
        >
          {isImposter ? (
            <UserX className="h-9 w-9 text-red-400" strokeWidth={1.6} aria-hidden />
          ) : (
            <UserCheck className="h-9 w-9 text-emerald-400" strokeWidth={1.6} aria-hidden />
          )}
        </div>

        {/* Role label */}
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Your role
          </p>
          <h1
            className={`mt-2 text-3xl font-bold tracking-tight ${
              isImposter ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {isImposter ? "IMPOSTER" : "REGULAR PLAYER"}
          </h1>
        </div>

        {/* Word reveal */}
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] p-6">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            {isImposter ? "Your word (different from theirs!)" : "The secret word"}
          </p>
          <p className="mt-3 text-[2.2rem] font-bold tracking-tight text-foreground">
            {privateInfo.received_word}
          </p>
          {isImposter && (
            <p className="mt-3 text-[0.78rem] text-foreground/50 leading-relaxed">
              You have a <em>related but different</em> word. Give plausible clues without
              revealing that your word differs from the others.
            </p>
          )}
          {!isImposter && (
            <p className="mt-3 text-[0.78rem] text-foreground/50 leading-relaxed">
              Give clever clues for this word. One player among you has a different but
              related word — figure out who!
            </p>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center gap-2 text-[0.75rem] text-foreground/40">
          <Eye className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
          <span>Only you can see this · Auto-closing in {countdown}s</span>
        </div>

        {/* Manual dismiss */}
        <GeoButton variant="solid" size="lg" className="w-full" onClick={onDismiss}>
          I've memorised my word
        </GeoButton>
      </div>
    </div>
  );
}
