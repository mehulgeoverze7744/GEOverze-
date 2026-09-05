import { findAvatar } from "@/features/auth/data/onboarding";

/** Default explorer identity — astronaut emerging from bronze spacecraft window. */
export const DEFAULT_ASTRONAUT_AVATAR_SRC = "/assets/default-astronaut-window.jpg";

export type ResolvedAvatar =
  | { kind: "url"; src: string }
  | { kind: "mark"; id: string }
  | { kind: "default"; src: string };

/**
 * Resolves which avatar to show for the signed-in user.
 *
 * Priority:
 * 1. Custom uploaded image (`avatar_url`)
 * 2. Selected preset identity (`avatar_id` from onboarding/profile)
 * 3. Default 3D astronaut window artwork
 */
export function resolveUserAvatar(input: {
  avatarUrl?: string | null;
  avatarId?: string | null;
}): ResolvedAvatar {
  const url = input.avatarUrl?.trim();
  if (url) {
    return { kind: "url", src: url };
  }

  const id = input.avatarId?.trim();
  if (id && findAvatar(id)) {
    return { kind: "mark", id };
  }

  return { kind: "default", src: DEFAULT_ASTRONAUT_AVATAR_SRC };
}

/** True when the user has an explicit custom avatar (upload or preset selection). */
export function hasCustomAvatar(input: {
  avatarUrl?: string | null;
  avatarId?: string | null;
}): boolean {
  const resolved = resolveUserAvatar(input);
  return resolved.kind !== "default";
}

/** Display scale for the full-window default astronaut artwork. */
export function defaultAstronautDisplaySize(size: number) {
  return {
    width: Math.round(size * 1.12),
    height: Math.round(size * 1.28),
  };
}
