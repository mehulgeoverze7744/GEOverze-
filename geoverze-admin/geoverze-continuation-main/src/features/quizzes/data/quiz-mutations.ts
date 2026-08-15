import { supabase } from "@/lib/supabase/client";
import type { QuizRecord } from "@/features/quizzes/types";

import { fetchQuizById } from "./fetchQuizzes";
import {
  mapQuizRow,
  quizRecordToInsert,
  quizRecordToUpdate,
} from "./quiz-mapper";
import { validateQuizForPublish } from "./quiz-validation";
import { questionRecordToRow } from "@/features/questions/data/question-mapper";

const FK_RESTRICT_CODE = "23503";

/** Slugify a quiz title into a canonical `q-…` database ID. */
export function slugifyQuizTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug ? `q-${slug}` : `q-quiz`;
}

/** Resolve a unique quiz ID, appending `-2`, `-3`, … on collision. */
export async function generateUniqueQuizId(title: string): Promise<string> {
  const base = slugifyQuizTitle(title);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("quizzes")
      .select("id")
      .eq("id", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not verify quiz ID availability: ${error.message}`);
    }
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function isFkRestrictError(error: { code?: string; message?: string }): boolean {
  return error.code === FK_RESTRICT_CODE || (error.message ?? "").includes("23503");
}

export async function createQuiz(quiz: QuizRecord): Promise<QuizRecord> {
  if (!quiz.title.trim()) {
    throw new Error("A quiz title is required.");
  }

  const id = await generateUniqueQuizId(quiz.title);
  const payload = quizRecordToInsert(quiz, id);

  const { data, error } = await supabase.from("quizzes").insert(payload).select("*").single();

  if (error) {
    throw new Error(`Could not create quiz: ${error.message}`);
  }

  return mapQuizRow(data, { questionIds: [], questionCount: 0 });
}

export async function updateQuiz(quiz: QuizRecord): Promise<void> {
  if (!quiz.id) {
    throw new Error("Quiz ID is required for update.");
  }
  if (!quiz.title.trim()) {
    throw new Error("A quiz title is required.");
  }

  const payload = quizRecordToUpdate(quiz);
  const { error } = await supabase.from("quizzes").update(payload).eq("id", quiz.id);

  if (error) {
    throw new Error(`Could not update quiz: ${error.message}`);
  }
}

export async function publishQuiz(id: string): Promise<void> {
  const detail = await fetchQuizById(id);
  const problems = validateQuizForPublish(detail.quiz, detail.questions);
  if (problems.length > 0) {
    throw new Error(problems.join(" "));
  }

  const { error } = await supabase.from("quizzes").update({ is_published: true }).eq("id", id);

  if (error) {
    throw new Error(`Could not publish quiz: ${error.message}`);
  }
}

export async function unpublishQuiz(id: string): Promise<void> {
  const { error } = await supabase.from("quizzes").update({ is_published: false }).eq("id", id);

  if (error) {
    throw new Error(`Could not unpublish quiz: ${error.message}`);
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase.from("quizzes").delete().eq("id", id);

  if (error) {
    if (isFkRestrictError(error)) {
      throw new Error(
        "This quiz has play history and cannot be deleted. Unpublish it instead.",
      );
    }
    throw new Error(`Could not delete quiz: ${error.message}`);
  }
}

export async function duplicateQuiz(id: string): Promise<string> {
  const detail = await fetchQuizById(id);
  const source = detail.quiz;
  const newTitle = `${source.title} (copy)`;
  const newId = await generateUniqueQuizId(newTitle);

  const insert = quizRecordToInsert(
    {
      ...source,
      title: newTitle,
      status: "draft",
    },
    newId,
  );

  const { error: quizError } = await supabase.from("quizzes").insert(insert);

  if (quizError) {
    throw new Error(`Could not duplicate quiz: ${quizError.message}`);
  }

  if (detail.questions.length > 0) {
    const rows = detail.questions.map((question, index) => {
      const row = questionRecordToRow(newId, index + 1, question);
      return { ...row, id: crypto.randomUUID() };
    });

    const { error: questionsError } = await supabase.from("quiz_questions").insert(rows);

    if (questionsError) {
      await supabase.from("quizzes").delete().eq("id", newId);
      throw new Error(`Could not copy questions: ${questionsError.message}`);
    }
  }

  return newId;
}
