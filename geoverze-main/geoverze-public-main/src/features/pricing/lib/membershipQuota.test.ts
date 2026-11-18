import assert from "node:assert/strict";
import test from "node:test";

import { isPlayModeOpen } from "../../dashboard/lib/playAccess.ts";
import { getRemainingQuizzes, parseUserMembership } from "./membership.ts";
import type { SubscriptionPlanRow } from "../data/fetchSubscriptionCatalog.ts";

function plan(partial: Partial<SubscriptionPlanRow>): SubscriptionPlanRow {
  return {
    active: true,
    annual_price_cents: 0,
    created_at: "",
    credit_rollover_months: 1,
    display_name: "Test",
    gstore_discount_bps: 0,
    is_creator_plan: false,
    metadata: {},
    monthly_credit_grant: 0,
    monthly_price_cents: 0,
    monthly_quiz_limit: null,
    multiplayer_limit: null,
    pvp_limit: null,
    rollover_tier_key: "explorer",
    solo_quiz_limit: null,
    tier: "explorer",
    updated_at: "",
    ...partial,
  } as SubscriptionPlanRow;
}

function competitivePlayable(
  catalogPlan: SubscriptionPlanRow,
  mode: "pvp" | "multiplayer",
  membership: ReturnType<typeof parseUserMembership>,
): boolean {
  if (!membership) return false;
  const open = isPlayModeOpen(catalogPlan, mode);
  const remaining = getRemainingQuizzes(membership);
  const left = mode === "pvp" ? remaining.pvpRemaining : remaining.multiplayerRemaining;
  return open && (left == null || left > 0);
}

test("Explorer may play one PvP and one multiplayer quiz per month", () => {
  const explorerPlan = plan({ solo_quiz_limit: 8, pvp_limit: 1, multiplayer_limit: 1 });
  const membership = parseUserMembership({
    user_id: "u1",
    tier: "explorer",
    plan_name: "Explorer",
    status: "active",
    monthly_quiz_limit: null,
    solo_quiz_limit: 8,
    pvp_limit: 1,
    multiplayer_limit: 1,
    pvp_access: true,
    multiplayer_access: true,
    quiz_usage: { period_start: "2026-11-01", solo_count: 0, pvp_count: 0, multiplayer_count: 0, total_count: 0 },
  });
  assert.ok(membership);
  assert.equal(competitivePlayable(explorerPlan, "pvp", membership), true);
  assert.equal(competitivePlayable(explorerPlan, "multiplayer", membership), true);
});

test("Basic may play one PvP and one multiplayer quiz per month", () => {
  const basicPlan = plan({ tier: "basic", monthly_quiz_limit: 60, pvp_limit: 1, multiplayer_limit: 1 });
  const fresh = parseUserMembership({
    user_id: "u2",
    tier: "basic",
    plan_name: "Basic",
    status: "active",
    monthly_quiz_limit: 60,
    solo_quiz_limit: null,
    pvp_limit: 1,
    multiplayer_limit: 1,
    pvp_access: true,
    multiplayer_access: true,
    quiz_usage: { period_start: "2026-11-01", solo_count: 5, pvp_count: 0, multiplayer_count: 0, total_count: 5 },
  });
  assert.ok(fresh);
  assert.equal(competitivePlayable(basicPlan, "pvp", fresh), true);
  assert.equal(competitivePlayable(basicPlan, "multiplayer", fresh), true);
});

test("Basic second PvP attempt is blocked when monthly cap is exhausted", () => {
  const basicPlan = plan({ tier: "basic", monthly_quiz_limit: 60, pvp_limit: 1, multiplayer_limit: 1 });
  const afterPvp = parseUserMembership({
    user_id: "u2",
    tier: "basic",
    plan_name: "Basic",
    status: "active",
    monthly_quiz_limit: 60,
    pvp_limit: 1,
    multiplayer_limit: 1,
    pvp_access: true,
    multiplayer_access: true,
    quiz_usage: { period_start: "2026-11-01", solo_count: 10, pvp_count: 1, multiplayer_count: 0, total_count: 11 },
  });
  assert.ok(afterPvp);
  assert.equal(competitivePlayable(basicPlan, "pvp", afterPvp), false);
  assert.equal(getRemainingQuizzes(afterPvp).pvpRemaining, 0);
  assert.equal(competitivePlayable(basicPlan, "multiplayer", afterPvp), true);
});

test("Basic second multiplayer attempt is blocked when monthly cap is exhausted", () => {
  const basicPlan = plan({ tier: "basic", monthly_quiz_limit: 60, pvp_limit: 1, multiplayer_limit: 1 });
  const afterMp = parseUserMembership({
    user_id: "u2",
    tier: "basic",
    plan_name: "Basic",
    status: "active",
    monthly_quiz_limit: 60,
    pvp_limit: 1,
    multiplayer_limit: 1,
    pvp_access: true,
    multiplayer_access: true,
    quiz_usage: { period_start: "2026-11-01", solo_count: 4, pvp_count: 0, multiplayer_count: 1, total_count: 5 },
  });
  assert.ok(afterMp);
  assert.equal(competitivePlayable(basicPlan, "multiplayer", afterMp), false);
  assert.equal(getRemainingQuizzes(afterMp).multiplayerRemaining, 0);
});

test("Pro competitive modes stay open with unlimited caps", () => {
  const proPlan = plan({ tier: "pro", monthly_quiz_limit: null, pvp_limit: null, multiplayer_limit: null });
  const membership = parseUserMembership({
    user_id: "u3",
    tier: "pro",
    plan_name: "Pro",
    status: "active",
    monthly_quiz_limit: null,
    pvp_limit: null,
    multiplayer_limit: null,
    pvp_access: true,
    multiplayer_access: true,
    quiz_usage: {
      period_start: "2026-11-01",
      solo_count: 40,
      pvp_count: 25,
      multiplayer_count: 12,
      total_count: 77,
    },
  });
  assert.ok(membership);
  assert.equal(competitivePlayable(proPlan, "pvp", membership), true);
  assert.equal(competitivePlayable(proPlan, "multiplayer", membership), true);
  assert.equal(getRemainingQuizzes(membership).unlimited, true);
});

test("new calendar month resets remaining competitive quotas in the snapshot", () => {
  const basic = parseUserMembership({
    user_id: "u2",
    tier: "basic",
    plan_name: "Basic",
    status: "active",
    monthly_quiz_limit: 60,
    pvp_limit: 1,
    multiplayer_limit: 1,
    pvp_access: true,
    multiplayer_access: true,
    quiz_usage: { period_start: "2026-12-01", solo_count: 0, pvp_count: 0, multiplayer_count: 0, total_count: 0 },
  });
  assert.ok(basic);
  assert.equal(getRemainingQuizzes(basic).pvpRemaining, 1);
  assert.equal(getRemainingQuizzes(basic).multiplayerRemaining, 1);
});