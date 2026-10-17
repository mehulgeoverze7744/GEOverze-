import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { storedResultMatches } from "./storedResultMatch.ts";

describe("storedResultMatches", () => {
  it("loads Flag Frenzy only for the matching quiz and attempt", () => {
    const stored = { quizId: "q-flag-frenzy", attemptId: "attempt-flag-1" };
    assert.equal(storedResultMatches(stored, "q-flag-frenzy"), true);
    assert.equal(storedResultMatches(stored, "q-flag-frenzy", "attempt-flag-1"), true);
    assert.equal(storedResultMatches(stored, "q-flag-frenzy", "other-attempt"), false);
    assert.equal(storedResultMatches(stored, "q-atlas-sprint"), false);
  });

  it("does not show a stale Atlas Sprint result on Flag Frenzy", () => {
    assert.equal(
      storedResultMatches({ quizId: "q-atlas-sprint", attemptId: "a1" }, "q-flag-frenzy"),
      false,
    );
  });
});
