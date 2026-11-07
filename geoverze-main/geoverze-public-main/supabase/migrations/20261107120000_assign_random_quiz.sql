-- ============================================================
-- GVRZE: Random quiz assignment for category PLAY QUIZ
-- Migration: 20261107120000_assign_random_quiz.sql
--
-- Picks one published, question-backed quiz for a category + difficulty.
-- Randomization happens in Postgres (ORDER BY random()) so the client never
-- chooses among a locally loaded card list.
--
-- Adaptive: pick a difficulty that currently has eligible quizzes, then a
-- quiz of that difficulty. Fixed difficulties never fall back to another.
--
-- This RPC does not create quiz_attempts or deduct credits. Sessions still
-- start in the existing play engine; rewards still land via
-- submit_quiz_attempt on completion.
-- ============================================================

CREATE OR REPLACE FUNCTION public.assign_random_quiz(
  p_category_id text,
  p_difficulty text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_category text;
  v_requested text;
  v_difficulty text;
  v_quiz_id text;
BEGIN
  v_category := lower(btrim(coalesce(p_category_id, '')));
  v_requested := lower(btrim(coalesce(p_difficulty, '')));

  IF v_category = '' OR v_category !~ '^[a-z0-9-]+$' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_category');
  END IF;

  IF v_requested = 'adaptive' THEN
    v_difficulty := 'Adaptive';
  ELSIF v_requested IN ('easy', 'medium', 'hard', 'expert') THEN
    v_difficulty := initcap(v_requested);
  ELSE
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_difficulty');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.is_published
      AND q.category_id = v_category
  ) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unknown_category');
  END IF;

  IF v_difficulty = 'Adaptive' THEN
    SELECT q.difficulty
      INTO v_difficulty
    FROM public.quizzes q
    WHERE q.is_published
      AND q.category_id = v_category
      AND q.difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')
      AND EXISTS (
        SELECT 1
        FROM public.quiz_questions qq
        WHERE qq.quiz_id = q.id
      )
    GROUP BY q.difficulty
    ORDER BY random()
    LIMIT 1;

    IF v_difficulty IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'code', 'none_eligible');
    END IF;
  END IF;

  SELECT q.id
    INTO v_quiz_id
  FROM public.quizzes q
  WHERE q.is_published
    AND q.category_id = v_category
    AND q.difficulty = v_difficulty
    AND EXISTS (
      SELECT 1
      FROM public.quiz_questions qq
      WHERE qq.quiz_id = q.id
    )
  ORDER BY random()
  LIMIT 1;

  IF v_quiz_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'none_eligible',
      'difficulty', v_difficulty
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'quiz_id', v_quiz_id,
    'category_id', v_category,
    'difficulty', v_difficulty
  );
END;
$$;

COMMENT ON FUNCTION public.assign_random_quiz(text, text) IS
  'Returns one random published quiz for a category and difficulty. Adaptive picks an available difficulty first. Never silently substitutes another difficulty.';

REVOKE ALL ON FUNCTION public.assign_random_quiz(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_random_quiz(text, text) TO anon, authenticated;
