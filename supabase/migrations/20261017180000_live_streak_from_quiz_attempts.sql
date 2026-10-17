-- =============================================================================
-- Live streaks from qualifying quiz_attempts
--
-- quiz_attempts.completed_at is the only source of streak days. Cached columns
-- on user_progression are rebuilt from that history (plus today's completion
-- when apply_user_progression_rewards runs before the attempt row exists).
-- Calendar days use Asia/Kolkata, matching the app reward-cycle timezone.
-- =============================================================================

create or replace function public.app_calendar_timezone()
returns text
language sql
immutable
as $$
  select 'Asia/Kolkata'::text;
$$;

create or replace function public.app_calendar_date(_ts timestamptz default now())
returns date
language sql
stable
as $$
  select (timezone(public.app_calendar_timezone(), _ts))::date;
$$;

create or replace function public.compute_streak_stats(
  _dates date[],
  _today date
)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_dates     date[];
  v_last      date;
  v_current   integer := 0;
  v_longest   integer := 0;
  v_run       integer := 0;
  v_prev      date;
  v_d         date;
  v_week_start date;
  v_week_done boolean[] := array[false, false, false, false, false, false, false];
  v_days_week integer := 0;
  i           integer;
begin
  select coalesce(array_agg(d order by d), '{}')
  into v_dates
  from (
    select distinct d
    from unnest(coalesce(_dates, '{}')) as d
    where d is not null
  ) q;

  if array_length(v_dates, 1) is null then
    return jsonb_build_object(
      'current', 0,
      'longest', 0,
      'last_active_date', null,
      'weekly_goal', 5,
      'days_this_week', 0,
      'week_done', to_jsonb(v_week_done)
    );
  end if;

  v_prev := null;
  foreach v_d in array v_dates
  loop
    if v_prev is not null and v_d = v_prev + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_longest then
      v_longest := v_run;
    end if;
    v_prev := v_d;
  end loop;

  v_last := v_dates[array_length(v_dates, 1)];
  if v_last = _today or v_last = _today - 1 then
    v_current := 1;
    v_d := v_last - 1;
    for i in reverse array_length(v_dates, 1) - 1 .. 1
    loop
      exit when v_dates[i] <> v_d;
      v_current := v_current + 1;
      v_d := v_d - 1;
    end loop;
  end if;

  v_week_start := _today - ((extract(isodow from _today)::integer) - 1);
  for i in 0..6
  loop
    if v_dates && array[v_week_start + i] then
      v_week_done[i + 1] := true;
      v_days_week := v_days_week + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'current', v_current,
    'longest', v_longest,
    'last_active_date', v_last,
    'weekly_goal', 5,
    'days_this_week', v_days_week,
    'week_done', to_jsonb(v_week_done)
  );
end;
$$;

create or replace function public.qualifying_completion_dates(_user_id uuid)
returns date[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(d order by d), '{}')
  from (
    select distinct public.app_calendar_date(qa.completed_at) as d
    from public.quiz_attempts qa
    where qa.user_id = _user_id
      and qa.total > 0
  ) days;
$$;

