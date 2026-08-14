import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Globe2 } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { GeoButton } from "@/components/shared/GeoButton";
import {
  AuthLayout,
  AvatarMark,
  ChoiceCard,
  Stepper,
  SuccessBurst,
} from "@/features/auth/components";
import {
  AVATARS,
  INTERESTS,
  ONBOARDING_STEPS,
  SKILL_LEVELS,
  type SkillLevelId,
} from "@/features/auth/data/onboarding";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/lib/utils";

/** Five-step onboarding. Selections persist locally between steps. */
export function OnboardingPage() {
  const navigate = useNavigate();
  const signInAsDemo = useAuthStore((s) => s.signInAsDemo);
  const user = useAuthStore((s) => s.user);

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

  const canAdvance =
    step === 0 ||
    (step === 1 && interests.length > 0) ||
    (step === 2 && skillLevel !== null) ||
    (step === 3 && avatarId !== null) ||
    step === 4;

  const goTo = (next: number) => setStep(Math.min(Math.max(next, 0), ONBOARDING_STEPS.length - 1));

  const onEnter = () => {
    setEntering(true);
    complete();
    signInAsDemo({
      email: user?.email ?? "explorer@geoverze.com",
      displayName: user?.displayName ?? "Explorer",
      ...(avatarId ? { avatarId } : {}),
    });
    setTimeout(() => navigate({ to: "/play" }), 900);
  };

  return (
    <PageShell>
      <AuthLayout
        width="wide"
        eyebrow={`Step ${step + 1} of ${ONBOARDING_STEPS.length}`}
        title={STEP_TITLES[step] ?? "Set up your explorer profile"}
        {...(STEP_DESCRIPTIONS[step] ? { description: STEP_DESCRIPTIONS[step] } : {})}
        aside={<Stepper steps={ONBOARDING_STEPS} current={step} />}
      >
        <div key={step} className="animate-fade-in motion-reduce:animate-none" aria-live="polite">
          {step === 0 ? <WelcomeStep /> : null}

          {step === 1 ? (
            <div
              role="group"
              aria-label="Choose your interests"
              className="grid gap-3 sm:grid-cols-2"
            >
              {INTERESTS.map((interest) => (
                <ChoiceCard
                  key={interest.id}
                  selected={interests.includes(interest.id)}
                  onSelect={() => toggleInterest(interest.id)}
                  title={interest.label}
                  description={interest.description}
                  icon={<interest.icon className="h-4 w-4" strokeWidth={1.4} />}
                />
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div role="radiogroup" aria-label="Choose your skill level" className="grid gap-3">
              {SKILL_LEVELS.map((level) => (
                <ChoiceCard
                  key={level.id}
                  role="radio"
                  selected={skillLevel === level.id}
                  onSelect={() => setSkillLevel(level.id as SkillLevelId)}
                  title={level.label}
                  description={level.description}
                />
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div
              role="radiogroup"
              aria-label="Choose your avatar"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {AVATARS.map((avatar) => {
                const selected = avatarId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAvatarId(avatar.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all motion-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 motion-reduce:transition-none",
                      selected
                        ? "border-bronze/60 bg-bronze/10 shadow-[var(--glow-bronze)]"
                        : "border-bronze/15 bg-charcoal/40 hover:-translate-y-0.5 hover:border-bronze/35",
                    )}
                  >
                    <AvatarMark id={avatar.id} size={56} />
                    <span
                      className={cn(
                        "text-xs tracking-tight",
                        selected ? "text-foreground" : "text-foreground/55",
                      )}
                    >
                      {avatar.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 4 ? (
            <SuccessBurst
              icon={
                avatarId ? (
                  <AvatarMark id={avatarId} size={56} />
                ) : (
                  <Globe2 className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />
                )
              }
              title="Your universe is ready"
              description={`${interests.length} interest${interests.length === 1 ? "" : "s"} selected${
                skillLevel ? ` · ${SKILL_LEVELS.find((l) => l.id === skillLevel)?.label} track` : ""
              }. You can change any of this later in Settings.`}
            >
              <GeoButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                disabled={entering}
                onClick={onEnter}
              >
                {entering ? "Entering GEOverze…" : "Enter GEOverze"}
              </GeoButton>
            </SuccessBurst>
          ) : null}
        </div>

        {step < 4 ? (
          <div className="mt-9 flex items-center justify-between gap-4 border-t border-bronze/12 pt-6">
            <GeoButton
              variant="ghost"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              Back
            </GeoButton>
            <GeoButton
              variant="primary"
              onClick={() => goTo(step + 1)}
              disabled={!canAdvance}
              className="gap-2"
            >
              {step === 0 ? "Let's begin" : "Continue"}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            </GeoButton>
          </div>
        ) : null}
      </AuthLayout>
    </PageShell>
  );
}

const STEP_TITLES = [
  "Welcome to GEOverze",
  "What do you want to master?",
  "How well do you know Earth?",
  "Pick your explorer mark",
  "You're ready to explore",
] as const;

const STEP_DESCRIPTIONS = [
  "Know Earth. Think Global. A cinematic way to learn the planet — one expedition at a time.",
  "Pick as many as you like. Your daily expeditions are built from these.",
  "This sets your starting difficulty. GEOverze adapts as you improve.",
  "A generated bronze mark that represents you on leaderboards.",
  "",
] as const;

function WelcomeStep() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-bronze/15 bg-charcoal/35 p-7 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-bronze/30 bg-bronze/5 text-bronze">
          <Globe2 className="h-6 w-6" strokeWidth={1.2} aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-foreground/60">
          GEOverze turns the planet into a living arena of knowledge. Play daily expeditions, build
          streaks, compete in seasons and collect mastery across every corner of the map.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Interests", copy: "Shape what you play" },
          { label: "Skill", copy: "Set your challenge" },
          { label: "Identity", copy: "Choose your mark" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-bronze/12 bg-charcoal/30 p-4 text-center"
          >
            <p className="text-[0.6rem] uppercase tracking-[0.26em] text-bronze/90">{item.label}</p>
            <p className="mt-2 text-xs text-foreground/50">{item.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
