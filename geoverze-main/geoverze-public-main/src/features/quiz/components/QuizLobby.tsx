import { Bookmark, Clock, Globe2, HelpCircle, Share2, Sparkles, Trophy, Flame } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared";
import { DifficultyBadge, MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { QUIZ_CATEGORIES } from "@/features/play/data/categories";
import { useBookmarksStore } from "@/stores/bookmarksStore";
import type { QuizSet } from "../data/types";
import { QUESTION_TYPE_LABEL } from "../data/types";
import { SettingsPanel } from "./SettingsPanel";

const ICONS = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.icon]));
const TITLES = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c.title]));

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="game-surface-raised rounded-xl px-4 py-3">
      <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
        <Icon className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} aria-hidden />
        {label}
      </p>
      <p className="mt-1 text-[0.95rem] font-semibold text-foreground">{value}</p>
    </div>
  );
}

/** Pre-quiz lobby: everything a player needs before committing to a run. */
export function QuizLobby({ set, onStart }: { set: QuizSet; onStart: () => void }) {
  const bookmarkIds = useBookmarksStore((s) => s.ids);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);
  const [shared, setShared] = useState(false);
  const bookmarked = bookmarkIds.includes(set.id);

  const share = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      setShared(false);
    }
  };

  const Icon = ICONS.get(set.categoryId);
  const types = [...new Set(set.questions.map((q) => QUESTION_TYPE_LABEL[q.type]))];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="game-surface overflow-hidden rounded-2xl">
        <CoverArt art={set.art} icon={Icon} ratio="wide" className="h-44 sm:h-56" />
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge level={set.difficulty} />
            <MetaChip tone="bronze">{TITLES.get(set.categoryId) ?? "Geography"}</MetaChip>
            <MetaChip>
              <Globe2 className="h-3 w-3" aria-hidden />
              {set.language}
            </MetaChip>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {set.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-foreground/60">
            {set.description}
          </p>
          <p className="mt-3 text-[0.78rem] text-foreground/50">
            Created by <span className="text-bronze-glow">{set.creator}</span>
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Fact icon={HelpCircle} label="Questions" value={`${set.questions.length}`} />
            <Fact icon={Clock} label="Estimated time" value={`${set.minutes} min`} />
            <Fact icon={Sparkles} label="Formats" value={`${types.length} types`} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GeoButton variant="solid" size="lg" onClick={onStart} className="sm:min-w-[13rem]">
              Start quiz
            </GeoButton>
            <GeoButton
              variant="dark"
              size="lg"
              onClick={() => toggleBookmark(set.id)}
              aria-pressed={bookmarked}
            >
              <Bookmark
                className="h-4 w-4"
                strokeWidth={1.9}
                fill={bookmarked ? "currentColor" : "none"}
                aria-hidden
              />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </GeoButton>
            <GeoButton variant="ghost" size="lg" onClick={share}>
              <Share2 className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              {shared ? "Link copied" : "Share"}
            </GeoButton>
          </div>
          <p aria-live="polite" className="sr-only">
            {shared ? "Quiz link copied to clipboard" : ""}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {types.map((type) => (
              <li key={type}>
                <MetaChip>{type}</MetaChip>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-5">
        <section className="game-surface rounded-2xl p-5 sm:p-6" aria-label="Your record">
          <h2 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
            Your record
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Fact
              icon={Trophy}
              label="High score"
              value={`${set.highScore}/${set.questions.length}`}
            />
            <Fact icon={Flame} label="Best streak" value={`${set.bestStreak}`} />
          </div>
          <h3 className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Completion rewards
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <MetaChip tone="bronze">+{set.rewards.xp} XP</MetaChip>
            <MetaChip tone="bronze">+{set.rewards.credits} credits</MetaChip>
            <MetaChip>Streak shield</MetaChip>
          </div>
          <p className="mt-3 text-[0.72rem] text-foreground/50">
            XP and credits from completed quizzes are recorded on your account when signed in.
          </p>
        </section>

        <SettingsPanel />
      </div>
    </div>
  );
}
