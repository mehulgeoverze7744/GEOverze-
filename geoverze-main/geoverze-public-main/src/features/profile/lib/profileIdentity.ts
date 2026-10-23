/**
 * Canonical profile identity.
 *
 * `public.profiles` is the source of truth for application profile fields.
 * The auth session only supplies the stable user id and email. These helpers
 * decide what may be shown, and which async responses are still allowed to
 * write, so a later auth event cannot swap in a username or default avatar.
 */

export const DEFAULT_PROFILE_BIO =
  "Chasing borders, capitals and coastlines one expedition at a time. Somewhere between an atlas and a passport.";

export const PROFILE_LOAD_ERROR = "Could not load your profile.";

export type ProfileLoadStatus = "idle" | "loading" | "ready" | "error";

export type SessionIdentity = {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  country?: string;
  avatarId?: string;
  avatarUrl?: string;
};

/** Columns read from `public.profiles` for the signed-in user. */
export type CanonicalProfileRow = {
  display_name: string | null;
  username: string | null;
  bio: string | null;
  country_code: string | null;
  avatar_id: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export type CanonicalProfile = {
  ownerId: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  joinedAt: string | null;
  avatarId: string | null;
  avatarUrl: string | null;
  loaded: true;
  status: "ready";
  loadError: null;
};

export type ProfileCacheSnapshot = {
  ownerId: string | null;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  country: string | null;
  joinedAt: string | null;
  avatarId: string | null;
  avatarUrl: string | null;
  loaded: boolean;
  status: ProfileLoadStatus;
  loadError: string | null;
};

export type ResolvedProfileIdentity = {
  pending: boolean;
  error: string | null;
  displayName: string;
  username: string;
  handle: string;
  bio: string;
  countryCode: string | null;
  joinedAt: string | null;
  avatarId: string | null;
  avatarUrl: string | null;
  /** True only after a completed load found no saved avatar. */
  showDefaultAvatar: boolean;
};

const EMPTY_IDENTITY: ResolvedProfileIdentity = {
  pending: false,
  error: null,
  displayName: "",
  username: "",
  handle: "",
  bio: "",
  countryCode: null,
  joinedAt: null,
  avatarId: null,
  avatarUrl: null,
  showDefaultAvatar: false,
};

let profileEpoch = 0;

export function currentProfileEpoch() {
  return profileEpoch;
}

/** Invalidates profile responses that started before this write. */
export function bumpProfileEpoch() {
  profileEpoch += 1;
  return profileEpoch;
}

export function resetProfileEpochForTests() {
  profileEpoch = 0;
}

export function shouldApplyProfilePayload(input: {
  requestUserId: string;
  activeUserId: string | null;
  requestEpoch: number;
  currentEpoch: number;
}) {
  return (
    input.activeUserId != null &&
    input.activeUserId === input.requestUserId &&
    input.requestEpoch === input.currentEpoch
  );
}

/**
 * Token refresh and a failed load must not start another profile request.
 * A manual retry, a real sign-in, or an auth user update still may.
 */
export function shouldStartProfileHydration(input: {
  event: string;
  userId: string;
  inFlightUserId: string | null;
  profileRequestFailed: boolean;
}) {
  if (input.event === "manual" || input.event === "USER_UPDATED") return true;
  // A refreshed access token does not change the profile row.
  if (input.event === "TOKEN_REFRESHED") return false;
  if (input.profileRequestFailed && input.event !== "SIGNED_IN") return false;
  if (input.inFlightUserId === input.userId && input.event !== "SIGNED_IN") return false;
  return true;
}

/**
 * Same-account auth events keep the profile fields already on the session.
 * A different account starts from id and email only.
 */
export function retainSessionIdentity(
  current: SessionIdentity | null,
  incoming: { id: string; email: string },
): SessionIdentity {
  if (!current || current.id !== incoming.id) {
    return { id: incoming.id, email: incoming.email };
  }
  return {
    ...current,
    id: incoming.id,
    email: incoming.email || current.email,
  };
}

function trimmed(value: string | null | undefined) {
  const next = value?.trim();
  return next ? next : null;
}

export function canonicalProfileFromRow(
  userId: string,
  row: CanonicalProfileRow | null,
  previousJoinedAt: string | null,
): CanonicalProfile {
  return {
    ownerId: userId,
    displayName: trimmed(row?.display_name),
    username: trimmed(row?.username),
    bio: trimmed(row?.bio),
    country: trimmed(row?.country_code),
    joinedAt: row?.created_at ?? previousJoinedAt,
    avatarId: trimmed(row?.avatar_id),
    avatarUrl: trimmed(row?.avatar_url),
    loaded: true,
    status: "ready",
    loadError: null,
  };
}

export function canonicalProfileFromEdit(input: {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  country: string | null;
  avatarId: string | null;
  avatarUrl: string | null;
  joinedAt: string | null;
}): CanonicalProfile {
  return {
    ownerId: input.userId,
    displayName: trimmed(input.displayName),
    username: trimmed(input.username),
    bio: trimmed(input.bio),
    country: trimmed(input.country),
    joinedAt: input.joinedAt,
    avatarId: trimmed(input.avatarId),
    avatarUrl: trimmed(input.avatarUrl),
    loaded: true,
    status: "ready",
    loadError: null,
  };
}

export function sessionIdentityFromProfile(
  account: { id: string; email: string },
  profile: {
    displayName: string | null;
    username: string | null;
    country: string | null;
    avatarId: string | null;
    avatarUrl: string | null;
  },
): SessionIdentity {
  const next: SessionIdentity = { id: account.id, email: account.email };
  const displayName = trimmed(profile.displayName);
  const username = trimmed(profile.username);
  const country = trimmed(profile.country);
  const avatarId = trimmed(profile.avatarId);
  const avatarUrl = trimmed(profile.avatarUrl);
  if (displayName) next.displayName = displayName;
  if (username) next.username = username;
  if (country) next.country = country;
  if (avatarId) next.avatarId = avatarId;
  if (avatarUrl) next.avatarUrl = avatarUrl;
  return next;
}

function cacheHasIdentity(cache: ProfileCacheSnapshot) {
  return Boolean(
    trimmed(cache.displayName) ||
      trimmed(cache.username) ||
      trimmed(cache.avatarUrl) ||
      trimmed(cache.avatarId),
  );
}

function presentIdentity(
  source: {
    displayName: string | null;
    username: string | null;
    bio: string | null;
    country: string | null;
    joinedAt: string | null;
    avatarId: string | null;
    avatarUrl: string | null;
  },
  error: string | null,
): ResolvedProfileIdentity {
  const username = trimmed(source.username) ?? "";
  const displayName = trimmed(source.displayName) ?? (username || "Explorer");
  const avatarId = trimmed(source.avatarId);
  const avatarUrl = trimmed(source.avatarUrl);
  return {
    pending: false,
    error,
    displayName,
    username,
    handle: username ? `@${username}` : "",
    bio: trimmed(source.bio) ?? DEFAULT_PROFILE_BIO,
    countryCode: trimmed(source.country),
    joinedAt: source.joinedAt,
    avatarId,
    avatarUrl,
    showDefaultAvatar: !avatarId && !avatarUrl,
  };
}

/**
 * One resolved identity for the active user id.
 * Email local-parts are never used as a display name.
 */
export function resolveProfileIdentity(input: {
  authStatus: "unknown" | "signed-out" | "signed-in";
  user: SessionIdentity | null;
  cache: ProfileCacheSnapshot;
}): ResolvedProfileIdentity {
  if (input.authStatus === "unknown") {
    return { ...EMPTY_IDENTITY, pending: true };
  }
  if (input.authStatus !== "signed-in" || !input.user) {
    return EMPTY_IDENTITY;
  }

  const owned = input.cache.ownerId === input.user.id;
  const cacheReady = owned && (input.cache.loaded || cacheHasIdentity(input.cache));
  const sessionReady = Boolean(
    trimmed(input.user.displayName) ||
      trimmed(input.user.username) ||
      trimmed(input.user.avatarUrl) ||
      trimmed(input.user.avatarId),
  );

  if (!cacheReady && !sessionReady) {
    if (owned && input.cache.status === "error") {
      return {
        ...EMPTY_IDENTITY,
        error: input.cache.loadError ?? PROFILE_LOAD_ERROR,
      };
    }
    return { ...EMPTY_IDENTITY, pending: true };
  }

  if (cacheReady) {
    return presentIdentity(input.cache, owned && input.cache.status === "error" ? input.cache.loadError : null);
  }

  return presentIdentity(
    {
      displayName: input.user.displayName ?? null,
      username: input.user.username ?? null,
      bio: null,
      country: input.user.country ?? null,
      joinedAt: null,
      avatarId: input.user.avatarId ?? null,
      avatarUrl: input.user.avatarUrl ?? null,
    },
    null,
  );
}
