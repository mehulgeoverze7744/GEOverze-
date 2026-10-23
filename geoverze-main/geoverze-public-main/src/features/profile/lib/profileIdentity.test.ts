import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PROFILE_LOAD_ERROR,
  bumpProfileEpoch,
  canonicalProfileFromEdit,
  canonicalProfileFromRow,
  currentProfileEpoch,
  resetProfileEpochForTests,
  resolveProfileIdentity,
  retainSessionIdentity,
  sessionIdentityFromProfile,
  shouldApplyProfilePayload,
  shouldStartProfileHydration,
  type ProfileCacheSnapshot,
} from "./profileIdentity.ts";

const PORTRAIT = "https://cdn.example.test/avatars/atlas.jpg";

function cache(patch: Partial<ProfileCacheSnapshot> = {}): ProfileCacheSnapshot {
  return {
    ownerId: null,
    displayName: null,
    username: null,
    bio: null,
    country: null,
    joinedAt: null,
    avatarId: null,
    avatarUrl: null,
    loaded: false,
    status: "idle",
    loadError: null,
    ...patch,
  };
}

const saved = cache({
  ownerId: "user-a",
  displayName: "Atlas Keeper",
  username: "atlas_keeper",
  bio: "Mapping coastlines.",
  country: "NZ",
  joinedAt: "2024-03-01T00:00:00.000Z",
  avatarUrl: PORTRAIT,
  loaded: true,
  status: "ready",
});

