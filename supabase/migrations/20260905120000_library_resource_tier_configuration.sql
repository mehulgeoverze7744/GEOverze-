-- =============================================================================
-- GEOlibrary — resource tier configuration
--
-- Sets min_access_tier on three published fixture articles only.
-- All other published resources remain NULL (free/open), including:
--   why-some-countries-have-two-capitals → NULL (explicitly preserved)
--
-- Safe to re-run: UPDATE guards use IS DISTINCT FROM target tier.
-- Does NOT modify content, RLS, functions, views, or engagement data.
-- =============================================================================

update public.library_resources
set min_access_tier = 'basic'
where slug = 'reading-a-flag-in-thirty-seconds'
  and status = 'published'::public.library_resource_status
  and min_access_tier is distinct from 'basic';

update public.library_resources
set min_access_tier = 'pro'
where slug = 'the-sahel-explained'
  and status = 'published'::public.library_resource_status
  and min_access_tier is distinct from 'pro';

update public.library_resources
set min_access_tier = 'advance'
where slug = 'megacities-and-the-limits-of-growth'
  and status = 'published'::public.library_resource_status
  and min_access_tier is distinct from 'advance';

-- =============================================================================
-- Verification
-- =============================================================================

do $$
declare
  c_null int;
  c_basic int;
  c_pro int;
  c_advance int;
begin
  select count(*) into c_null
  from public.library_resources
  where status = 'published'::public.library_resource_status
    and min_access_tier is null;

  select count(*) into c_basic
  from public.library_resources
  where status = 'published'::public.library_resource_status
    and min_access_tier = 'basic';

  select count(*) into c_pro
  from public.library_resources
  where status = 'published'::public.library_resource_status
    and min_access_tier = 'pro';

  select count(*) into c_advance
  from public.library_resources
  where status = 'published'::public.library_resource_status
    and min_access_tier = 'advance';

  if c_null <> 11 then
    raise exception 'library tier config: expected 11 NULL published resources, got %', c_null;
  end if;

  if c_basic <> 1 then
    raise exception 'library tier config: expected 1 basic published resource, got %', c_basic;
  end if;

  if c_pro <> 1 then
    raise exception 'library tier config: expected 1 pro published resource, got %', c_pro;
  end if;

  if c_advance <> 1 then
    raise exception 'library tier config: expected 1 advance published resource, got %', c_advance;
  end if;

  if not exists (
    select 1
    from public.library_resources
    where slug = 'reading-a-flag-in-thirty-seconds'
      and status = 'published'::public.library_resource_status
      and min_access_tier = 'basic'
  ) then
    raise exception 'library tier config: reading-a-flag-in-thirty-seconds must be basic';
  end if;

  if not exists (
    select 1
    from public.library_resources
    where slug = 'the-sahel-explained'
      and status = 'published'::public.library_resource_status
      and min_access_tier = 'pro'
  ) then
    raise exception 'library tier config: the-sahel-explained must be pro';
  end if;

  if not exists (
    select 1
    from public.library_resources
    where slug = 'megacities-and-the-limits-of-growth'
      and status = 'published'::public.library_resource_status
      and min_access_tier = 'advance'
  ) then
    raise exception 'library tier config: megacities-and-the-limits-of-growth must be advance';
  end if;

  if not exists (
    select 1
    from public.library_resources
    where slug = 'why-some-countries-have-two-capitals'
      and status = 'published'::public.library_resource_status
      and min_access_tier is null
  ) then
    raise exception 'library tier config: why-some-countries-have-two-capitals must remain NULL';
  end if;

  raise notice 'library tier config OK: null=%, basic=%, pro=%, advance=%', c_null, c_basic, c_pro, c_advance;
end $$;
