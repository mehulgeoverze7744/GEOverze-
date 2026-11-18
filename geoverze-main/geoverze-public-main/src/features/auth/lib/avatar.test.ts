import assert from "node:assert/strict";
import { test } from "node:test";

import { AVATARS, findAvatar } from "../data/onboarding.ts";

test("all eight explorer marks resolve to local portrait assets", () => {
  assert.equal(AVATARS.length, 8);
  for (const avatar of AVATARS) {
    const found = findAvatar(avatar.id);
    assert.equal(found?.src, `/assets/avatars/${avatar.id}.webp`);
  }
});

test("explorer ids stay unique and locally mapped", () => {
  const ids = AVATARS.map((avatar) => avatar.id);
  assert.deepEqual(ids, [
    "meridian",
    "atlas",
    "compass",
    "equator",
    "summit",
    "voyager",
    "delta",
    "orbit",
  ]);
  assert.equal(new Set(ids).size, 8);
});
