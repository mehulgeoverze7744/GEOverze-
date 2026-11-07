import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const actionButtonClass =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[var(--tracking-button)] transition-colors motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b74c4]/40 sm:w-auto";

/** Confirm before abandoning a run — the run is transient and cannot resume. */
export function ExitDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gvrze-quiz-exit w-[calc(100%-2rem)] max-w-lg gap-0 border border-[#E2E8F0] bg-white p-6 text-[#111827] shadow-[0_24px_60px_-18px_rgb(15_23_42_/_0.28)] sm:rounded-2xl",
          "[&>button.absolute]:text-[#111827] [&>button.absolute]:opacity-100 [&>button.absolute]:hover:bg-[#F8FAFC] [&>button.absolute]:hover:text-[#2b74c4] [&>button.absolute]:focus-visible:ring-[#2b74c4]/40",
        )}
      >
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-[1.25rem] font-semibold tracking-tight text-[#111827]">
            Leave this quiz?
          </DialogTitle>
          <DialogDescription className="text-[0.9rem] leading-relaxed text-[#475569]">
            Your progress in this round will be lost. Streaks and XP only count for completed runs.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={cn(actionButtonClass, "bg-[#111111] text-white hover:bg-[#252525]")} onClick={() => onOpenChange(false)}>
            Keep playing
          </button>
          <button
            type="button"
            className={cn(
              actionButtonClass,
              "border border-[#2b74c4]/35 bg-[#F3F8FD] text-[#2b74c4] hover:border-[#2b74c4] hover:bg-[#E7F1FB]",
            )}
            onClick={onConfirm}
          >
            Exit to hub
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
