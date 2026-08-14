-- Phase 2A hardening pass — addresses Supabase security advisor findings
-- raised immediately after 20260814120000_phase2a_auth_foundation.sql:
--
--   1. public.set_updated_at had a mutable search_path.
--   2. Supabase's project-wide default privileges grant EXECUTE on new
--      functions directly to `anon` and `authenticated` (in addition to the
--      PUBLIC pseudo-role), so the earlier `revoke ... from public` did not
--      fully lock down public.handle_new_user / has_role / is_admin. This
--      revokes those directly-granted privileges and re-grants only what is
--      actually needed.
--
-- Safe to re-run.

-- Pin the search_path so this trigger function cannot be hijacked by a
-- session-level search_path change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user is only ever invoked by the on_auth_user_created trigger.
-- No client role should be able to call it directly via PostgREST RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- has_role / is_admin: anonymous (unauthenticated) callers have no use for
-- these and auth.uid() would be null for them anyway, but revoke explicitly
-- for defense in depth. authenticated keeps EXECUTE (needed by RLS policies
-- and by the admin app's role check).
revoke execute on function public.has_role(uuid, public.app_role) from anon;
revoke execute on function public.is_admin(uuid) from anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