describe("profile identity", () => {
  it("restores the saved profile after the session user id is known", () => {
    const whileRestoring = resolveProfileIdentity({
      authStatus: "unknown",
      user: null,
      cache: saved,
    });
    assert.equal(whileRestoring.pending, true);
    assert.equal(whileRestoring.displayName, "");
    assert.equal(whileRestoring.avatarUrl, null);

    const restored = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: saved,
    });
    assert.equal(restored.pending, false);
    assert.equal(restored.displayName, "Atlas Keeper");
    assert.equal(restored.username, "atlas_keeper");
    assert.equal(restored.avatarUrl, PORTRAIT);
    assert.equal(restored.showDefaultAvatar, false);
    assert.equal(restored.bio, "Mapping coastlines.");
  });

  it("keeps a saved display name instead of falling back to the username or email", () => {
    const first = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test", username: "atlas_keeper" },
      cache: saved,
    });
    const second = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: saved,
    });
    assert.equal(first.displayName, "Atlas Keeper");
    assert.equal(second.displayName, "Atlas Keeper");
    assert.notEqual(first.displayName, first.username);
    assert.notEqual(first.displayName, "atlas.keeper");
  });

  it("keeps a saved avatar instead of the default portrait", () => {
    const retained = retainSessionIdentity(
      { id: "user-a", email: "atlas.keeper@example.test", displayName: "Atlas Keeper", avatarUrl: PORTRAIT },
      { id: "user-a", email: "atlas.keeper@example.test" },
    );
    assert.equal(retained.avatarUrl, PORTRAIT);

    const shown = resolveProfileIdentity({
      authStatus: "signed-in",
      user: retained,
      cache: saved,
    });
    assert.equal(shown.avatarUrl, PORTRAIT);
    assert.equal(shown.showDefaultAvatar, false);
  });

  it("rejects a late response from an older profile request", () => {
    resetProfileEpochForTests();
    const started = currentProfileEpoch();
    bumpProfileEpoch();
    assert.equal(
      shouldApplyProfilePayload({
        requestUserId: "user-a",
        activeUserId: "user-a",
        requestEpoch: started,
        currentEpoch: currentProfileEpoch(),
      }),
      false,
    );

    const current = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test", displayName: "Atlas Keeper", avatarUrl: PORTRAIT },
      cache: saved,
    });
    assert.equal(current.displayName, "Atlas Keeper");
    assert.equal(current.avatarUrl, PORTRAIT);
  });

  it("does not keep the previous account when the signed-in user changes", () => {
    const switched = retainSessionIdentity(
      { id: "user-a", email: "atlas.keeper@example.test", displayName: "Atlas Keeper", avatarUrl: PORTRAIT },
      { id: "user-b", email: "river.guide@example.test" },
    );
    assert.equal(switched.id, "user-b");
    assert.equal(switched.displayName, undefined);
    assert.equal(switched.avatarUrl, undefined);

    const shown = resolveProfileIdentity({
      authStatus: "signed-in",
      user: switched,
      cache: saved,
    });
    assert.equal(shown.pending, true);
    assert.equal(shown.displayName, "");
    assert.equal(shown.avatarUrl, null);
    assert.notEqual(shown.displayName, "Atlas Keeper");
  });

  it("shows a saved display name from the profile row, not the email prefix", () => {
    const row = canonicalProfileFromEdit({
      userId: "user-a",
      displayName: "North Star",
      username: "atlas_keeper",
      bio: "Mapping coastlines.",
      country: "NZ",
      avatarId: null,
      avatarUrl: PORTRAIT,
      joinedAt: saved.joinedAt,
    });
    const session = sessionIdentityFromProfile(
      { id: "user-a", email: "atlas.keeper@example.test" },
      row,
    );
    const shown = resolveProfileIdentity({
      authStatus: "signed-in",
      user: session,
      cache: { ...cache(), ...row },
    });
    assert.equal(shown.displayName, "North Star");
    assert.equal(shown.username, "atlas_keeper");
    assert.equal(session.displayName, "North Star");
  });

  it("keeps a saved avatar after the profile row is updated", () => {
    const nextPortrait = "https://cdn.example.test/avatars/north-star.jpg";
    const row = canonicalProfileFromRow(
      "user-a",
      {
        display_name: "North Star",
        username: "atlas_keeper",
        bio: "Mapping coastlines.",
        country_code: "NZ",
        avatar_id: null,
        avatar_url: nextPortrait,
        created_at: saved.joinedAt,
      },
      saved.joinedAt,
    );
    const shown = resolveProfileIdentity({
      authStatus: "signed-in",
      user: sessionIdentityFromProfile({ id: "user-a", email: "atlas.keeper@example.test" }, row),
      cache: { ...cache(), ...row },
    });
    const again = resolveProfileIdentity({
      authStatus: "signed-in",
      user: retainSessionIdentity(
        { id: "user-a", email: "atlas.keeper@example.test", avatarUrl: nextPortrait },
        { id: "user-a", email: "atlas.keeper@example.test" },
      ),
      cache: { ...cache(), ...row },
    });
    assert.equal(shown.avatarUrl, nextPortrait);
    assert.equal(again.avatarUrl, nextPortrait);
    assert.equal(again.showDefaultAvatar, false);
  });

  it("uses the persisted profile for this user id when the page loads again", () => {
    const beforeAuth = resolveProfileIdentity({
      authStatus: "unknown",
      user: null,
      cache: saved,
    });
    const afterRefresh = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: saved,
    });
    assert.equal(beforeAuth.displayName, "");
    assert.equal(afterRefresh.displayName, "Atlas Keeper");
    assert.equal(afterRefresh.avatarUrl, PORTRAIT);
    assert.equal(afterRefresh.joinedAt, "2024-03-01T00:00:00.000Z");
  });

  it("uses one stable fallback when the saved profile has no avatar", () => {
    const bare = cache({
      ownerId: "user-a",
      displayName: "Atlas Keeper",
      username: "atlas_keeper",
      loaded: true,
      status: "ready",
    });
    const first = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: bare,
    });
    const second = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: bare,
    });
    assert.equal(first.showDefaultAvatar, true);
    assert.equal(first.avatarUrl, null);
    assert.equal(first.avatarId, null);
    assert.deepEqual(first, second);
    assert.equal(first.displayName, "Atlas Keeper");
  });

  it("keeps a failed profile load failed until a manual retry", () => {
    const failed = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: cache({
        ownerId: "user-a",
        status: "error",
        loadError: PROFILE_LOAD_ERROR,
      }),
    });
    assert.equal(failed.pending, false);
    assert.equal(failed.error, PROFILE_LOAD_ERROR);
    assert.equal(failed.displayName, "");
    assert.equal(failed.showDefaultAvatar, false);

    const kept = resolveProfileIdentity({
      authStatus: "signed-in",
      user: { id: "user-a", email: "atlas.keeper@example.test" },
      cache: { ...saved, status: "error", loadError: PROFILE_LOAD_ERROR },
    });
    assert.equal(kept.displayName, "Atlas Keeper");
    assert.equal(kept.avatarUrl, PORTRAIT);
    assert.equal(kept.error, PROFILE_LOAD_ERROR);

    const input = {
      event: "TOKEN_REFRESHED",
      userId: "user-a",
      inFlightUserId: null,
      profileRequestFailed: true,
    };
    assert.equal(shouldStartProfileHydration(input), false);
    assert.equal(shouldStartProfileHydration({ ...input, event: "getSession" }), false);
    assert.equal(shouldStartProfileHydration({ ...input, event: "INITIAL_SESSION" }), false);
    assert.equal(shouldStartProfileHydration({ ...input, event: "manual" }), true);
    assert.equal(
      shouldStartProfileHydration({ ...input, event: "getSession", inFlightUserId: "user-a", profileRequestFailed: false }),
      false,
    );
  });
});
