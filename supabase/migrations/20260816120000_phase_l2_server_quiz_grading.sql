-- =============================================================================
-- Phase L2 — Server-Trusted Solo Quiz Scoring
--
-- Replaces client-trusted record_quiz_attempt() with submit_quiz_attempt(),
-- which grades submitted answers server-side against quiz_questions.
--
-- Security:
--   - SECURITY DEFINER bypasses RLS; function explicitly requires is_published.
--   - Client-supplied correct/total/score/best_streak are never accepted.
--   - order/dragdrop placeholder types are excluded from the graded total.
--   - Phase 2C attempt_id idempotency is preserved unchanged.
--
-- Safe to re-run: uses CREATE OR REPLACE / DROP IF EXISTS guards.
-- =============================================================================

-- ---- 1. Typed-answer normalisation (mirrors client session.ts) --------------
create or replace function public.normalize_typed_answer(p_text text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result text;
begin
  if p_text is null then
    return '';
  end if;

  v_result := lower(trim(p_text));
  -- Remove characters that are not letters, digits, or whitespace.
  v_result := regexp_replace(v_result, '[^[:alpha:][:digit:][:space:]]', '', 'g');
  v_result := regexp_replace(trim(v_result), '\s+', ' ', 'g');
  return v_result;
end;
$$;

comment on function public.normalize_typed_answer(text) is
  'Normalises free-text quiz answers for comparison. Mirrors the browser '
  'normalise() helper in features/quiz/lib/session.ts.';

-- ---- 2. Per-question grading helper ---------------------------------------
create or replace function public.grade_quiz_answer(
  p_type        public.question_type,
  p_answer_id   text,
  p_answer_ids  text[],
  p_answer_bool boolean,
  p_accepted    text[],
  p_value       jsonb,
  p_skipped     boolean
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  v_submitted text[];
  v_expected  text[];
  v_norm      text;
  v_accepted  text;
begin
  if p_skipped
     or p_value is null
     or jsonb_typeof(p_value) <> 'array'
     or jsonb_array_length(p_value) = 0
  then
    return false;
  end if;

  case p_type
    when 'single', 'image', 'map' then
      return p_value->>0 is not null and p_value->>0 = p_answer_id;

    when 'boolean' then
      return p_value->>0 = case when p_answer_bool then 'true' else 'false' end;

    when 'multiple' then
      select coalesce(array_agg(elem order by elem), '{}')
      into v_submitted
      from jsonb_array_elements_text(p_value) as elem;

      select coalesce(array_agg(elem order by elem), '{}')
      into v_expected
      from unnest(coalesce(p_answer_ids, '{}')) as elem;

      return v_submitted = v_expected;

    when 'typed' then
      v_norm := public.normalize_typed_answer(p_value->>0);
      if v_norm = '' then
        return false;
      end if;

      foreach v_accepted in array coalesce(p_accepted, '{}')
      loop
        if public.normalize_typed_answer(v_accepted) = v_norm then
          return true;
        end if;
      end loop;

      return false;

    else
      -- order, dragdrop, and unknown types are never graded as correct.
      return false;
  end case;
end;
$$;

comment on function public.grade_quiz_answer(
  public.question_type, text, text[], boolean, text[], jsonb, boolean
) is
  'Grades one submitted answer against quiz_questions DB fields. '
  'Placeholder types (order, dragdrop) always return false.';

-- ---- 3. Drop the old client-trusted RPC -----------------------------------
drop function if exists public.record_quiz_attempt(
  uuid, text, text, integer, smallint, smallint, smallint, integer
);

-- ---- 4. submit_quiz_attempt() — authoritative server grading --------------
create or replace function public.submit_quiz_attempt(
  _attempt_id  uuid,
  _quiz_id     text,
  _mode        text,
  _duration_ms integer,
  _answers     jsonb
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
  v_quiz           public.quizzes%rowtype;
  v_question       record;
  v_answer_elem    record;
  v_has_answer     boolean;
  v_sub_skipped    boolean;
  v_sub_value      jsonb;
  v_correct        smallint := 0;
  v_total          smallint := 0;
  v_best_streak    smallint := 0;
  v_current_streak smallint := 0;
  v_score          integer;
  v_is_correct     boolean;
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

  if _attempt_id is null then
    raise exception 'attempt_id is required and must not be null';
  end if;

  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
  end if;

  if _mode not in ('solo', 'practice', 'pvp', 'multiplayer') then
    raise exception 'Invalid mode: %. Must be one of: solo, practice, pvp, multiplayer', _mode;
  end if;

  if _duration_ms is null or _duration_ms <= 0 then
    raise exception 'duration_ms must be > 0';
  end if;

  if _answers is null or jsonb_typeof(_answers) <> 'array' then
    raise exception 'answers must be a JSON array';
  end if;

  -- ---- Quiz existence + publish gate (RLS bypassed in SECURITY DEFINER) --
  select * into v_quiz
  from public.quizzes
  where id = _quiz_id;

  if not found then
    raise exception 'Quiz not found: %', _quiz_id;
  end if;

  if not v_quiz.is_published then
    raise exception 'Quiz is not published: %', _quiz_id;
  end if;

  -- ---- Parse answers into a temp map -------------------------------------
  create temp table _answer_map (
    question_id uuid primary key,
    skipped     boolean not null default false,
    value       jsonb
  ) on commit drop;

  for v_answer_elem in
    select value as elem
    from jsonb_array_elements(_answers) as value
  loop
    if v_answer_elem.elem->>'question_id' is null then
      raise exception 'Each answer entry must include question_id';
    end if;

    begin
      insert into _answer_map (question_id, skipped, value)
      values (
        (v_answer_elem.elem->>'question_id')::uuid,
        coalesce((v_answer_elem.elem->>'skipped')::boolean, false),
        v_answer_elem.elem->'value'
      );
    exception
      when invalid_text_representation then
        raise exception 'Invalid question_id: %', v_answer_elem.elem->>'question_id';
      when unique_violation then
        raise exception 'Duplicate question_id in answers payload: %', v_answer_elem.elem->>'question_id';
    end;
  end loop;

  -- Reject answers for questions outside this quiz.
  if exists (
    select 1
    from _answer_map am
    where not exists (
      select 1
      from public.quiz_questions qq
      where qq.id = am.question_id
        and qq.quiz_id = _quiz_id
    )
  ) then
    raise exception 'answers contain question_id not belonging to quiz %', _quiz_id;
  end if;

  -- ---- Grade gradable questions in quiz order ----------------------------
  for v_question in
    select
      qq.id,
      qq.type,
      qq.answer_id,
      qq.answer_ids,
      qq.answer_bool,
      qq.accepted
    from public.quiz_questions qq
    where qq.quiz_id = _quiz_id
      and qq.type in ('single', 'multiple', 'boolean', 'typed', 'image', 'map')
    order by qq.position
  loop
    v_total := v_total + 1;

    select am.skipped, am.value
    into v_sub_skipped, v_sub_value
    from _answer_map am
    where am.question_id = v_question.id;

    v_has_answer := found;

    v_is_correct := public.grade_quiz_answer(
      v_question.type,
      v_question.answer_id,
      v_question.answer_ids,
      v_question.answer_bool,
      v_question.accepted,
      v_sub_value,
      case when not v_has_answer then true else v_sub_skipped end
    );

    if v_is_correct then
      v_correct := v_correct + 1;
      v_current_streak := v_current_streak + 1;
      v_best_streak := greatest(v_best_streak, v_current_streak);
    else
      v_current_streak := 0;
    end if;
  end loop;

  if v_total <= 0 or v_total > 100 then
    raise exception 'Gradable question count must be between 1 and 100, got %', v_total;
  end if;

  if _duration_ms < v_total * 200 then
    raise exception
      'Submission rejected: duration_ms (%) is implausibly short for % gradable questions',
      _duration_ms, v_total;
  end if;

  -- Score mirrors client summarise(): correct * 100 + bestStreak * 25
  v_score := (v_correct::integer * 100) + (v_best_streak::integer * 25);

  -- ---- Lock user_progression ---------------------------------------------
  select * into v_prog
  from public.user_progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', v_uid;
  end if;

  -- ---- Idempotency check -------------------------------------------------
  select
    qa.xp_earned,
    qa.credits_earned,
    qa.score,
    qa.correct,
    qa.total,
    qa.best_streak
  into v_existing
  from public.quiz_attempts qa
  where qa.attempt_id = _attempt_id
    and qa.user_id = v_uid;

  if found then
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
      'correct',        v_existing.correct,
      'total',          v_existing.total,
      'score',          v_existing.score,
      'best_streak',    v_existing.best_streak,
      'duplicate',      true
    );
  end if;

  -- ---- Server-side reward calculation ------------------------------------
  v_xp_earned      := greatest(50, v_correct::integer * 25);
  v_credits_earned := 0;

  v_old_level   := v_prog.level;
  v_new_xp      := v_prog.xp + v_xp_earned;
  v_new_credits := v_prog.credits + v_credits_earned;
  v_new_total_q := v_prog.total_quizzes  + 1;
  v_new_total_c := v_prog.total_correct  + v_correct;
  v_new_total_a := v_prog.total_answered + v_total;

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

  insert into public.quiz_attempts (
    attempt_id, user_id, quiz_id, mode, score,
    correct, total, best_streak,
    xp_earned, credits_earned, duration_ms
  ) values (
    _attempt_id, v_uid, _quiz_id, _mode, v_score,
    v_correct, v_total, v_best_streak,
    v_xp_earned, v_credits_earned, _duration_ms
  );

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
    'correct',        v_correct,
    'total',          v_total,
    'score',          v_score,
    'best_streak',    v_best_streak,
    'duplicate',      false
  );
end;
$$;

comment on function public.submit_quiz_attempt(
  uuid, text, text, integer, jsonb
) is
  'Authoritative Solo quiz submission with server-side answer grading. '
  'Requires published quiz; grades single/multiple/boolean/typed/image/map; '
  'excludes order/dragdrop from total; preserves attempt_id idempotency. '
  'SECURITY DEFINER; user identity always from auth.uid().';

revoke all on function public.submit_quiz_attempt(
  uuid, text, text, integer, jsonb
) from public, anon;

grant execute on function public.submit_quiz_attempt(
  uuid, text, text, integer, jsonb
) to authenticated;

comment on column public.quiz_attempts.attempt_id is
  'Client-generated idempotency key. Generated with crypto.randomUUID() when '
  'a quiz session starts; stable for the entire session; reset only when a new '
  'quiz session begins. Used by submit_quiz_attempt() to detect and reject '
  'duplicate submissions without double-awarding XP or credits.';
