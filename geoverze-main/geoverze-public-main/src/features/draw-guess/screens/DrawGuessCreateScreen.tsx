import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Flag,
  Flame,
  Gamepad2,
  Globe2,
  Landmark,
  Map,
  Orbit,
  Pencil,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import {
  DRAW_CATEGORY_OPTIONS,
  DRAW_DEFAULT_TURN_SECONDS,
  DRAW_DIFFICULTY_OPTIONS,
  DRAW_MAX_PLAYER_OPTIONS,
  DRAW_MAX_TURN_SECONDS,
  DRAW_MIN_TURN_SECONDS,
  DRAW_ROUND_OPTIONS,
} from "../data/categories";
import { createDrawRoom } from "../data/drawRoomApi";
import type { DrawCategory } from "../types";

import { cn } from "@/lib/utils";

const ROUND_META: Record<1 | 3 | 5, { label: string; icon: typeof Zap }> = {
  1: { label: "Quick Match", icon: Zap },
  3: { label: "Classic", icon: Trophy },
  5: { label: "Marathon", icon: Flame },
};

const DIFFICULTY_BLURB: Record<"easy" | "medium" | "hard", string> = {
  easy: "Relaxed sketching",
  medium: "A balanced challenge",
  hard: "Think fast. Draw smart.",
};

const CATEGORY_ICON: Record<DrawCategory, typeof Globe2> = {
  geography_countries: Globe2,
  capitals_flags: Flag,
  landmarks_monuments: Landmark,
  maps_physical: Map,
  space_astronomy: Sparkles,
  planets_universe: Orbit,
};

const TIMER_CHIPS = [30, 60, 80, 120, 150] as const;

function lobbyCard(className?: string) {
  return cn(
    "rounded-[1.35rem] border border-white/8 bg-[oklch(0.145_0.008_60/0.78)] p-5 shadow-[0_12px_40px_oklch(0_0_0/0.28)] backdrop-blur-xl sm:p-6",
    className,
  );
}

function SectionTitle({
  id,
  icon: Icon,
  title,
  description,
}: {
  id: string;
  icon: typeof Trophy;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2
        id={id}
        className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-foreground"
      >
        <Icon className="h-4 w-4 text-bronze" strokeWidth={1.9} aria-hidden />
        {title}
      </h2>
      <p className="mt-1 text-[0.78rem] leading-relaxed text-foreground/50">{description}</p>
    </div>
  );
}

