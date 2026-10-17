import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldStartOrHydratePlayRun } from "./playSessionGuard.ts";

describe("shouldStartOrHydratePlayRun", () => {
  it("does not restart an in-progress run for the same quiz and mode", () => {
    assert.equal(
      shouldStartOrHydratePlayRun({
        status: "active",
        quizId: "q-flag-frenzy",
        storeMode: "solo",
        setId: "q-flag-frenzy",
        mode: "solo",
      }),
      false,
    );
  });

  it("keeps a completed Flag Frenzy run so the result page can read it", () => {
    assert.equal(
      shouldStartOrHydratePlayRun({
        status: "complete",
        quizId: "q-flag-frenzy",
        storeMode: "solo",
        setId: "q-flag-frenzy",
        mode: "solo",
      }),
      false,
    );
  });

  it("keeps a completed Atlas Sprint run", () => {
    assert.equal(
      shouldStartOrHydratePlayRun({
        status: "complete",
        quizId: "q-atlas-sprint",
        storeMode: "solo",
        setId: "q-atlas-sprint",
        mode: "solo",
      }),
      false,
    );
  });

  it("starts a fresh run when opening a different quiz", () => {
    assert.equal(
      shouldStartOrHydratePlayRun({
        status: "complete",
        quizId: "q-atlas-sprint",
        storeMode: "solo",
        setId: "q-flag-frenzy",
        mode: "solo",
      }),
      true,
    );
  });

  it("starts a fresh run when idle", () => {
    assert.equal(
      shouldStartOrHydratePlayRun({
        status: "idle",
        quizId: null,
        storeMode: null,
        setId: "q-flag-frenzy",
        mode: "solo",
      }),
      true,
    );
  });
});
