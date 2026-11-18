import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AVATAR_CATEGORIES,
  AVATARS,
  CHARACTER_AVATARS,
  PRESET_AVATAR_IDS,
  findAvatar,
  isPresetAvatarId,
} from "../data/onboarding.ts";

test("all eight explorer portraits resolve to local webp assets", () => {
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

test("legacy character avatars keep stable ids and bundled portrait paths", () => {
  for (const avatar of CHARACTER_AVATARS) {
    assert.ok(avatar.src.startsWith("/assets/avatars/"), avatar.id);
    assert.equal(findAvatar(avatar.id)?.id, avatar.id);
  }
  assert.ok(CHARACTER_AVATARS.some((avatar) => avatar.id === "galactic"));
  assert.ok(CHARACTER_AVATARS.some((avatar) => avatar.id === "alien"));
});

test("preset catalog has no duplicate ids across categories", () => {
  assert.equal(new Set(PRESET_AVATAR_IDS).size, PRESET_AVATAR_IDS.length);
  const categorized = AVATAR_CATEGORIES.flatMap((section) => section.avatarIds);
  assert.equal(new Set(categorized).size, categorized.length);
  assert.equal(categorized.length, PRESET_AVATAR_IDS.length);
});

test("isPresetAvatarId recognises explorer and legacy character ids", () => {
  assert.equal(isPresetAvatarId("meridian"), true);
  assert.equal(isPresetAvatarId("galactic"), true);
  assert.equal(isPresetAvatarId("alien"), true);
  assert.equal(isPresetAvatarId(""), false);
  assert.equal(isPresetAvatarId("not-an-avatar"), false);
});