-- =============================================================================
-- PAY-0 — Remove synthetic verification test data (PAYPVP, PAYMPR)
--
-- Data cleanup only. Reverts test progression deltas, deletes test quiz_attempts,
-- then deletes test rooms (cascades pvp_participants + credit_transactions).
-- No RPC, RLS, or reward-rule changes.
-- Safe to re-run: no-op when test rooms are absent.
-- =============================================================================

do $$
declare
  v_room_pvp uuid;
  v_room_mp  uuid;
begin
  select id into v_room_pvp from public.pvp_rooms where room_code = 'PAYPVP';
  select id into v_room_mp from public.pvp_rooms where room_code = 'PAYMPR';

  if v_room_pvp is null and v_room_mp is null then
    raise notice 'PAY-0 cleanup: no test rooms found — skipping';
    return;
  end if;

  -- Revert user_progression deltas stamped by test settlements.
  with test_effects as (
    select
      pp.user_id,
      sum(coalesce(pp.xp_earned, 0))::integer       as xp_delta,
      sum(coalesce(pp.credits_earned, 0))::integer  as credits_delta,
      sum(coalesce(pp.correct, 0))::integer         as correct_delta,
      sum(coalesce(pp.total, 0))::integer           as answered_delta,
      count(*)::integer                              as quiz_delta
    from public.pvp_participants pp
    where pp.room_id in (v_room_pvp, v_room_mp)
    group by pp.user_id
  )
  update public.user_progression up
  set
    xp              = greatest(0, up.xp - te.xp_delta),
    level           = public.level_from_xp(greatest(0, up.xp - te.xp_delta)),
    credits         = greatest(0, up.credits - te.credits_delta),
    total_quizzes   = greatest(0, up.total_quizzes - te.quiz_delta),
    total_correct   = greatest(0, up.total_correct - te.correct_delta),
    total_answered  = greatest(0, up.total_answered - te.answered_delta)
  from test_effects te
  where up.user_id = te.user_id;

  -- Remove PvP quiz_attempt rows created by test settlement.
  delete from public.quiz_attempts qa
  where qa.attempt_id in (
    select pp.attempt_id
    from public.pvp_participants pp
    where pp.room_id in (v_room_pvp, v_room_mp)
      and pp.attempt_id is not null
  );

  -- Cascades pvp_participants + credit_transactions via FK.
  delete from public.pvp_rooms
  where room_code in ('PAYPVP', 'PAYMPR');
end;
$$;
