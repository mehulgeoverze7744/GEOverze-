import { useEffect, useState } from "react";

import { GeoButton } from "@/components/shared";
import { chooseDrawWord } from "../data/drawRoomApi";
import type { DrawCurrentTurn, DrawRoomState } from "../types";

type WordChoiceModalProps = {
  turn: DrawCurrentTurn;
  onChosen: (newState: DrawRoomState) => void;
};

function useChooseCountdown(deadline: string | null | undefined): number {
  const [secs, setSecs] = useState(15);

  useEffect(() => {
    if (!deadline) return;
    const update = () => {
      setSecs(Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000)));
    };
    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [deadline]);

  return secs;
}

/** Full-screen overlay shown only to the active drawer while turn.status === "choosing". */
export function WordChoiceModal({ turn, onChosen }: WordChoiceModalProps) {
  const [choosing, setChoosing] = useState<string | null>(null);
  const countdown = useChooseCountdown(turn.choose_deadline);

  const choose = async (wordId: string) => {
    if (choosing) return;
    setChoosing(wordId);
    try {
      const next = await chooseDrawWord(turn.id, wordId);
      onChosen(next);
    } catch {
      setChoosing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.07_0.004_60/0.85)] backdrop-blur-sm">
      <div className="game-surface mx-4 w-full max-w-md rounded-3xl p-8 text-center">
        <span className="text-[2.5rem] leading-none" aria-hidden>🎨</span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          Choose a word to draw
        </h2>
        <p className="mt-2 text-[0.85rem] text-foreground/55">
          Choosing in <span className="font-semibold text-bronze">{countdown}s</span>
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {(turn.word_options ?? []).map((opt) => (
            <GeoButton
              key={opt.id}
              variant="solid"
              size="lg"
              className="w-full"
              disabled={choosing !== null}
              onClick={() => void choose(opt.id)}
            >
              {opt.word}
            </GeoButton>
          ))}
        </div>

        <p className="mt-5 text-[0.75rem] text-foreground/40">
          If you don't choose in time, one is picked for you.
        </p>
      </div>
    </div>
  );
}
