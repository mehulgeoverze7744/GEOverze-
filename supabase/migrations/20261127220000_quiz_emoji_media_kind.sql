-- Emoji Fun quizzes stored rebus clues as kind=flag; relabel for analytics and studio tools.
-- Frontend already detects rebus glyphs; this keeps the database honest.

UPDATE public.quiz_questions
SET media = jsonb_set(media, '{kind}', '"emoji"', false)
WHERE media->>'kind' = 'flag'
  AND media->>'glyph' IS NOT NULL
  AND (
    media->>'glyph' LIKE '%+%'
    OR media->>'glyph' ~ '[^[:ascii:]]'
  )
  AND quiz_id LIKE 'q-emo-%';