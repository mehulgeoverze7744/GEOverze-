/**
 * Premium Apple-inspired onboarding experience.
 *
 * ALL existing state logic is preserved exactly:
 *  - useOnboardingStore  (step, interests, skillLevel, avatarId, complete)
 *  - Supabase writes     (profiles.avatar_id, profile_preferences)
 *  - Navigation          → /play after completion
 *
 * Only the visual layer has been redesigned.
 */
import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { GvrzeWordmark } from "@/components/shared/GvrzeWordmark";
import { ExplorerAvatar } from "@/features/auth/components/ExplorerAvatar";
import { ExplorerAvatarPicker } from "@/features/auth/components/ExplorerAvatarPicker";
import { OnboardingEarth } from "@/features/auth/components/OnboardingEarth";
import { persistableAvatarSelection } from "@/features/auth/lib/avatar";
import {
  INTERESTS,
  SKILL_LEVELS,
  type SkillLevelId,
} from "@/features/auth/data/onboarding";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

import "@/features/auth/styles/onboarding-experience.css";

const TOTAL_STEPS = 5; // Welcome · Interests · Skill · Avatar · Finish

function ProgressPills({ step, total }: { step: number; total: number }) {
  return (
    <div
      className="ob-progress flex items-center gap-[6px]"
      role="progressbar"
      aria-valuenow={step + 1}
      aria-valuemax={total}
      aria-label={`Step ${step + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "ob-progress__seg",
            i < step && "is-done",
            i === step && "is-active",
          )}
        />
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "ob-cta relative w-full max-w-sm text-[17px] font-semibold tracking-tight",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/35 focus-visible:ring-offset-2",
      )}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? <span className="ob-btn-spinner" aria-hidden="true" /> : null}
        {children}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Animated completion checkmark                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

function AnimatedCheck({ size = 72 }: { size?: number }) {
  const half = size / 2;
  const r = half - 3;
  const circ = +(2 * Math.PI * r).toFixed(1);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {/* Circle drawing in */}
      <circle
        cx={half} cy={half} r={r}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        style={{ animation: "ob-draw-circle 0.65s cubic-bezier(0.22,1,0.36,1) forwards" }}
      />
      {/* Check drawing in (delayed) */}
      <path
        d={`M ${half * 0.52} ${half} L ${half * 0.86} ${half * 1.32} L ${half * 1.44} ${half * 0.68}`}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="52"
        strokeDashoffset="52"
        style={{ animation: "ob-draw-check 0.38s cubic-bezier(0.22,1,0.36,1) forwards 0.52s" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 0 — Welcome                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function WelcomeStep({ name }: { name: string | undefined }) {
  return (
    <div className="ob-step flex flex-col items-center gap-5 text-center sm:gap-6">
      <GvrzeWordmark
        decorative
        className="mx-auto h-auto w-[108px] select-none object-center"
      />

      <OnboardingEarth />

      <div className="ob-copy space-y-2">
        <h1 className="text-[2.15rem] font-light leading-[1.12] tracking-[-0.03em] text-[#1D1D1F] sm:text-[2.5rem]">
          Welcome to GVRZE.
        </h1>
        {name ? (
          <p className="text-[15px] text-[#86868B]">Hello, {name}.</p>
        ) : null}
        <p className="text-[16px] font-medium leading-relaxed tracking-tight text-[#1D1D1F]/70">
          Know Earth. Think Global.
        </p>
      </div>

      <div className="ob-chips flex flex-wrap justify-center gap-2">
        {["Explore the world", "Play geography games", "Earn rewards"].map((f) => (
          <span
            key={f}
            className="ob-benefit rounded-full border border-[#E5E5EA] bg-white/90 px-3.5 py-1.5 text-[12px] font-medium text-[#86868B] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 1 — Interests                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function InterestsStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="ob-step space-y-5">
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-light leading-tight tracking-tight text-[#1D1D1F]">
          What interests you?
        </h2>
        <p className="text-[14px] text-[#86868B]">
          Pick everything that excites you. You can change these any time.
        </p>
      </div>

      {/* Chip grid */}
      <div
        role="group"
        aria-label="Choose your interests"
        className="flex flex-wrap gap-2.5"
      >
        {INTERESTS.map((interest) => {
          const on = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(interest.id)}
              className={cn(
                "ob-chip flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13.5px] font-medium",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
                on
                  ? "border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm"
                  : "border-[#E5E5EA] bg-white text-[#1D1D1F] hover:border-[#1D1D1F]/28 hover:bg-black/[0.025]",
              )}
            >
              <interest.icon
                className={cn("h-4 w-4 shrink-0", on ? "text-white" : "text-[#86868B]")}
                strokeWidth={1.5}
              />
              {interest.label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <p className="text-[12px] text-[#86868B]">
          {selected.length} selected
        </p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 2 — Skill level                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

function SkillStep({
  selected,
  onSelect,
}: {
  selected: SkillLevelId | null;
  onSelect: (id: SkillLevelId) => void;
}) {
  return (
    <div className="ob-step space-y-5">
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-light leading-tight tracking-tight text-[#1D1D1F]">
          How well do you know Earth?
        </h2>
        <p className="text-[14px] text-[#86868B]">
          Be honest — GVRZE adapts to you as you improve.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Choose your skill level"
        className="space-y-2.5"
      >
        {SKILL_LEVELS.map((level) => {
          const on = selected === level.id;
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(level.id as SkillLevelId)}
              className={cn(
                "ob-chip group flex w-full items-center gap-4 rounded-2xl border p-4 text-left",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
                on
                  ? "border-[#1D1D1F] bg-white shadow-sm"
                  : "border-[#E5E5EA] bg-white hover:border-[#1D1D1F]/28",
              )}
            >
              {/* Radio indicator */}
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
                  on ? "border-[#1D1D1F]" : "border-[#E5E5EA] group-hover:border-[#1D1D1F]/40",
                )}
              >
                {on ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-black" />
                ) : null}
              </span>

              {/* Text */}
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold tracking-tight text-[#1D1D1F]">
                  {level.label}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-[#86868B]">
                  {level.description}
                </span>
              </span>

              {/* Tick on selected */}
              {on ? (
                <Check className="ml-auto h-4.5 w-4.5 shrink-0 text-black" strokeWidth={2.2} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 3 — Avatar selection                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function AvatarStep({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="ob-step space-y-5">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-[1.9rem] font-light leading-tight tracking-tight text-[#1D1D1F]">
          Choose your avatar.
        </h2>
        <p className="text-[14px] text-[#86868B]">
          Explorers, heroes and classic characters — pick one identity for all of GVRZE.
        </p>
      </div>

      <ExplorerAvatarPicker
        selectedId={selected}
        onSelect={onSelect}
        preview
        columns="onboarding"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Step 4 — Finish                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function FinishStep({
  interests,
  skillLevel,
  avatarId,
}: {
  interests: string[];
  skillLevel: SkillLevelId | null;
  avatarId: string | null;
}) {
  const selectedInterests = INTERESTS.filter((i) => interests.includes(i.id));
  const level = SKILL_LEVELS.find((l) => l.id === skillLevel);

  return (
    <div className="ob-step flex flex-col items-center gap-6 text-center">
      {/* Avatar + animated check overlay */}
      <div className="relative">
        {avatarId ? (
          <ExplorerAvatar avatarId={avatarId} size={88} alt="Selected explorer avatar" />
        ) : (
          <div className="h-[88px] w-[88px] rounded-full bg-[#E5E5EA]" />
        )}
        {/* Animated check badge — bottom right of avatar */}
        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <AnimatedCheck size={28} />
        </span>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-[2.2rem] font-light leading-tight tracking-tight text-[#1D1D1F]">
          You're all set.
        </h2>
        <p className="text-[15px] text-[#86868B]">Your world starts here.</p>
      </div>

      {/* Summary tags */}
      <div className="space-y-3">
        {selectedInterests.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {selectedInterests.map((i) => (
              <span
                key={i.id}
                className="flex items-center gap-1.5 rounded-full border border-[#E5E5EA] bg-white px-3 py-1 text-[11.5px] font-medium text-[#86868B]"
              >
                <i.icon className="h-3 w-3 shrink-0" strokeWidth={1.6} />
                {i.label}
              </span>
            ))}
          </div>
        ) : null}

        {level ? (
          <p className="text-[12px] text-[#86868B]">{level.label} track</p>
        ) : null}
      </div>

      <p className="text-[12px] text-[#86868B]/80">
        You can update your preferences any time in Settings.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main component                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  /* ── Onboarding store ── */
  const step = useOnboardingStore((s) => s.step);
  const setStep = useOnboardingStore((s) => s.setStep);
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const skillLevel = useOnboardingStore((s) => s.skillLevel);
  const setSkillLevel = useOnboardingStore((s) => s.setSkillLevel);
  const avatarId = useOnboardingStore((s) => s.avatarId);
  const setAvatarId = useOnboardingStore((s) => s.setAvatarId);
  const complete = useOnboardingStore((s) => s.complete);

  const [entering, setEntering] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  /* ── Advance rules — identical to original ── */
  const canAdvance =
    step === 0 ||
    (step === 1 && interests.length > 0) ||
    (step === 2 && skillLevel !== null) ||
    (step === 3 && avatarId !== null) ||
    step === 4;

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), TOTAL_STEPS - 1);
    setDirection(clamped < step ? "back" : "forward");
    setStep(clamped);
  };

  /* ── Completion — identical Supabase writes + navigation ── */
  const onEnter = () => {
    setEntering(true);
    complete();

    if (user?.id) {
      const userId = user.id;
      const persisted = persistableAvatarSelection({
        avatarId,
        currentAvatarUrl: null,
      });
      void Promise.all([
        supabase
          .from("profiles")
          .update({ avatar_id: persisted.avatarId, avatar_url: persisted.avatarUrl })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.error("Failed to persist avatar_id", error);
          }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("profile_preferences")
          .upsert(
            { user_id: userId, interests, skill_level: skillLevel },
            { onConflict: "user_id" },
          )
          .then(({ error }: { error: { message: string } | null }) => {
            if (error) {
              console.error("Failed to persist preferences", error);
              toast.error(
                "Could not save your preferences. You can update them later in Settings.",
              );
            }
          }),
      ]);
    }

    setTimeout(() => navigate({ to: "/play" }), 900);
  };

  /* ── Personalized first name ── */
  const firstName =
    user?.displayName?.split(" ")[0] ??
    user?.username ??
    user?.email?.split("@")[0];

  /* ── CTA label per step ── */
  const ctaLabel =
    step === 0
      ? "Let's Begin"
      : step === 4
      ? entering
        ? "Entering GVRZE…"
        : "Enter GVRZE"
      : "Continue";

  /* ── Skip is available on optional steps 1–3 ── */
  const canSkip = step >= 1 && step <= 3;

  return (
    <div
      id="gvrze-onboarding"
      className="ob-shell fixed inset-0 z-50 flex flex-col"
    >
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5EA] bg-white text-[#1D1D1F] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-opacity hover:opacity-70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/35"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}

        <ProgressPills step={step} total={TOTAL_STEPS} />

        {canSkip ? (
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            className="text-[13px] font-medium text-[#86868B] transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30"
          >
            Skip
          </button>
        ) : (
          <div className="w-8" />
        )}
      </header>

      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          step === 0 && "flex",
        )}
      >
        <div
          className={cn(
            "mx-auto w-full max-w-[460px] px-5",
            step === 0 ? "flex flex-1 items-center py-4" : "py-7",
          )}
        >
          <div
            key={step}
            className={cn("w-full", direction === "back" && "ob-dir-back")}
          >
            {step === 0 ? <WelcomeStep name={firstName} /> : null}

            {step === 1 ? (
              <InterestsStep selected={interests} onToggle={toggleInterest} />
            ) : null}

            {step === 2 ? (
              <SkillStep
                selected={skillLevel}
                onSelect={(id) => setSkillLevel(id as SkillLevelId)}
              />
            ) : null}

            {step === 3 ? (
              <AvatarStep selected={avatarId} onSelect={setAvatarId} />
            ) : null}

            {step === 4 ? (
              <FinishStep
                interests={interests}
                skillLevel={skillLevel}
                avatarId={avatarId}
              />
            ) : null}
          </div>
        </div>
      </main>

      <footer
        className="shrink-0 px-5 pt-3"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-3">
          <PrimaryButton
            onClick={step === 4 ? onEnter : () => goTo(step + 1)}
            disabled={!canAdvance || entering}
            loading={entering}
          >
            {ctaLabel}
          </PrimaryButton>

          {step === 0 ? (
            <p className="text-center text-[12px] text-[#86868B]">
              Takes less than a minute · Personalised to you
            </p>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
