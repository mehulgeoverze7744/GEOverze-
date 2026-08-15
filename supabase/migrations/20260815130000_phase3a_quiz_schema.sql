-- =============================================================================
-- Phase 3A — Step 1: Quiz Content Schema
--
-- Creates the authoritative database representation of quiz content:
--   - public.question_type  (enum: all 8 question formats)
--   - public.quizzes        (one row per quiz set)
--   - public.quiz_questions (one row per question, FK → quizzes)
--
-- Intentionally NOT done in this migration (see inline notes):
--   A. No quiz data is seeded here.
--      Seeding happens in Phase 3A Step 2, after schema validation.
--
--   B. The FK from quiz_attempts.quiz_id → quizzes.id is NOT added here.
--      Reason: quiz_attempts already contains rows whose quiz_id values
--      (e.g. "q-flag-blitz") reference quizzes that do not yet exist in
--      the quizzes table. Adding the FK now would immediately break all
--      existing Phase 2C records. The FK will be added in Phase 3A Step 2,
--      after the five seed quizzes are inserted and verified.
--
--   C. No Phase 2A/2B/2C tables, functions, triggers, or RLS policies are
--      modified. This migration only adds new objects.
--
-- Role / RLS model:
--   - anon + authenticated: SELECT published quizzes and their questions only.
--   - creator role:         INSERT and UPDATE any quiz/question (studio model;
--                           ownership-based isolation can be added later when a
--                           creator_id uuid column is introduced).
--   - admin/super_admin:    Full SELECT (including unpublished), INSERT, UPDATE,
--                           DELETE on both tables.
--   - No authenticated user can INSERT/UPDATE/DELETE merely by being signed in —
--     the creator or admin role is always required for mutations.
--
-- Safe to re-run: all DDL statements use IF NOT EXISTS / OR REPLACE /
-- DO $$ IF NOT EXISTS $$ guards or DROP ... IF EXISTS before re-creation.
-- =============================================================================


-- =============================================================================
-- 1. question_type ENUM
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'question_type') then
    create type public.question_type as enum (
      'single',    -- Single-choice: one correct option from a list
      'multiple',  -- Multiple-choice: one or more correct options
      'boolean',   -- True / False
      'image',     -- Image-selection tiles
      'map',       -- Click a region on a stylised map board
      'typed',     -- Free-text answer matched against accepted strings
      'order',     -- Arrange items in sequence (renderer: placeholder)
      'dragdrop'   -- Drag items to matching targets (renderer: placeholder)
    );
  end if;
end
$$;


-- =============================================================================
-- 2. public.quizzes
-- =============================================================================