create or replace function public.streak_stats_for_user(
  _user_id uuid,
  _extra_dates date[] default '{}'
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.compute_streak_stats(
    public.qualifying_completion_dates(_user_id) || coalesce(_extra_dates, '{}'),
    public.app_calendar_date()
  );
$$;

create or replace function public.get_my_streak_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required';
  end if;
  return public.streak_stats_for_user(v_uid);
end;
$$;

comment on function public.get_my_streak_stats() is
  'Current streak, personal best, and weekly activity from the caller''s quiz_attempts.';

revoke all on function public.app_calendar_timezone() from public, anon;
revoke all on function public.app_calendar_date(timestamptz) from public, anon;
revoke all on function public.compute_streak_stats(date[], date) from public, anon, authenticated;
revoke all on function public.qualifying_completion_dates(uuid) from public, anon, authenticated;
revoke all on function public.streak_stats_for_user(uuid, date[]) from public, anon, authenticated;

grant execute on function public.get_my_streak_stats() to authenticated;

-- Rebuild cached streak columns from attempt history + today's completion.
create or replace function public.apply_user_progression_rewards(
  _user_id                  uuid,
  _correct                  smallint,
  _total                    smallint,
  _xp_earned                integer,
  _credits_earned           integer,
  _month_key                date,
  _ledger_idempotency_key   text        default null,
  _ledger_entry_type        text        default null,
  _ledger_reference_type    text        default null,
  _ledger_reference_id      uuid        default null,
  _earned_at                timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prog                public.user_progression%rowtype;
  v_new_xp              integer;
  v_new_level           smallint;
  v_old_level           smallint;
  v_new_credits         integer;
  v_new_total_q         integer;
  v_new_total_c         integer;
  v_new_total_a         integer;
  v_streak              jsonb;
  v_new_streak          smallint;
  v_new_longest         smallint;
  v_today               date := public.app_calendar_date();
  v_earned_at           timestamptz;
  v_idempotency_key     text;
  v_entry_type          text;
begin
  select * into v_prog
  from public.user_progression
  where user_id = _user_id
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', _user_id;
  end if;

  v_old_level := v_prog.level;
  v_new_xp := v_prog.xp + _xp_earned;

  v_new_total_q := v_prog.total_quizzes + 1;
  v_new_total_c := v_prog.total_correct + _correct;
  v_new_total_a := v_prog.total_answered + _total;
  v_new_level := public.level_from_xp(v_new_xp);

  -- Include today so streak is correct even when quiz_attempts is inserted after this call.
  v_streak := public.streak_stats_for_user(_user_id, array[v_today]);
  v_new_streak := greatest(1, coalesce((v_streak->>'current')::integer, 1));
  v_new_longest := greatest(
    coalesce((v_streak->>'longest')::integer, 0),
    v_new_streak
  );

  if _credits_earned > 0 then
    v_earned_at := coalesce(_earned_at, now());
    v_idempotency_key := coalesce(
      _ledger_idempotency_key,
      'earn:tx:' || _user_id::text || ':' || txid_current()::text
    );
    v_entry_type := coalesce(_ledger_entry_type, 'earn_gameplay');

    perform public.append_credit_ledger_entry(
      _user_id,
      _credits_earned,
      v_entry_type,
      v_idempotency_key,
      _ledger_reference_type,
      _ledger_reference_id,
      _month_key,
      jsonb_build_object('source', 'apply_user_progression_rewards'),
      v_earned_at,
      null
    );
  end if;

  select credits into v_new_credits
  from public.user_progression
  where user_id = _user_id;

  update public.user_progression
  set
    xp                = v_new_xp,
    level             = v_new_level,
    credits           = v_new_credits,
    credits_month_key = _month_key,
    total_quizzes     = v_new_total_q,
    total_correct     = v_new_total_c,
    total_answered    = v_new_total_a,
    current_streak    = v_new_streak,
    longest_streak    = v_new_longest,
    last_played_date  = v_today
  where user_id = _user_id;

  return jsonb_build_object(
    'xp_earned',      _xp_earned,
    'credits_earned', _credits_earned,
    'new_xp',         v_new_xp,
    'new_level',      v_new_level::integer,
    'level_up',       v_new_level > v_old_level,
    'new_streak',     v_new_streak::integer,
    'new_credits',    v_new_credits,
    'total_quizzes',  v_new_total_q,
    'total_correct',  v_new_total_c,
    'total_answered', v_new_total_a
  );
end;
$$;

comment on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) is
  'Shared progression update. Streaks rebuild from quiz_attempts; credits stay ledger-controlled.';

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) from public, anon, authenticated;

-- Reconcile cached streak counters from existing attempt history (no XP/credit writes).
update public.user_progression up
set
  current_streak = coalesce((stats.payload->>'current')::smallint, 0),
  longest_streak = coalesce((stats.payload->>'longest')::smallint, 0),
  last_played_date = nullif(stats.payload->>'last_active_date', '')::date
from (
  select
    user_id,
    public.streak_stats_for_user(user_id) as payload
  from public.user_progression
) stats
where stats.user_id = up.user_id;