function SketchAccent() {
  return (
    <div
      className="relative grid h-14 w-14 place-items-center rounded-2xl border border-bronze/30 bg-bronze/10"
      aria-hidden
    >
      <Globe2 className="h-7 w-7 text-bronze" strokeWidth={1.5} />
      <Pencil
        className="absolute -right-1 -bottom-0.5 h-5 w-5 text-bronze-glow motion-safe:animate-pulse"
        strokeWidth={1.8}
      />
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/6 py-2.5 last:border-0">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground/42">
        {label}
      </span>
      <span className="max-w-[14rem] text-right text-[0.82rem] font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

export function DrawGuessCreateScreen() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<1 | 3 | 5>(3);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [categories, setCategories] = useState<DrawCategory[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [turnSeconds, setTurnSeconds] = useState(DRAW_DEFAULT_TURN_SECONDS);
  const [creating, setCreating] = useState(false);

  const toggleCategory = (cat: DrawCategory) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const state = await createDrawRoom({
        rounds,
        maxPlayers,
        categories,
        difficulty,
        turnSeconds,
      });
      void navigate({
        to: "/play/draw-guess/room",
        search: { room: state.room.id, code: state.room.room_code },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setCreating(false);
    }
  };

  const categoryPreview =
    categories.length === 0
      ? "All Categories"
      : DRAW_CATEGORY_OPTIONS.filter((cat) => categories.includes(cat.id))
          .map((cat) => cat.label)
          .join(", ");

  const timerProgress =
    ((turnSeconds - DRAW_MIN_TURN_SECONDS) / (DRAW_MAX_TURN_SECONDS - DRAW_MIN_TURN_SECONDS)) * 100;

  const createButton = (
    <GeoButton
      variant="solid"
      size="lg"
      className="h-14 w-full text-[0.78rem] tracking-[0.14em]"
      disabled={creating}
      onClick={() => void handleCreate()}
    >
      <Gamepad2 className="h-4 w-4" strokeWidth={2.2} aria-hidden />
      {creating ? "Creating room…" : "Create game room"}
    </GeoButton>
  );

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+1.5rem)] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/draw-guess"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Draw &amp; Guess hub
          </Link>

          <header className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-bronze">
                Multiplayer arena
              </p>
              <h1 className="mt-2 text-[clamp(1.85rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
                Build Your Game
              </h1>
              <p className="mt-2 max-w-lg text-[0.9rem] leading-relaxed text-foreground/58">
                Set the rules, invite your crew, and let the chaos begin.
              </p>
            </div>
            <SketchAccent />
          </header>
        </AnimatedSection>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,22rem)] lg:gap-8">
          <div className="min-w-0 space-y-5">
            <section className={lobbyCard()} aria-labelledby="rounds-label">
              <SectionTitle
                id="rounds-label"
                icon={Trophy}
                title="Round Selection"
                description="How long the match should last."
              />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {DRAW_ROUND_OPTIONS.map((r) => {
                  const meta = ROUND_META[r];
                  const Icon = meta.icon;
                  const selected = rounds === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRounds(r)}
                      className={cn(
                        "rounded-2xl border px-2 py-3 text-center transition-[transform,border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none sm:px-3 sm:py-4",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                        selected
                          ? "border-bronze bg-bronze/18 text-foreground shadow-[0_0_24px_oklch(0.72_0.1_70/0.18)]"
                          : "border-white/8 bg-[oklch(0.17_0.008_62/0.7)] text-foreground/65 hover:-translate-y-0.5 hover:border-bronze/40 motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mx-auto h-4 w-4",
                          selected ? "text-bronze" : "text-foreground/40",
                        )}
                        strokeWidth={1.8}
                        aria-hidden
                      />
                      <span className="mt-1.5 block text-[1.35rem] font-semibold leading-none sm:text-[1.55rem]">
                        {r}
                      </span>
                      <span className="mt-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={lobbyCard()} aria-labelledby="players-label">
              <SectionTitle
                id="players-label"
                icon={Users}
                title="Maximum Players"
                description="How many friends can join the room."
              />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {DRAW_MAX_PLAYER_OPTIONS.map((n) => {
                  const selected = maxPlayers === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setMaxPlayers(n)}
                      className={cn(
                        "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 transition-[transform,border-color,background-color] duration-200 motion-reduce:transition-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                        selected
                          ? "border-bronze bg-bronze/18 text-bronze-glow"
                          : "border-white/8 bg-[oklch(0.17_0.008_62/0.7)] text-foreground/65 hover:-translate-y-0.5 hover:border-bronze/40 motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <Users className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
                      <span className="text-[0.92rem] font-semibold">{n}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={lobbyCard()} aria-labelledby="difficulty-label">
              <SectionTitle
                id="difficulty-label"
                icon={Flame}
                title="Difficulty"
                description="How demanding the secret words will be."
              />
              <div className="grid gap-2 sm:grid-cols-3">
                {DRAW_DIFFICULTY_OPTIONS.map((d) => {
                  const selected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setDifficulty(d.id)}
                      className={cn(
                        "rounded-2xl border px-3 py-3.5 text-left transition-[transform,border-color,background-color] duration-200 motion-reduce:transition-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                        selected
                          ? "border-bronze bg-bronze/18 shadow-[0_0_20px_oklch(0.72_0.1_70/0.14)]"
                          : "border-white/8 bg-[oklch(0.17_0.008_62/0.7)] hover:-translate-y-0.5 hover:border-bronze/40 motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <span className="block text-[0.92rem] font-semibold capitalize text-foreground">
                        {d.label}
                      </span>
                      <span className="mt-1 block text-[0.72rem] leading-relaxed text-foreground/50">
                        {DIFFICULTY_BLURB[d.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={lobbyCard()} aria-labelledby="turn-secs-label">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2
                    id="turn-secs-label"
                    className="text-[0.95rem] font-semibold tracking-tight text-foreground"
                  >
                    Drawing Time Per Turn
                  </h2>
                  <p className="mt-1 text-[0.78rem] text-foreground/50">
                    How long each artist has the canvas.
                  </p>
                </div>
                <p className="font-mono text-[1.45rem] font-semibold tabular-nums text-bronze-glow">
                  {turnSeconds}{" "}
                  <span className="text-[0.72rem] uppercase tracking-[0.12em]">sec</span>
                </p>
              </div>
              <input
                type="range"
                min={DRAW_MIN_TURN_SECONDS}
                max={DRAW_MAX_TURN_SECONDS}
                step={10}
                value={turnSeconds}
                onChange={(e) => setTurnSeconds(Number(e.target.value))}
                aria-valuemin={DRAW_MIN_TURN_SECONDS}
                aria-valuemax={DRAW_MAX_TURN_SECONDS}
                aria-valuenow={turnSeconds}
                aria-label="Drawing time per turn in seconds"
                className="draw-turn-slider h-2 w-full cursor-pointer appearance-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
                style={{
                  background: `linear-gradient(to right, oklch(0.72 0.12 70) 0%, oklch(0.78 0.1 78) ${timerProgress}%, oklch(0.22 0.01 60) ${timerProgress}%, oklch(0.22 0.01 60) 100%)`,
                }}
              />
              <div className="mt-1.5 flex justify-between text-[0.68rem] text-foreground/40">
                <span>{DRAW_MIN_TURN_SECONDS}s</span>
                <span>{DRAW_MAX_TURN_SECONDS}s</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIMER_CHIPS.map((secs) => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => setTurnSeconds(secs)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                      turnSeconds === secs
                        ? "border-bronze bg-bronze/20 text-bronze-glow"
                        : "border-white/10 text-foreground/55 hover:border-bronze/35",
                    )}
                  >
                    {secs}s
                  </button>
                ))}
              </div>
            </section>

            <section className={lobbyCard()} aria-labelledby="categories-label">
              <SectionTitle
                id="categories-label"
                icon={Map}
                title="Word Categories"
                description="Pick one or more, or leave empty for a mixed bag."
              />
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {DRAW_CATEGORY_OPTIONS.map((cat) => {
                  const on = categories.includes(cat.id);
                  const Icon = CATEGORY_ICON[cat.id];
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "flex min-h-[4.5rem] items-start gap-2.5 rounded-2xl border px-3 py-3 text-left transition-[transform,border-color,background-color] duration-200 motion-reduce:transition-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                        on
                          ? "border-bronze bg-bronze/16"
                          : "border-white/8 bg-[oklch(0.17_0.008_62/0.7)] hover:-translate-y-0.5 hover:border-bronze/40 motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                          on
                            ? "border-bronze/50 bg-bronze/15 text-bronze"
                            : "border-white/8 text-foreground/45",
                        )}
                      >
                        {on ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                        ) : (
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0 text-[0.78rem] font-medium leading-snug text-foreground">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[0.72rem] text-bronze/75">
                No selection = Mixed categories (all available words).
              </p>
            </section>
          </div>

          <AnimatedSection className="lg:sticky lg:top-[calc(var(--nav-height)+1rem)]">
            <aside className={lobbyCard("overflow-hidden")} aria-live="polite">
              <div className="relative mb-4 overflow-hidden rounded-xl border border-bronze/15 bg-[oklch(0.12_0.008_62)]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-bronze/25 bg-bronze/10">
                    <Pencil className="h-5 w-5 text-bronze" strokeWidth={1.7} aria-hidden />
                  </div>
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-bronze">
                      Match Preview
                    </p>
                    <p className="text-[0.92rem] font-semibold text-foreground">Your setup</p>
                  </div>
                </div>
              </div>
              <PreviewRow label="Rounds" value={`${rounds} · ${ROUND_META[rounds].label}`} />
              <PreviewRow label="Players" value={`${maxPlayers} max`} />
              <PreviewRow
                label="Difficulty"
                value={
                  DRAW_DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.label ?? difficulty
                }
              />
              <PreviewRow label="Draw time" value={`${turnSeconds} sec`} />
              <PreviewRow label="Categories" value={categoryPreview} />
              <div className="mt-5 hidden lg:block">{createButton}</div>
            </aside>
            <div className="mt-4 lg:hidden">{createButton}</div>
          </AnimatedSection>
        </div>
      </SectionContainer>

      <style>{`
        .draw-turn-slider::-webkit-slider-thumb {
          appearance: none;
          height: 1.15rem;
          width: 1.15rem;
          border-radius: 999px;
          background: oklch(0.78 0.1 78);
          border: 2px solid oklch(0.72 0.12 70);
          box-shadow: 0 0 12px oklch(0.72 0.12 70 / 0.45);
        }
        .draw-turn-slider::-moz-range-thumb {
          height: 1.15rem;
          width: 1.15rem;
          border-radius: 999px;
          background: oklch(0.78 0.1 78);
          border: 2px solid oklch(0.72 0.12 70);
          box-shadow: 0 0 12px oklch(0.72 0.12 70 / 0.45);
        }
      `}</style>
    </PageShell>
  );
}