create table if not exists public.quizzes (
  id             text        primary key,
  title          text        not null,
  description    text,
  category_id    text        not null,
  creator        text        not null,
  art            text        not null,
  difficulty     text        not null
    constraint quizzes_difficulty_allowed
      check (difficulty in ('Easy', 'Medium', 'Hard', 'Expert')),
  minutes        integer     not null default 5,
  language       text        not null default 'English',
  reward_xp      integer     not null default 100
    constraint quizzes_reward_xp_non_negative      check (reward_xp >= 0),
  reward_credits integer     not null default 25
    constraint quizzes_reward_credits_non_negative check (reward_credits >= 0),
  is_published   boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.quizzes is
  'One row per quiz set. Authoritative source for quiz metadata and rewards. '
  'Questions are stored separately in quiz_questions. '
  'Only published rows are visible to public clients.';

comment on column public.quizzes.id is
  'Human-readable slug: e.g. "q-flag-blitz". Preserved from the static '
  'quizSets.ts catalog so existing quiz_attempts rows remain valid once the '
  'FK is added in Phase 3A Step 2.';

comment on column public.quizzes.is_published is
  'Controls public visibility. False = draft; only creator/admin roles can see '
  'unpublished quizzes. Flip to true only after questions are verified.';

comment on column public.quizzes.reward_xp is
  'Base XP for completing this quiz. Used as per-quiz reward config in '
  'Phase 3A+. In Phase 2C, the RPC used a global formula (GREATEST(50, '
  'correct*25)); per-quiz rewards are wired in Phase 3A Step 3.';

-- Reuse the existing set_updated_at() trigger function created in Phase 2A.
drop trigger if exists quizzes_set_updated_at on public.quizzes;
create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row
  execute function public.set_updated_at();


-- =============================================================================
-- 3. public.quiz_questions
-- =============================================================================

create table if not exists public.quiz_questions (
  id          uuid                  primary key default gen_random_uuid(),
  quiz_id     text                  not null
    references public.quizzes (id) on delete cascade,
  position    smallint              not null
    constraint quiz_questions_position_min check (position >= 1),
  type        public.question_type  not null,
  prompt      text                  not null,
  explanation text,

  -- Optional media attachment: serialised QuestionMedia from types.ts.
  -- Shape: { kind: "flag"|"image"|"illustration"|"map"|"audio"|"video",
  --          art?: string, glyph?: string, caption?: string }
  media       jsonb,

  -- ---- Type-specific answer fields ----------------------------------------
  -- Only the columns relevant to a question's type will be populated.
  -- Application code and the frontend TypeScript types are the validation layer;
  -- database-level nullability is intentionally permissive to avoid complex
  -- trigger logic for each type permutation.

  -- single | multiple | image: Choice[]
  -- Shape: [{ id: string, label: string, art?: string, glyph?: string, hint?: string }]
  options     jsonb,

  -- single | image | map: the correct choice/region id
  answer_id   text,

  -- multiple: array of correct choice ids
  answer_ids  text[],

  -- boolean: the correct boolean answer
  answer_bool boolean,

  -- map: MapRegion[] — [{ id, label, x: number, y: number }]
  regions     jsonb,

  -- map: cover-art seed key for the board background image
  board_art   text,

  -- typed: normalised accepted answer strings (all lowercase, trimmed)
  accepted    text[],

  -- typed: placeholder text shown in the input field
  placeholder text,

  -- order | dragdrop: the items to arrange or drag
  items       text[],

  -- dragdrop: the target labels that items are matched to
  targets     text[],

  -- Each quiz's questions are numbered 1-N. Enforced per-quiz by UNIQUE.
  constraint quiz_questions_quiz_position_unique unique (quiz_id, position)
);

comment on table public.quiz_questions is
  'One row per question. Ordered by position within a quiz. '
  'The type column determines which answer columns are populated; '
  'all other answer columns for a given type are null. '
  'Cascades on quiz delete so no orphaned question rows can exist.';

comment on column public.quiz_questions.position is
  '1-based question order within the quiz. The UNIQUE (quiz_id, position) '
  'constraint prevents gaps or duplicates within a set.';

comment on column public.quiz_questions.type is
  'Discriminant for the question renderer. "order" and "dragdrop" are defined '
  'but have placeholder renderers in Phase 3A — PLACEHOLDER_TYPES in types.ts.';


-- =============================================================================
-- 4. INDEXES
-- =============================================================================

-- Hub browsing by category (QuizCard rail, SearchPage, CategoryCard).
create index if not exists quizzes_category_idx
  on public.quizzes (category_id);

-- Fast published-quiz listing for the public hub and discovery rails.
-- Partial index: only indexes rows where is_published is true, making it
-- lightweight and automatically excluded for draft-only admin queries.
create index if not exists quizzes_published_idx
  on public.quizzes (is_published)
  where is_published = true;

-- Primary read pattern: fetch all questions for a quiz in order.
-- Composite covers both the equality filter on quiz_id and the ORDER BY position.
create index if not exists quiz_questions_quiz_id_idx
  on public.quiz_questions (quiz_id, position);


-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================

alter table public.quizzes       enable row level security;
alter table public.quiz_questions enable row level security;

-- ---- Table-level privilege grants ------------------------------------------
--
-- Pattern matches Phase 2A/2C: revoke all first, then grant only what
-- each role class actually needs. RLS policies layer on top.
--
-- quizzes: anon users (unauthenticated hub browsers) need SELECT so the
-- discovery page can display published quizzes before sign-in.
-- quiz_questions: same — questions must be readable for the play engine
-- even before a user has an account (practice / guest preview).
--
-- No INSERT/UPDATE/DELETE is granted to anon or the base authenticated role.
-- Mutations require creator or admin, enforced by the policies below.

revoke all on public.quizzes       from anon, authenticated;
revoke all on public.quiz_questions from anon, authenticated;

grant select on public.quizzes        to anon, authenticated;
grant select on public.quiz_questions to anon, authenticated;

-- Creators and admins need the ability to write rows. Table-level INSERT/UPDATE/
-- DELETE is granted to authenticated; the RLS policies below restrict it further
-- to only users who hold the creator or admin role.
grant insert, update, delete on public.quizzes        to authenticated;
grant insert, update, delete on public.quiz_questions to authenticated;


-- ---- public.quizzes policies -----------------------------------------------

-- Any visitor (signed-in or not) can read published quizzes.
drop policy if exists quizzes_select_published on public.quizzes;
create policy quizzes_select_published
  on public.quizzes
  for select
  to anon, authenticated
  using (is_published = true);

-- Admins can read all quizzes, including unpublished drafts.
drop policy if exists quizzes_select_admin on public.quizzes;
create policy quizzes_select_admin
  on public.quizzes
  for select
  to authenticated
  using (public.is_admin());

-- Creators and admins can publish and edit quiz metadata.
-- Using the same creator/admin dual-check pattern as user_roles write policies.
drop policy if exists quizzes_insert_creator_admin on public.quizzes;
create policy quizzes_insert_creator_admin
  on public.quizzes
  for insert
  to authenticated
  with check (
    public.has_role(auth.uid(), 'creator')
    or public.is_admin()
  );

drop policy if exists quizzes_update_creator_admin on public.quizzes;
create policy quizzes_update_creator_admin
  on public.quizzes
  for update
  to authenticated
  using (
    public.has_role(auth.uid(), 'creator')
    or public.is_admin()
  )
  with check (
    public.has_role(auth.uid(), 'creator')
    or public.is_admin()
  );

-- DELETE is restricted to admin only. Creators can deprecate quizzes by
-- setting is_published = false; permanent deletion requires admin authority
-- to protect referential integrity with quiz_attempts history.
drop policy if exists quizzes_delete_admin on public.quizzes;
create policy quizzes_delete_admin
  on public.quizzes
  for delete
  to authenticated
  using (public.is_admin());


-- ---- public.quiz_questions policies ----------------------------------------

-- Questions belonging to a published quiz are publicly readable.
-- The correlated EXISTS check on the parent quiz is evaluated server-side
-- and uses the partial index on quizzes(is_published) for efficiency.
drop policy if exists quiz_questions_select_published on public.quiz_questions;
create policy quiz_questions_select_published
  on public.quiz_questions
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id
        and q.is_published = true
    )
  );

