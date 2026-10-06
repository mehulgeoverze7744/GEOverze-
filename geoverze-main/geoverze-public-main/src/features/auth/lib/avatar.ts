import { findAvatar } from "@/features/auth/data/onboarding";

/** Default explorer identity — astronaut emerging from bronze spacecraft window. */
export const DEFAULT_ASTRONAUT_AVATAR_SRC = "/assets/default-astronaut-window.jpg";

/** Dashboard 3D explorer artwork used when no saved profile photo exists. */
export const DASHBOARD_3D_AVATAR_SRC = "/assets/dashboard-explorer-avatar.png";

export type ResolvedAvatar =
  { kind: "url"; src: string } | { kind: "mark"; id: string } | { kind: "default"; src: string };

function stripAvatarQuery(src: string) {
  const cut = src.indexOf("?");
  return cut === -1 ? src : src.slice(0, cut);
}

/** Cache-bust remote/storage URLs after a photo replacement. Bundled assets keep a stable path. */
export function withAvatarCacheBust(src: string, revision?: string | number | null) {
  const trimmed = src.trim();
  if (!trimmed || revision == null || revision === "") return trimmed;
  if (trimmed.startsWith("/assets/")) return trimmed;
  const join = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${join}v=${encodeURIComponent(String(revision))}`;
}

/**
 * Resolves which avatar to show for the signed-in user.
 *
 * Priority:
 * 1. Selected preset identity (`avatar_id`) — including character portraits
 * 2. Custom uploaded image (`avatar_url`)
 * 3. Default 3D astronaut window artwork
 */
export function resolveUserAvatar(input: {
  avatarUrl?: string | null;
  avatarId?: string | null;
}): ResolvedAvatar {
  const id = input.avatarId?.trim();
  const preset = id ? findAvatar(id) : undefined;
  if (preset?.src) {
    return { kind: "url", src: preset.src };
  }

  const url = input.avatarUrl?.trim();
  if (url) {
    return { kind: "url", src: url };
  }

  if (preset) {
    return { kind: "mark", id: preset.id };
  }

  return { kind: "default", src: DEFAULT_ASTRONAUT_AVATAR_SRC };
}

/** Image shown inside the Dashboard 3D avatar treatment. */
export function resolveDashboardAvatarSrc(input: {
  avatarUrl?: string | null;
  avatarId?: string | null;
  revision?: string | number | null;
}): string {
  const resolved = resolveUserAvatar(input);
  if (resolved.kind === "url") {
    return withAvatarCacheBust(resolved.src, input.revision);
  }
  return DASHBOARD_3D_AVATAR_SRC;
}

export function isBundledAvatarSrc(src: string | null | undefined) {
  const path = src?.trim() ? stripAvatarQuery(src.trim()) : "";
  return path.startsWith("/assets/avatars/") || path === DASHBOARD_3D_AVATAR_SRC;
}

/**
 * Maps the Edit Profile selection onto persisted `avatar_id` / `avatar_url`.
 * Preset characters store their portrait URL; the photo slot keeps a real upload
 * or clears both fields so every surface falls back to the default 3D avatar.
 */
export function persistableAvatarSelection(input: {
  avatarId: string | null;
  currentAvatarUrl?: string | null;
}) {
  const preset = input.avatarId?.trim() ? findAvatar(input.avatarId.trim()) : undefined;
  if (preset?.src) {
    return { avatarId: preset.id, avatarUrl: preset.src };
  }
  if (preset) {
    return { avatarId: preset.id, avatarUrl: null as string | null };
  }

  const current = input.currentAvatarUrl?.trim() || null;
  if (current && !isBundledAvatarSrc(current)) {
    return { avatarId: null as string | null, avatarUrl: current };
  }

  return { avatarId: null as string | null, avatarUrl: null as string | null };
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
