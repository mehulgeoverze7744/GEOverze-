import { cn } from "@/lib/utils";

import {
  ASSIGNMENT_DIFFICULTIES,
  type AssignmentDifficulty,
} from "../lib/assignRandomQuiz";

/** Adaptive / Easy / Medium / Hard / Expert control for category PLAY QUIZ. */
export function AssignmentDifficultyPicker({
  value,
  onChange,
}: {
  value: AssignmentDifficulty;
  onChange: (value: AssignmentDifficulty) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
        Difficulty
      </p>
      <div
        className="mt-2 flex min-w-0 gap-px overflow-hidden rounded-full bg-[#F8FAFC] p-0.5 ring-1 ring-[#E2E8F0]"
        role="group"
        aria-label="Difficulty"
      >
        {ASSIGNMENT_DIFFICULTIES.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={cn(
                "flex min-h-10 min-w-0 flex-1 basis-0 items-center justify-center whitespace-nowrap rounded-full px-px text-center font-medium leading-none tracking-[-0.03em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/40 sm:px-1",
                "text-[clamp(0.55rem,2.9vw,0.68rem)]",
                active ? "bg-[#2b74c4] text-white shadow-sm" : "text-[#64748B] hover:text-[#111827]",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
