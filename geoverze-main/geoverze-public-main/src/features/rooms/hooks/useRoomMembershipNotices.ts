import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { diffRoomMembership, type RoomMemberLike } from "../lib/membershipDiff";

/** Subtle join/leave toasts. Skips the first authoritative snapshot. */
export function useRoomMembershipNotices(
  members: readonly RoomMemberLike[] | undefined,
  selfId: string | undefined,
) {
  const previousRef = useRef<RoomMemberLike[] | null>(null);

  useEffect(() => {
    if (!members) return;
    const changes = diffRoomMembership(previousRef.current, members, selfId);
    previousRef.current = members.map((member) => ({ ...member }));

    for (const change of changes) {
      toast(
        change.kind === "joined"
          ? `${change.name} joined the room`
          : `${change.name} left the room`,
        {
          duration: 2800,
        },
      );
    }
  }, [members, selfId]);

  useEffect(() => {
    previousRef.current = null;
  }, [selfId]);
}
