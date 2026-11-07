-- Rewrite template prompts, attach real flag/landmark media keys, and point
-- map boards at production SVG assets. Idempotent: only matches leftover
-- generator phrasing and legacy board keys.

UPDATE public.quiz_questions
SET media = jsonb_strip_nulls(
  jsonb_build_object(
    'kind', 'image',
    'art', 'wiki:' || trim(both ' ?.' FROM substring(prompt FROM '^What is the country of (.+)$')),
    'caption', trim(both ' ?.' FROM substring(prompt FROM '^What is the country of (.+)$'))
  )
)
WHERE media IS NULL
  AND prompt ~ '^What is the country of .+';

UPDATE public.quiz_questions AS qq
SET media = jsonb_build_object(
  'kind', 'image',
  'art', 'flag:' || trim(both ' ?.' FROM (regexp_match(qq.prompt, 'linked to (.+)$'))[1]),
  'caption', 'National flag'
)
FROM public.quizzes AS q
WHERE q.id = qq.quiz_id
  AND q.category_id = 'flags'
  AND qq.media IS NULL
  AND qq.prompt ~ 'linked to .+';

UPDATE public.quiz_questions
SET board_art = CASE board_art
  WHEN 'map-africa' THEN '/assets/maps/africa.svg'
  WHEN 'map-europe' THEN '/assets/maps/europe.svg'
  WHEN 'map-asia' THEN '/assets/maps/asia.svg'
  WHEN 'map-samerica' THEN '/assets/maps/south-america.svg'
  WHEN 'map-oceania' THEN '/assets/maps/oceania.svg'
  ELSE board_art
END
WHERE type = 'map'
  AND board_art LIKE 'map-%';

UPDATE public.quiz_questions
SET prompt = CASE
  WHEN prompt ~ '^Identify the capital linked to '
    THEN 'What is the capital of ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the definition linked to '
    THEN 'What is ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the year linked to '
    THEN 'When did this take place: ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the mouth linked to '
    THEN 'Where does the ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || ' empty?'
  WHEN prompt ~ '^Identify the best-known emblem linked to '
    THEN 'Which emblem appears on the flag of ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the country linked to '
    THEN 'Which country is associated with ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the ocean linked to '
    THEN 'Which ocean is linked to ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the continent linked to '
    THEN 'On which continent would you place ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the countries linked to '
    THEN 'Which countries share ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the record linked to '
    THEN 'What record belongs to ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the location linked to '
    THEN 'Where is this: ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the colour order linked to '
    THEN 'What is the colour order of the flag of ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the city linked to '
    THEN 'Which city is ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the region linked to '
    THEN 'Which region is linked to ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  WHEN prompt ~ '^Identify the meaning linked to '
    THEN 'What does this mean: ' || trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1]) || '?'
  ELSE
    trim(both ' ?.' FROM (regexp_match(prompt, 'linked to (.+)$'))[1])
    || ' — what is the '
    || lower((regexp_match(prompt, '^Identify the (.+) linked to '))[1])
    || '?'
END
WHERE prompt ~ '^Identify the .+ linked to ';

UPDATE public.quiz_questions
SET prompt = 'In which country is '
  || trim(both ' ?.' FROM substring(prompt FROM '^What is the country of (.+)$'))
  || ' located?'
WHERE prompt ~ '^What is the country of ';
