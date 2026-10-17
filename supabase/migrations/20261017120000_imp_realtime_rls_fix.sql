-- =============================================================================
-- Geography Imposter — Realtime RLS fix
--
-- Problem: imp_participants / imp_rooms / imp_clues / imp_chat SELECT policies
-- used self-referential subqueries on imp_participants. Normal RPC-backed
-- SELECT worked, but Supabase Realtime failed to deliver peer INSERT/UPDATE
-- events under that policy evaluation (same class of bug as
-- 20260823183000_phase_p1_pvp_realtime_rls_fix.sql).
--
-- Fix: Authorize Realtime with is_imp_participant() (SECURITY DEFINER) and
-- grant EXECUTE to authenticated so policy evaluation can see peer rows.
--
-- Scope: SELECT policies + EXECUTE grant. No gameplay, scoring, or schema
-- shape changes. Safe to re-run.
-- =============================================================================

grant execute on function public.is_imp_participant(uuid, uuid) to authenticated;

drop policy if exists "imp_rooms_select_participant" on public.imp_rooms;
create policy "imp_rooms_select_participant" on public.imp_rooms
  for select
  to authenticated
  using (public.is_imp_participant(id, auth.uid()));

drop policy if exists "imp_participants_select" on public.imp_participants;
create policy "imp_participants_select" on public.imp_participants
  for select
  to authenticated
  using (public.is_imp_participant(room_id, auth.uid()));

drop policy if exists "imp_clues_select" on public.imp_clues;
create policy "imp_clues_select" on public.imp_clues
  for select
  to authenticated
  using (public.is_imp_participant(room_id, auth.uid()));

drop policy if exists "imp_chat_select" on public.imp_chat;
create policy "imp_chat_select" on public.imp_chat
  for select
  to authenticated
  using (public.is_imp_participant(room_id, auth.uid()));

comment on policy "imp_participants_select" on public.imp_participants is
  'Room members can read participant rows. Uses is_imp_participant() '
  '(SECURITY DEFINER) so Realtime can deliver peer INSERT/UPDATE events.';
