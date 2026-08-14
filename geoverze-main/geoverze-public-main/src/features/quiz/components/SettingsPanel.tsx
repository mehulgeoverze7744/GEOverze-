import { Music2, Sparkles, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { DEFAULT_SETTINGS, useQuizStore, type QuizSettings } from "@/stores/quizStore";

const CHOICES: {
  key: keyof Pick<QuizSettings, "difficulty" | "questionCount" | "timeLimit">;
  label: string;
  options: readonly string[];
}[] = [
  {
    key: "difficulty",
    label: "Difficulty",
    options: ["Adaptive", "Easy", "Medium", "Hard", "Expert"],
  },
  { key: "questionCount", label: "Questions", options: ["All", "5", "10", "20"] },
  { key: "timeLimit", label: "Time limit", options: ["Off", "15s", "30s", "60s"] },
];

const TOGGLES: {
  key: keyof Pick<QuizSettings, "sound" | "music" | "animations">;
  label: string;
  icon: typeof Volume2;
}[] = [
  { key: "sound", label: "Sound effects", icon: Volume2 },
  { key: "music", label: "Music", icon: Music2 },
  { key: "animations", label: "Animations", icon: Sparkles },
];

/**
 * Pre-quiz settings. Fully interactive and persisted for the session, but not
 * yet wired into play — the engine reads the full set at default difficulty.
 */
export function SettingsPanel() {
  const settings = useQuizStore((s) => s.settings);
  const update = useQuizStore((s) => s.updateSettings);

  return (
    <section className="game-surface rounded-2xl p-5 sm:p-6" aria-label="Quiz settings">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
          Quiz settings
        </h2>
        <button
          type="button"
          onClick={() => update(DEFAULT_SETTINGS)}
          className="text-[0.7rem] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          Reset
        </button>
      </div>
      <p className="mt-1 text-[0.75rem] text-foreground/50">
        Preferences are saved for this session. They start shaping the round when the tuning engine
        lands.
      </p>

      <div className="mt-5 space-y-4">
        {CHOICES.map((row) => (
          <div key={row.key}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              {row.label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={row.label}>
              {row.options.map((option) => {
                const active = settings[row.key] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ [row.key]: option } as Partial<QuizSettings>)}
                    className={cn(
                      "min-h-11 rounded-xl border px-4 text-[0.78rem] font-medium transition-all motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.97]",
                      active
                        ? "border-bronze bg-bronze/18 text-bronze-glow"
                        : "border-bronze/14 bg-[oklch(0.185_0.008_62)] text-foreground/65 hover:border-bronze/45",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="grid gap-2 sm:grid-cols-3">
          {TOGGLES.map(({ key, label, icon: Icon }) => {
            const active = settings[key];
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => update({ [key]: !active } as Partial<QuizSettings>)}
                className={cn(
                  "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 text-[0.8rem] font-medium transition-all motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.98]",
                  active
                    ? "border-bronze/55 bg-bronze/12 text-bronze-glow"
                    : "border-bronze/14 bg-[oklch(0.185_0.008_62)] text-foreground/55",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                  {label}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.16em]">
                  {active ? "On" : "Off"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
