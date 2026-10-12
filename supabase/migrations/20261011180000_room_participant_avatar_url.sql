-- Include both profile avatar fields in room payloads so opponents can
-- render uploaded photos and custom 3D/preset avatars. SECURITY DEFINER
-- builders already join profiles; this does not change RLS or room logic.

CREATE OR REPLACE FUNCTION public.build_pvp_room_state(_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid(); v_room public.pvp_rooms%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_pvp_room_participant(_room_id, v_uid) then raise exception 'Not a participant in this room'; end if;
  select * into v_room from public.pvp_rooms where id = _room_id;
  if not found then raise exception 'Room not found'; end if;
  if v_room.room_mode <> 'pvp'::public.room_mode then raise exception 'Not a PvP room'; end if;
  return jsonb_build_object(
    'room', jsonb_build_object('id', v_room.id, 'room_code', v_room.room_code, 'host_user_id', v_room.host_user_id, 'quiz_id', v_room.quiz_id, 'status', v_room.status, 'max_players', v_room.max_players, 'created_at', v_room.created_at, 'started_at', v_room.started_at, 'completed_at', v_room.completed_at, 'winner_user_id', v_room.winner_user_id, 'is_draw', v_room.status = 'completed' and v_room.winner_user_id is null, 'rewards_settled_at', v_room.rewards_settled_at),
    'participants', coalesce((select jsonb_agg(jsonb_build_object('id', pp.id, 'user_id', pp.user_id, 'is_ready', pp.is_ready, 'joined_at', pp.joined_at, 'ready_at', pp.ready_at, 'is_host', pp.user_id = v_room.host_user_id, 'username', coalesce(p.username, p.display_name, 'player'), 'display_name', coalesce(p.display_name, p.username, 'Player'), 'avatar_id', p.avatar_id, 'avatar_url', p.avatar_url, 'level', coalesce(up.level, 1), 'submitted_at', pp.submitted_at, 'correct', case when pp.user_id = v_uid or v_room.status = 'completed' then pp.correct else null end, 'total', case when pp.user_id = v_uid or v_room.status = 'completed' then pp.total else null end, 'score', case when pp.user_id = v_uid or v_room.status = 'completed' then pp.score else null end, 'best_streak', case when pp.user_id = v_uid or v_room.status = 'completed' then pp.best_streak else null end, 'xp_earned', case when v_room.rewards_settled_at is not null then pp.xp_earned else null end, 'credits_earned', case when v_room.rewards_settled_at is not null then pp.credits_earned else null end) order by pp.joined_at) from public.pvp_participants pp left join public.profiles p on p.id = pp.user_id left join public.user_progression up on up.user_id = pp.user_id where pp.room_id = _room_id), '[]'::jsonb)
  );
end; $function$;

CREATE OR REPLACE FUNCTION public.build_multiplayer_room_state(_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_room public.pvp_rooms%rowtype;
  v_results_public boolean;
  v_rewards_public boolean;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_pvp_room_participant(_room_id, v_uid) then raise exception 'Not a participant in this room'; end if;
  select * into v_room from public.pvp_rooms where id = _room_id;
  if not found then raise exception 'Room not found'; end if;
  if v_room.room_mode <> 'multiplayer'::public.room_mode then raise exception 'Not a multiplayer room'; end if;
  if v_room.status = 'completed' and v_room.rankings_finalized_at is null then
    perform public.complete_multiplayer_match_if_ready(_room_id);
    select * into v_room from public.pvp_rooms where id = _room_id;
  end if;
  if v_room.status = 'completed' and v_room.rankings_finalized_at is not null and v_room.rewards_settled_at is null then
    perform public.complete_multiplayer_match_if_ready(_room_id);
    select * into v_room from public.pvp_rooms where id = _room_id;
  end if;
  v_results_public := v_room.status = 'completed' and v_room.rankings_finalized_at is not null;
  v_rewards_public := v_room.status = 'completed' and v_room.rewards_settled_at is not null;
  return jsonb_build_object(
    'room', jsonb_build_object(
      'id', v_room.id, 'room_code', v_room.room_code, 'host_user_id', v_room.host_user_id,
      'quiz_id', v_room.quiz_id, 'status', v_room.status, 'room_mode', v_room.room_mode,
      'min_players', v_room.min_players, 'max_players', v_room.max_players,
      'active_player_count', v_room.active_player_count, 'created_at', v_room.created_at,
      'started_at', v_room.started_at, 'completed_at', v_room.completed_at,
      'rankings_finalized_at', v_room.rankings_finalized_at, 'rewards_settled_at', v_room.rewards_settled_at
    ),
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', pp.id, 'user_id', pp.user_id, 'is_ready', pp.is_ready, 'joined_at', pp.joined_at,
          'ready_at', pp.ready_at, 'is_host', pp.user_id = v_room.host_user_id,
          'username', coalesce(p.username, p.display_name, 'player'),
          'display_name', coalesce(p.display_name, p.username, 'Player'),
          'avatar_id', p.avatar_id, 'avatar_url', p.avatar_url, 'level', coalesce(up.level, 1), 'submitted_at', pp.submitted_at,
          'correct', case when pp.user_id = v_uid or v_results_public then pp.correct else null end,
          'total', case when pp.user_id = v_uid or v_results_public then pp.total else null end,
          'score', case when pp.user_id = v_uid or v_results_public then pp.score else null end,
          'best_streak', case when pp.user_id = v_uid or v_results_public then pp.best_streak else null end,
          'finish_rank', case when v_results_public then pp.finish_rank else null end,
          'xp_earned', case when v_rewards_public then pp.xp_earned else null end,
          'credits_earned', case when v_rewards_public then pp.credits_earned else null end
        )
        order by case when v_results_public then pp.finish_rank end asc nulls last, pp.joined_at
      )
      from public.pvp_participants pp
      left join public.profiles p on p.id = pp.user_id
      left join public.user_progression up on up.user_id = pp.user_id
      where pp.room_id = _room_id
    ), '[]'::jsonb)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.build_draw_room_state(_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_turn public.draw_turns%rowtype;
  v_turn_json jsonb := null;
  v_is_drawer boolean := false;
  v_word_text text;
  v_options jsonb;
  v_correct_ids jsonb;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_draw_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  select * into v_turn from public.draw_turns
  where room_id = _room_id
  order by turn_number desc
  limit 1;

  if found then
    v_is_drawer := (v_turn.drawer_user_id = v_uid);

    select coalesce(jsonb_agg(user_id), '[]'::jsonb) into v_correct_ids
    from public.draw_turn_guesses
    where turn_id = v_turn.id and correct;

    if v_turn.secret_word_id is not null then
      select word into v_word_text from public.draw_words where id = v_turn.secret_word_id;
    end if;

    v_options := null;
    if v_is_drawer and v_turn.status = 'choosing' then
      select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'word', w.word) order by t.ord), '[]'::jsonb)
      into v_options
      from unnest(v_turn.word_option_ids) with ordinality as t(id, ord)
      join public.draw_words w on w.id = t.id;
    end if;

    v_turn_json := jsonb_build_object(
      'id', v_turn.id,
      'round_number', v_turn.round_number,
      'turn_number', v_turn.turn_number,
      'drawer_user_id', v_turn.drawer_user_id,
      'status', v_turn.status,
      'choose_deadline', v_turn.choose_deadline,
      'turn_started_at', v_turn.turn_started_at,
      'turn_ends_at', v_turn.turn_ends_at,
      'word_length', case when v_word_text is not null then length(v_word_text) else null end,
      'hint', case
        when v_word_text is not null
        then public.draw_mask_word(v_word_text, v_turn.id, v_turn.hint_revealed_count)
        else null
      end,
      'correct_user_ids', v_correct_ids,
      'word_options', v_options,
      'secret_word', case when v_is_drawer then v_word_text else null end
    );
  end if;

  return jsonb_build_object(
    'server_time', now(),
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_code', v_room.room_code,
      'host_user_id', v_room.host_user_id,
      'status', v_room.status,
      'rounds', v_room.rounds,
      'max_players', v_room.max_players,
      'categories', v_room.categories,
      'difficulty', v_room.difficulty,
      'turn_seconds', v_room.turn_seconds,
      'current_round', v_room.current_round,
      'created_at', v_room.created_at,
      'started_at', v_room.started_at,
      'completed_at', v_room.completed_at
    ),
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', dp.user_id,
        'username', coalesce(p.username, 'player'),
        'display_name', coalesce(p.display_name, p.username, 'Player'),
        'avatar_id', p.avatar_id,
        'avatar_url', p.avatar_url,
        'is_host', dp.user_id = v_room.host_user_id,
        'is_ready', dp.is_ready,
        'joined_at', dp.joined_at,
        'total_score', dp.total_score,
        'correct_count', dp.correct_count,
        'turns_drawn', dp.turns_drawn,
        'left_game', dp.left_game,
        'connected', dp.last_seen_at > now() - interval '20 seconds'
      ) order by dp.joined_at)
      from public.draw_participants dp
      left join public.profiles p on p.id = dp.user_id
      where dp.room_id = _room_id
    ), '[]'::jsonb),
    'current_turn', v_turn_json,
    'total_turns', v_room.rounds * (
      select count(*) from public.draw_participants where room_id = _room_id
    ),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'type', e.type, 'user_id', e.user_id,
        'body', e.body, 'payload', e.payload, 'created_at', e.created_at
      ) order by e.id asc)
      from (
        select * from public.draw_events where room_id = _room_id order by id desc limit 80
      ) e
    ), '[]'::jsonb)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.build_imp_room_state(_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid           uuid := auth.uid();
  v_room          public.imp_rooms%rowtype;
  v_participants  jsonb;
  v_clues         jsonb;
  v_chat          jsonb;
  v_private_info  jsonb := null;
  v_vote_status   jsonb := null;
  v_reveal        jsonb := null;
  v_my_role       public.imp_player_role;
  v_my_word       text;
  v_clues_count   int;
  v_voted_count   int;
  v_eligible_count int;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_room from public.imp_rooms where id = _room_id;
  if not found then raise exception 'Room not found'; end if;

  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'user_id',     p.user_id,
      'is_host',     p.is_host,
      'is_ready',    p.is_ready,
      'is_excluded', p.is_excluded,
      'last_seen_at',p.last_seen_at,
      'joined_at',   p.joined_at,
      'display_name',pr.display_name,
      'avatar_id',   pr.avatar_id,
      'avatar_url',  pr.avatar_url
    ) order by p.joined_at
  )
  into v_participants
  from public.imp_participants p
  join public.profiles pr on pr.id = p.user_id
  where p.room_id = _room_id;

  select jsonb_agg(
    jsonb_build_object(
      'id',           c.id,
      'user_id',      c.user_id,
      'round_number', c.round_number,
      'clue_text',    c.clue_text,
      'skipped',      c.skipped,
      'submitted_at', c.submitted_at
    ) order by c.round_number, c.submitted_at
  )
  into v_clues
  from public.imp_clues c
  where c.room_id = _room_id;

  select jsonb_agg(msg order by msg->>'created_at')
  into v_chat
  from (
    select jsonb_build_object(
      'id',         ch.id,
      'user_id',    ch.user_id,
      'body',       ch.body,
      'created_at', ch.created_at
    ) as msg
    from public.imp_chat ch
    where ch.room_id = _room_id
    order by ch.created_at desc
    limit 80
  ) sub;

  if v_room.status in ('playing', 'completed') then
    select r.role, r.received_word
    into v_my_role, v_my_word
    from public.imp_roles r
    where r.room_id = _room_id and r.user_id = v_uid;

    if found then
      v_private_info := jsonb_build_object(
        'role', v_my_role,
        'received_word', v_my_word
      );
    end if;
  end if;

  if v_room.phase in ('voting', 'finalizing', 'reveal') or v_room.status = 'completed' then
    select count(*) into v_voted_count from public.imp_votes where room_id = _room_id;
    select count(*) into v_eligible_count
    from public.imp_participants
    where room_id = _room_id and is_excluded = false;

    if v_room.phase = 'reveal' or v_room.status = 'completed' then
      v_vote_status := (
        select jsonb_build_object(
          'voted_count',    v_voted_count,
          'eligible_count', v_eligible_count,
          'distribution', coalesce((
            select jsonb_object_agg(target_user_id::text, vote_count)
            from (
              select target_user_id, count(*) as vote_count
              from public.imp_votes where room_id = _room_id
              group by target_user_id
            ) vd
          ), '{}'::jsonb),
          'you_voted_for', (
            select target_user_id from public.imp_votes
            where room_id = _room_id and voter_user_id = v_uid
          )
        )
      );
    else
      v_vote_status := jsonb_build_object(
        'voted_count',    v_voted_count,
        'eligible_count', v_eligible_count,
        'you_have_voted', exists(
          select 1 from public.imp_votes
          where room_id = _room_id and voter_user_id = v_uid
        )
      );
    end if;
  end if;

  if v_room.phase = 'reveal' or v_room.status = 'completed' then
    v_reveal := jsonb_build_object(
      'imposter_user_id',    v_room.revealed_imposter_id,
      'actual_word',         v_room.revealed_actual_word,
      'imposter_word',       v_room.revealed_imposter_word,
      'imposter_caught',     v_room.imposter_caught,
      'scores', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'user_id',         s.user_id,
            'role',            s.role,
            'clues_submitted', s.clues_submitted,
            'vote_target_id',  s.vote_target_id,
            'vote_correct',    s.vote_correct,
            'points_for_vote', s.points_for_vote,
            'imposter_escaped',s.imposter_escaped,
            'escape_bonus',    s.escape_bonus,
            'total_points',    s.total_points
          ) order by s.total_points desc
        )
        from public.imp_scores s where s.room_id = _room_id
      ), '[]'::jsonb)
    );
  end if;

  return jsonb_build_object(
    'server_time',       now(),
    'room', jsonb_build_object(
      'id',                 v_room.id,
      'room_code',          v_room.room_code,
      'host_user_id',       v_room.host_user_id,
      'status',             v_room.status,
      'phase',              v_room.phase,
      'current_round',      v_room.current_round,
      'current_clue_index', v_room.current_clue_index,
      'phase_deadline',     v_room.phase_deadline,
      'imposter_caught',    v_room.imposter_caught,
      'max_players',        v_room.max_players,
      'category',           v_room.category,
      'difficulty',         v_room.difficulty,
      'clue_turn_seconds',  v_room.clue_turn_seconds,
      'clue_order_1',       v_room.clue_order_1,
      'clue_order_2',       v_room.clue_order_2,
      'clue_order_3',       v_room.clue_order_3,
      'created_at',         v_room.created_at,
      'started_at',         v_room.started_at,
      'completed_at',       v_room.completed_at
    ),
    'participants',   coalesce(v_participants, '[]'::jsonb),
    'clues',          coalesce(v_clues, '[]'::jsonb),
    'chat',           coalesce(v_chat, '[]'::jsonb),
    'private_info',   v_private_info,
    'vote_status',    v_vote_status,
    'reveal',         v_reveal
  );
end;
$function$;
