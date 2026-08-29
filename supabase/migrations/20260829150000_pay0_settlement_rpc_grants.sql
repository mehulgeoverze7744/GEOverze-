-- =============================================================================
-- PAY-0 — Settlement RPC grant hardening
--
-- Revokes authenticated EXECUTE on internal reward/settlement helpers.
-- No function logic, credit rules, XP, or RLS changes.
--
-- Internal callers (SECURITY DEFINER): submit_quiz_attempt, submit_pvp_attempt,
-- submit_multiplayer_attempt, complete_*_match_if_ready, settle_*_match_rewards
-- continue to invoke these as the function owner.
-- Safe to re-run: REVOKE is idempotent.
-- =============================================================================

revoke all on function public.settle_pvp_match_rewards(uuid)
  from authenticated;

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date
) from authenticated;

-- Re-assert (already revoked in prior MP migrations; idempotent guard).
revoke all on function public.settle_multiplayer_match_rewards(uuid)
  from authenticated;
