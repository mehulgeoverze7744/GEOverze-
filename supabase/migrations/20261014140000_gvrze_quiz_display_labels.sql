-- Display-label only. Does not change quiz ids, slugs, questions, scoring,
-- ownership columns, or publication flags. Safe to re-run.
-- Applied migrations that originally seeded 'GEOverze Studio' are left intact.

update public.quizzes
set creator = 'GVRZE Studio'
where creator = 'GEOverze Studio';

-- Mixed-type geography sample (typed, boolean, single, map, drag-drop).
-- Title only; id q-geoverze-cms-test-quiz is unchanged.
update public.quizzes
set title = 'Question Types Sampler'
where id = 'q-geoverze-cms-test-quiz'
  and title = 'GEOverze CMS test quiz';
