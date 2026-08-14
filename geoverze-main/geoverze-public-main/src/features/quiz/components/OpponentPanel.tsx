import { Bot, Users, Wifi } from "lucide-react";

import { MetaChip } from "@/features/play/components/Badges";
import { useQuizStore, type QuizMode } from "@/stores/quizStore";

const COPY: Record<
  Exclude<QuizMode, "solo" | "practice">,
  { icon: typeof Bot; title: string; blurb: string; roster: string[] }
> = {
  pvp: {
    icon: Bot,
    title: "Duel — offline preview",
    blurb: "Live matchmaking arrives with the realtime service. Your opponent is simulated.",
    roster: ["You", "Sparring bot"],
  },
  multiplayer: {
    icon: Users,
    title: "Lobby — offline preview",
    blurb: "Rooms, invites and live scoreboards land with the realtime service.",
    roster: ["You", "Mira O.", "Leo M.", "Nadia I."],
  },
};

/**
 * Opponent panel shown beside the play screen in PvP and multiplayer.
 * Deliberately labelled as a preview — no realtime backend exists yet.
 */
export function OpponentPanel({ mode }: { mode: "pvp" | "multiplayer" }) {
  const answers = useQuizStore((s) => s.answers);
  const answered = Object.keys(answers).length;
  const copy = COPY[mode];
  const Icon = copy.icon;

  return (
    <section className="game-surface rounded-2xl p-5" aria-label="Opponents">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/30 bg-bronze/10 text-bronze-glow">
          <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div>
          <p className="text-[0.85rem] font-semibold text-foreground/85">{copy.title}</p>
          <p className="flex items-center gap-1.5 text-[0.7rem] text-foreground/50">
            <Wifi className="h-3 w-3" strokeWidth={1.8} aria-hidden />
            Offline
          </p>
        </div>
      </div>
      <p className="mt-3 text-[0.78rem] leading-relaxed text-foreground/55">{copy.blurb}</p>
      <ul className="mt-4 space-y-2">
        {copy.roster.map((name, i) => (
          <li
            key={name}
            className="flex items-center justify-between rounded-xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] px-3 py-2 text-[0.8rem]"
          >
            <span className={i === 0 ? "font-semibold text-bronze-glow" : "text-foreground/65"}>
              {name}
            </span>
            <MetaChip>{i === 0 ? `${answered} answered` : "—"}</MetaChip>
          </li>
        ))}
      </ul>
    </section>
  );
}
