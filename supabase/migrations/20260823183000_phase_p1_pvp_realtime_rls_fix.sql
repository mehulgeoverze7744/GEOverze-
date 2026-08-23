-- =============================================================================
-- Phase P1 — PvP Realtime RLS Fix
--
-- Problem: pvp_participants_select_room_member used a self-referential EXISTS
-- subquery on pvp_participants. Normal SELECT worked, but Supabase Realtime
-- failed to deliver peer INSERT/UPDATE events under that policy evaluation.
--
-- Fix: Use the existing SECURITY DEFINER helper is_pvp_room_participant(),
-- matching the pvp_rooms SELECT policy pattern.
--
-- Scope: SELECT policy only. No schema, publication, or RPC changes.
-- Safe to re-run.
-- =============================================================================

drop policy if exists pvp_participants_select_room_member on public.pvp_participants;

create policy pvp_participants_select_room_member
  on public.pvp_participants
  for select
  to authenticated
  using (public.is_pvp_room_participant(room_id, auth.uid()));

comment on policy pvp_participants_select_room_member on public.pvp_participants is
  'Room members can read all participant rows in their PvP room. Uses '
  'is_pvp_room_participant() (SECURITY DEFINER) so Realtime can deliver peer '
  'INSERT/UPDATE events without self-referential RLS evaluation failures.';
