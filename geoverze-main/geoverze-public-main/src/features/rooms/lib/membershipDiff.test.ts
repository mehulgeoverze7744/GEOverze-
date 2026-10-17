import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { diffRoomMembership } from "./membershipDiff.ts";

describe("diffRoomMembership", () => {
  it("emits nothing for the first snapshot", () => {
    const next = [{ user_id: "a", display_name: "Ada" }];
    assert.deepEqual(diffRoomMembership(null, next, "a"), []);
  });

  it("announces a peer join and ignore the local player", () => {
    const previous = [{ user_id: "a", display_name: "Ada" }];
    const next = [
      { user_id: "a", display_name: "Ada" },
      { user_id: "b", display_name: "Mehul" },
    ];
    assert.deepEqual(diffRoomMembership(previous, next, "a"), [
      { kind: "joined", userId: "b", name: "Mehul" },
    ]);
  });

  it("announces a peer leave", () => {
    const previous = [
      { user_id: "a", display_name: "Ada" },
      { user_id: "b", display_name: "Mehul" },
    ];
    const next = [{ user_id: "a", display_name: "Ada" }];
    assert.deepEqual(diffRoomMembership(previous, next, "a"), [
      { kind: "left", userId: "b", name: "Mehul" },
    ]);
  });

  it("does not duplicate when the same roster is applied twice", () => {
    const roster = [
      { user_id: "a", display_name: "Ada" },
      { user_id: "b", display_name: "Mehul" },
    ];
    assert.deepEqual(diffRoomMembership(roster, roster, "a"), []);
  });
});
