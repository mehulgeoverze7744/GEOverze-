import { GeoButton, Modal } from "@/components/shared";

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
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Leave this quiz?"
      description="Your progress in this round will be lost. Streaks and XP only count for completed runs."
    >
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <GeoButton variant="dark" size="md" onClick={() => onOpenChange(false)}>
          Keep playing
        </GeoButton>
        <GeoButton variant="solid" size="md" onClick={onConfirm}>
          Exit to hub
        </GeoButton>
      </div>
    </Modal>
  );
}
