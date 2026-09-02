-- =============================================================================
-- GEOlibrary Option B — catalogue discovery metadata (staging-safe)
--
-- Exposes read-only catalogue metadata for ALL published library_resources
-- without weakening tier-aware RLS on full rows or library_resource_blocks.
--
-- Discovery metadata only: no blocks, attachments, gallery, or admin fields.
-- Article content remains gated by library_resources_select_published and
-- library_resource_blocks_select_published (library_user_can_access_resource).
-- =============================================================================

create or replace view public.library_catalogue_resources
with (security_invoker = false) as
select
  lr.id,
  lr.slug,
  lr.title,
  lr.dek,
  lr.resource_kind,
  lr.subject_category,
  lr.continent,
  lr.difficulty,
  lr.read_time_minutes,
  lr.language,
  lr.tags,
  lr.featured,
  lr.author_handle,
  lr.cover_art_key,
  lr.cover_label,
  lr.min_access_tier,
  lr.published_at,
  lr.status,
  lr.search_vector
from public.library_resources lr
where lr.status = 'published'::public.library_resource_status;

comment on view public.library_catalogue_resources is
  'Read-only GEOlibrary catalogue metadata for discovery. All published resources; excludes block/body content.';

revoke all on public.library_catalogue_resources from public;
grant select on public.library_catalogue_resources to anon, authenticated;
