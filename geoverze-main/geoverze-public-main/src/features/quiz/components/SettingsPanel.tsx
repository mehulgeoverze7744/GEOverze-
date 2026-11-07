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
      className="lp-card min-w-0 overflow-hidden rounded-[1.5rem] p-6 sm:p-7"
      aria-label="Quiz settings"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[#111827]">
          Quiz settings
        </h2>
        <button
          type="button"
          onClick={() => update(DEFAULT_SETTINGS)}
          className="min-h-11 rounded-full px-2 text-[0.7rem] uppercase tracking-[0.16em] text-[#64748B] transition-colors hover:text-[#2b74c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/40"
        >
          Reset
        </button>
      </div>
      <p className="mt-2 text-[0.75rem] leading-relaxed text-[#64748B]">
        Preferences are saved for this session. They start shaping the round when the tuning engine
        lands.
      </p>

      <div className="mt-6 space-y-5">
        {CHOICES.map((row) => (
          <div key={row.key} className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
              {row.label}
            </p>
            <div
              className={cn(
                "mt-2 flex min-w-0 rounded-full bg-[#F8FAFC] ring-1 ring-[#E2E8F0]",
                row.key === "difficulty"
                  ? "gap-px overflow-hidden p-0.5"
                  : "gap-1 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              )}
              role="group"
              aria-label={row.label}
            >
              {row.options.map((option) => {
                const active = settings[row.key] === option;
                const isDifficulty = row.key === "difficulty";
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ [row.key]: option } as Partial<QuizSettings>)}
                    className={cn(
                      "flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full text-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/40",
                      isDifficulty
                        ? "min-w-0 basis-0 px-px text-[clamp(0.55rem,2.9vw,0.68rem)] leading-none tracking-[-0.03em] sm:px-1"
                        : "min-w-0 px-3 text-[0.75rem]",
                      active
                        ? "bg-[#2b74c4] text-white shadow-sm"
                        : "text-[#64748B] hover:text-[#111827]",
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
                className="lp-card-soft flex min-h-12 w-full min-w-0 items-center justify-between gap-4 rounded-[1.15rem] px-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/40"
              >
                <span className="flex min-w-0 items-center gap-2.5 text-[0.85rem] font-medium text-[#111827]">
                  <Icon className="h-4 w-4 shrink-0 text-[#2b74c4]" strokeWidth={1.8} aria-hidden />
                  <span className="truncate">{label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                    {active ? "On" : "Off"}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors duration-200",
                      active ? "bg-[#2b74c4]" : "bg-[#E2E8F0]",
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
