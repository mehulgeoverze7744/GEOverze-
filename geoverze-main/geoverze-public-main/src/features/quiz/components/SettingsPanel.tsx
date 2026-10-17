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
    <section
      className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/8 bg-[oklch(0.145_0.008_60/0.78)] p-6 shadow-[0_12px_40px_oklch(0_0_0/0.28)] backdrop-blur-xl sm:p-7"
      aria-label="Quiz settings"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-foreground">
          Quiz settings
        </h2>
        <button
          type="button"
          onClick={() => update(DEFAULT_SETTINGS)}
          className="min-h-11 rounded-full px-2 text-[0.7rem] uppercase tracking-[0.16em] text-foreground/45 transition-colors hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          Reset
        </button>
      </div>
      <p className="mt-2 text-[0.75rem] leading-relaxed text-foreground/50">
        Preferences are saved for this session. They start shaping the round when the tuning engine
        lands.
      </p>

      <div className="mt-6 space-y-5">
        {CHOICES.map((row) => (
          <div key={row.key} className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/45">
              {row.label}
            </p>
            <div
              className="mt-2 flex min-w-0 gap-1 overflow-x-auto rounded-full bg-[oklch(0.1_0.006_60/0.7)] p-1 ring-1 ring-white/8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label={row.label}
            >
              {row.options.map((option) => {
                const active = settings[row.key] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ [row.key]: option } as Partial<QuizSettings>)}
                    className={cn(
                      "min-h-10 min-w-0 flex-1 whitespace-nowrap rounded-full px-3 text-[0.75rem] font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                      active
                        ? "bg-bronze/22 text-bronze-glow shadow-[0_1px_8px_oklch(0.55_0.1_62/0.22)]"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="space-y-2">
          {TOGGLES.map(({ key, label, icon: Icon }) => {
            const active = settings[key];
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => update({ [key]: !active } as Partial<QuizSettings>)}
                className="flex min-h-12 w-full min-w-0 items-center justify-between gap-4 rounded-[1.15rem] border border-white/6 bg-[oklch(0.2_0.01_60/0.38)] px-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
              >
                <span className="flex min-w-0 items-center gap-2.5 text-[0.85rem] font-medium text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.8} aria-hidden />
                  <span className="truncate">{label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-foreground/40">
                    {active ? "On" : "Off"}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors duration-200",
                      active ? "bg-bronze" : "bg-white/14",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                        active && "translate-x-5",
                      )}
                    />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
