import { cn } from "@/lib/utils";
import type { RoomSyncStatus } from "../hooks/useRoomRealtime";

/** Compact connection readout for multiplayer rooms. */
export function RoomSyncBanner({ status }: { status: RoomSyncStatus }) {
  if (status !== "reconnecting" && status !== "connecting") return null;

  return (
    <p
      className={cn(
        "mb-3 text-center text-[0.72rem] tracking-wide text-foreground/45",
        status === "reconnecting" && "text-bronze/80",
      )}
      role="status"
    >
      {status === "reconnecting" ? "Reconnecting to the room…" : "Connecting to live updates…"}
    </p>
  );
}
