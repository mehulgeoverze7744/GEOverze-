import assert from "node:assert/strict";
import test from "node:test";

import { resolveEntitlements } from "./entitlements.ts";
import {
  checkEntitlement,
  getLibraryAccess,
  getMembershipDiscountBps,
  getRemainingQuizzes,
  parseUserMembership,
  quotaExceededKind,
} from "./membership.ts";
import { isPlayModeOpen } from "../../dashboard/lib/playAccess.ts";
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

test("Explorer keeps independent PvP and multiplayer caps", () => {
  const explorer = plan({ solo_quiz_limit: 8, pvp_limit: 1, multiplayer_limit: 1 });
  assert.equal(isPlayModeOpen(explorer, "solo"), true);
  assert.equal(isPlayModeOpen(explorer, "pvp"), true);
  assert.equal(isPlayModeOpen(explorer, "multiplayer"), true);
});

test("Basic monthly quiz bundle does not grant unlimited PvP or multiplayer", () => {
  const basic = plan({
    tier: "basic",
    monthly_quiz_limit: 60,
    pvp_limit: 1,
    multiplayer_limit: 1,
  });
  assert.equal(isPlayModeOpen(basic, "pvp"), true);
  assert.equal(isPlayModeOpen(basic, "multiplayer"), true);

  const broken = plan({ tier: "basic", monthly_quiz_limit: 60, pvp_limit: 0, multiplayer_limit: 0 });
  assert.equal(isPlayModeOpen(broken, "pvp"), false);
  assert.equal(isPlayModeOpen(broken, "multiplayer"), false);
});

test("Pro unlimited quizzes keep competitive modes open", () => {
  const pro = plan({ tier: "pro", monthly_quiz_limit: null, pvp_limit: null, multiplayer_limit: null });
  assert.equal(isPlayModeOpen(pro, "pvp"), true);
  assert.equal(isPlayModeOpen(pro, "multiplayer"), true);
});

test("parseUserMembership and remaining quizzes honour calendar limits", () => {
  const membership = parseUserMembership({
    user_id: "00000000-0000-0000-0000-000000000001",
    tier: "basic",
    plan_name: "Basic",
    status: "active",
    monthly_quiz_limit: 60,
    solo_quiz_limit: null,
    pvp_limit: 1,
    multiplayer_limit: 1,
    monthly_credit_grant: 5,
    credit_rollover_months: 1,
    available_credits: 12,
    period_grant_amount: 5,
    gstore_discount_bps: 300,
    library_access: "limited",
    pvp_access: true,
    multiplayer_access: true,
    all_atlases: false,
    advanced_analytics: false,
    member_challenges: false,
    creator_studio: false,
    quiz_usage: { period_start: "2026-11-01", solo_count: 10, pvp_count: 1, multiplayer_count: 0, total_count: 11 },
  });
  assert.ok(membership);
  const remaining = getRemainingQuizzes(membership);
  assert.equal(remaining.monthlyRemaining, 49);
  assert.equal(remaining.pvpRemaining, 0);
  assert.equal(remaining.multiplayerRemaining, 1);
  assert.equal(getMembershipDiscountBps(membership), 300);
  assert.equal(getLibraryAccess(membership), "limited");
  assert.equal(checkEntitlement(membership, "gstore_discount"), true);
  assert.equal(checkEntitlement(membership, "member_challenges"), false);
  assert.equal(checkEntitlement(membership, "pvp"), true);
  assert.equal(checkEntitlement(membership, "advanced_analytics"), false);
});

test("Pro entitlements include analytics, challenges, library and 10% discount", () => {
  const can = resolveEntitlements("pro");
  assert.equal(can.unlimitedQuizzes, true);
  assert.equal(can.fullLibraryAccess, true);
  assert.equal(can.advancedAnalytics, true);
  assert.equal(can.memberChallenges, true);
  assert.equal(can.gstoreDiscount10Pct, true);
  assert.equal(can.creatorStudio, false);
});

test("quota error messages are classified without exposing attack steps", () => {
  assert.equal(quotaExceededKind("QUOTA_EXCEEDED:solo"), "solo");
  assert.equal(quotaExceededKind("QUIZ_LOCKED:pro"), "locked");
  assert.equal(quotaExceededKind("network down"), null);
});
