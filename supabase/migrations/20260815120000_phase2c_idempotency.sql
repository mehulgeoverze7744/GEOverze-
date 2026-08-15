-- =============================================================================
-- Phase 2C — Server-Side Idempotency for record_quiz_attempt()
--
-- Problem: record_quiz_attempt() had no server-side duplicate protection.
--   A network retry, multiple-tab scenario, or direct RPC invocation could
--   award XP more than once for the same quiz run.
--
-- Solution: Hybrid lock-then-check approach
--   1. Add attempt_id UUID to quiz_attempts (client-generated idempotency key).
--   2. Add UNIQUE constraint on attempt_id.
--   3. Lock user_progression FIRST (serialises all per-user calls).
--   4. THEN check for existing attempt_id (atomic, inside the lock).
--   5. Duplicate path: return original rewards + current progression; NO mutations.
--   6. New-attempt path: calculate, update, insert, return confirmed values.
--
-- Security:
--   - Idempotency lookup is scoped to auth.uid() — cross-user replay is impossible.
--   - Existing rows receive random UUIDs from the DEFAULT; no historical data lost.
--   - Old 7-parameter signature is dropped to prevent bypassing idempotency.
--
-- Idempotent guards: uses IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS.
-- Safe to re-run.
-- =============================================================================

-- ---- 1. Add attempt_id column to quiz_attempts ---------------------------
alter table public.quiz_attempts
  add column if not exists attempt_id uuid not null default gen_random_uuid();

comment on column public.quiz_attempts.attempt_id is
  'Client-generated idempotency key. Generated with crypto.randomUUID() when '
  'a quiz session starts; stable for the entire session; reset only when a new '
  'quiz session begins. Used by record_quiz_attempt() to detect and reject '
  'duplicate submissions without double-awarding XP or credits.';

-- ---- 2. Unique constraint (the idempotency enforcement) ------------------
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'quiz_attempts_attempt_id_key'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_attempt_id_key unique (attempt_id);
  end if;
end $$;

-- ---- 3. Drop the old 7-parameter function --------------------------------
-- The old signature had no attempt_id and no idempotency protection.
-- Dropping it prevents any client from bypassing the new safeguards by
-- calling the unprotected version directly.
drop function if exists public.record_quiz_attempt(
  text, text, integer, smallint, smallint, smallint, integer
);