-- Admins can read all questions regardless of publish state (needed for the
-- admin editor to preview draft quizzes before publishing).
drop policy if exists quiz_questions_select_admin on public.quiz_questions;
create policy quiz_questions_select_admin
  on public.quiz_questions
  for select
  to authenticated
  using (public.is_admin());

-- Creators and admins can add questions to any quiz.
drop policy if exists quiz_questions_insert_creator_admin on public.quiz_questions;
create policy quiz_questions_insert_creator_admin
  on public.quiz_questions
  for insert
  to authenticated
  with check (
    public.has_role(auth.uid(), 'creator')
    or public.is_admin()
  );

-- Creators and admins can edit existing questions.
drop policy if exists quiz_questions_update_creator_admin on public.quiz_questions;
create policy quiz_questions_update_creator_admin
  on public.quiz_questions
  for update
  to authenticated
  using (
    public.has_role(auth.uid(), 'creator')
    or public.is_admin()
  )
  with check (
    public.has_role(auth.uid(), 'creator')
    or public.is_admin()
  );

-- DELETE mirrors the quizzes pattern: admin only.
-- Individual question deletion is a destructive editorial act; it also affects
-- any future question-level analytics that reference question ids.
drop policy if exists quiz_questions_delete_admin on public.quiz_questions;
create policy quiz_questions_delete_admin
  on public.quiz_questions
  for delete
  to authenticated
  using (public.is_admin());


-- =============================================================================
-- NOTE: quiz_attempts → quizzes FOREIGN KEY intentionally omitted
-- =============================================================================
--
-- quiz_attempts.quiz_id is currently an unconstrained text column. It already
-- contains rows referencing "q-flag-blitz", "q-atlas-sprint", "q-capital-cities",
-- "q-pin-the-place", and "q-monuments" — all of which map to Phase 2C live data.
--
-- Adding the FK here would fail immediately because the quizzes table is empty.
-- Adding it after seeding (but before verifying the seeds are complete) risks
-- leaving valid attempts rows orphaned if any seed is missing.
--
-- Safe sequence (Phase 3A Step 2):
--   1. Seed all five quizzes with their exact IDs.
--   2. Verify every distinct quiz_id in quiz_attempts has a matching quizzes row.
--   3. Then alter table public.quiz_attempts add constraint ... foreign key ...
--
-- That step is tracked as Phase 3A Step 2 and must NOT be added here.