-- ---- 4. New record_quiz_attempt() with idempotency -----------------------
create or replace function public.record_quiz_attempt(
  _attempt_id  uuid,
  _quiz_id     text,
  _mode        text,
  _score       integer,
  _correct     smallint,
  _total       smallint,
  _best_streak smallint,
  _duration_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid            uuid;
  v_prog           public.user_progression%rowtype;
  v_existing       record;
  v_xp_earned      integer;
  v_credits_earned integer;
  v_new_xp         integer;
  v_old_level      smallint;
  v_new_level      smallint;
  v_level_up       boolean;
  v_today          date;
  v_new_streak     smallint;
  v_new_longest    smallint;
  v_new_credits    integer;
  v_new_total_q    integer;
  v_new_total_c    integer;
  v_new_total_a    integer;
begin
  -- ---- Identity ----------------------------------------------------------
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  -- ---- Validate attempt_id first (cheap; no lock needed) ----------------
  if _attempt_id is null then
    raise exception 'attempt_id is required and must not be null';
  end if;

  -- ---- Input validation --------------------------------------------------
  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
  end if;

  if _mode not in ('solo', 'practice', 'pvp', 'multiplayer') then
    raise exception 'Invalid mode: %. Must be one of: solo, practice, pvp, multiplayer', _mode;
  end if;

  if _total is null or _total <= 0 or _total > 100 then
    raise exception 'total must be between 1 and 100, got %', _total;
  end if;

  if _correct is null or _correct < 0 or _correct > _total then
    raise exception 'correct (%) must be between 0 and total (%)', _correct, _total;
  end if;

  if _best_streak is null or _best_streak < 0 or _best_streak > _total then
    raise exception 'best_streak (%) out of valid range [0, %]', _best_streak, _total;
  end if;

  if _score is null or _score < 0 then
    raise exception 'score must be >= 0';
  end if;

  if _duration_ms is null or _duration_ms <= 0 then
    raise exception 'duration_ms must be > 0';
  end if;

  -- Reject implausibly fast submissions: 200 ms minimum average per question.
  if _duration_ms < _total * 200 then
    raise exception
      'Submission rejected: duration_ms (%) is implausibly short for % questions',
      _duration_ms, _total;
  end if;

  -- ---- Lock user_progression (serialises all per-user concurrent calls) --
  --
  -- Acquiring this row-level lock BEFORE the idempotency check guarantees that
  -- two concurrent requests from the same user cannot both pass the duplicate
  -- check and both apply progression mutations.
  --
  -- Execution for the same user_id is serialised:
  --   Thread A: acquires lock → checks attempt (not found) → writes → commits
  --   Thread B: waits for lock → acquires after A commits → checks attempt
  --             (FOUND!) → returns duplicate result without any mutation
  select * into v_prog
  from public.user_progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', v_uid;
  end if;

  -- ---- Idempotency check (inside the lock, before any progression write) --
  --
  -- Scope lookup to auth.uid() so a caller cannot present another user's
  -- attempt_id to replay their rewards or prevent their future updates.
  select xp_earned, credits_earned
  into v_existing
  from public.quiz_attempts
  where attempt_id = _attempt_id
    and user_id    = v_uid;

  if found then
    -- Duplicate submission detected.
    -- Return the original xp_earned/credits_earned from the stored attempt
    -- alongside the current (unmodified) progression state.
    -- Nothing is written; no counters are changed.
    return jsonb_build_object(
      'xp_earned',      v_existing.xp_earned,
      'credits_earned', v_existing.credits_earned,
      'new_xp',         v_prog.xp,
      'new_level',      v_prog.level::integer,
      'level_up',       false,
      'new_streak',     v_prog.current_streak::integer,
      'new_credits',    v_prog.credits,
      'total_quizzes',  v_prog.total_quizzes,
      'total_correct',  v_prog.total_correct,
      'total_answered', v_prog.total_answered,
      'duplicate',      true
    );
  end if;

  -- ---- Server-side reward calculation (genuinely new attempt only) -------
  --
  -- XP formula (Phase 2C):
  --   50 XP minimum for completing any quiz  ("Quiz completion +50 XP")
  --   25 XP per correct answer               (scales linearly with performance)
  --
  -- Examples:
  --   10/10 correct => GREATEST(50, 10*25) = 250 XP
  --    5/10 correct => GREATEST(50,  5*25) = 125 XP
  --    0/10 correct => GREATEST(50,  0*25) =  50 XP
  v_xp_earned      := greatest(50, (_correct::integer) * 25);
  v_credits_earned := 0;  -- Phase 2C: PvP win ledger arrives in Phase 3.

  -- ---- Derived values ----------------------------------------------------
  v_old_level   := v_prog.level;
  v_new_xp      := v_prog.xp + v_xp_earned;
  v_new_credits := v_prog.credits + v_credits_earned;
  v_new_total_q := v_prog.total_quizzes  + 1;
  v_new_total_c := v_prog.total_correct  + _correct;
  v_new_total_a := v_prog.total_answered + _total;

  -- Level thresholds match XP_THRESHOLDS in progression/lib/progress.ts.
  v_new_level := (
    case
      when v_new_xp >= 28500 then least(99, 20 + (v_new_xp - 28500) / 2000)
      when v_new_xp >= 26200 then 19
      when v_new_xp >= 24000 then 18
      when v_new_xp >= 22000 then 17
      when v_new_xp >= 20400 then 16
      when v_new_xp >= 19000 then 15
      when v_new_xp >= 18000 then 14
      when v_new_xp >= 17200 then 13
      when v_new_xp >= 16000 then 12
      when v_new_xp >= 14800 then 11
      when v_new_xp >= 13200 then 10
      when v_new_xp >= 12000 then  9
      when v_new_xp >= 10500 then  8
      when v_new_xp >=  8000 then  7
      when v_new_xp >=  5500 then  6
      when v_new_xp >=  3500 then  5
      when v_new_xp >=  2000 then  4
      when v_new_xp >=  1000 then  3
      when v_new_xp >=   500 then  2
      else 1
    end
  )::smallint;

  v_level_up := v_new_level > v_old_level;

  v_today := current_date;

  if v_prog.last_played_date is null then
    v_new_streak := 1;
  elsif v_prog.last_played_date = v_today then
    v_new_streak := v_prog.current_streak;
  elsif v_prog.last_played_date = v_today - interval '1 day' then
    v_new_streak := v_prog.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_new_longest := greatest(v_prog.longest_streak, v_new_streak);

  -- ---- Atomic write ------------------------------------------------------

  -- 1. Update progression (held under FOR UPDATE lock).
  update public.user_progression
  set
    xp               = v_new_xp,
    level            = v_new_level,
    credits          = v_new_credits,
    total_quizzes    = v_new_total_q,
    total_correct    = v_new_total_c,
    total_answered   = v_new_total_a,
    current_streak   = v_new_streak,
    longest_streak   = v_new_longest,
    last_played_date = v_today
  where user_id = v_uid;

  -- 2. Insert immutable attempt record with idempotency key.
  --    The UNIQUE constraint on attempt_id is the final safety net: even if
  --    a concurrent transaction somehow passed the check above, this INSERT
  --    will raise unique_violation rather than silently double-counting.
  insert into public.quiz_attempts (
    attempt_id, user_id, quiz_id, mode, score,
    correct, total, best_streak,
    xp_earned, credits_earned, duration_ms
  ) values (
    _attempt_id, v_uid, _quiz_id, _mode, _score,
    _correct, _total, _best_streak,
    v_xp_earned, v_credits_earned, _duration_ms
  );

  -- ---- Return confirmed server values ------------------------------------
  return jsonb_build_object(
    'xp_earned',      v_xp_earned,
    'credits_earned', v_credits_earned,
    'new_xp',         v_new_xp,
    'new_level',      v_new_level::integer,
    'level_up',       v_level_up,
    'new_streak',     v_new_streak::integer,
    'new_credits',    v_new_credits,
    'total_quizzes',  v_new_total_q,
    'total_correct',  v_new_total_c,
    'total_answered', v_new_total_a,
    'duplicate',      false
  );
end;
$$;

comment on function public.record_quiz_attempt(
  uuid, text, text, integer, smallint, smallint, smallint, integer
) is
  'Authoritative progression write with server-side idempotency. '
  'Validates attempt_id (required), locks user_progression (serialising '
  'concurrent per-user calls), checks for duplicate before any mutation, '
  'calculates XP server-side, inserts immutable quiz_attempts row. '
  'Duplicate path returns original rewards + current progression without '
  'any writes. SECURITY DEFINER; user identity always from auth.uid(). '
  'anon cannot execute.';

revoke all on function public.record_quiz_attempt(
  uuid, text, text, integer, smallint, smallint, smallint, integer
) from public, anon;

grant execute on function public.record_quiz_attempt(
  uuid, text, text, integer, smallint, smallint, smallint, integer
) to authenticated;
