import { Link } from "@tanstack/react-router";
import { Check, Eye, GripVertical, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { GeoInput, GeoSelect, GeoTextarea } from "@/components/shared/GeoField";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import { STUDIO_CATEGORIES } from "../data/creator";
import { QUESTION_TYPE_META, emptyQuestion, emptyQuiz, findQuiz } from "../data/quizzes";
import type { StudioQuestion, StudioQuestionType, StudioQuiz } from "../data/types";
import { CoverThumb } from "../components/CoverThumb";
import { StatusPill } from "../components/StatusPill";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatRelative } from "../lib/format";

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;
const MODES = ["Solo", "Timed", "Head to head", "Multiplayer", "Practice"] as const;
const TIME_LIMITS = [0, 10, 15, 20, 30, 60];

/**
 * Quiz builder. Three panes: quiz settings, the question list, and the editor
 * for the selected question. All edits stay local — publishing is a placeholder.
 */
export function QuizBuilderScreen({ quizId }: { quizId: string }) {
  const drafts = useStudioStore((s) => s.quizDrafts);
  const saveDraft = useStudioStore((s) => s.saveQuizDraft);

  const source = drafts[quizId] ?? findQuiz(quizId) ?? emptyQuiz();
  const [quiz, setQuiz] = useState<StudioQuiz>(source);
  const [selected, setSelected] = useState(0);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const patch = (next: Partial<StudioQuiz>) => setQuiz((q) => ({ ...q, ...next }));

  const patchQuestion = (index: number, next: Partial<StudioQuestion>) =>
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((item, i) => (i === index ? { ...item, ...next } : item)),
    }));

  const addQuestion = (type: StudioQuestionType) =>
    setQuiz((q) => {
      const next = [...q.questions, emptyQuestion(type, q.questions.length + 1)];
      setSelected(next.length - 1);
      return { ...q, questions: next };
    });

  const removeQuestion = (index: number) =>
    setQuiz((q) => {
      const questions = q.questions.filter((_, i) => i !== index);
      setSelected((s) => Math.max(0, Math.min(s, questions.length - 1)));
      return { ...q, questions };
    });

  const move = (index: number, direction: -1 | 1) =>
    setQuiz((q) => {
      const target = index + direction;
      if (target < 0 || target >= q.questions.length) return q;
      const questions = [...q.questions];
      const a = questions[index];
      const b = questions[target];
      if (!a || !b) return q;
      questions[index] = b;
      questions[target] = a;
      setSelected(target);
      return { ...q, questions };
    });

  const save = () => {
    const stamped = { ...quiz, updatedAt: new Date().toISOString() };
    setQuiz(stamped);
    saveDraft(stamped);
    setSavedNote(`Saved locally at ${new Date().toLocaleTimeString("en-US")}`);
  };

  const question = quiz.questions[selected];
  const isNew = quizId === "new";

  return (
    <StudioShell
      context={
        <div className="space-y-4">
          <StudioPanel>
            <StudioPanelHeader title="Publishing" hint="Placeholder — no backend yet" />
            <div className="space-y-2">
              <StatusPill status={quiz.status} />
              <p className="text-[0.75rem] text-foreground/50">
                Edited {formatRelative(quiz.updatedAt)}
              </p>
              {savedNote ? (
                <p className="flex items-center gap-1.5 text-[0.75rem] text-[oklch(0.86_0.12_150)]">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                  {savedNote}
                </p>
              ) : null}
            </div>
            <div className="mt-4 space-y-2">
              <GeoButton size="sm" variant="primary" className="w-full gap-2" onClick={save}>
                Save draft
              </GeoButton>
              <GeoButton size="sm" variant="secondary" className="w-full gap-2" disabled>
                <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Submit for review
              </GeoButton>
              <GeoButton size="sm" variant="ghost" className="w-full gap-2" disabled>
                <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Preview as player
              </GeoButton>
            </div>
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="Cover" hint="Generated from the quiz key" />
            <CoverThumb artKey={quiz.coverKey} label={quiz.title} className="h-28 w-full" />
            <GeoInput
              id="cover-key"
              label="Cover key"
              className="mt-3"
              value={quiz.coverKey}
              onChange={(e) => patch({ coverKey: e.target.value })}
            />
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="Checklist" />
            <ul className="space-y-2 text-[0.78rem]">
              {[
                { label: "Title and description", done: quiz.title.length > 3 },
                { label: "At least 5 questions", done: quiz.questions.length >= 5 },
                {
                  label: "Every question explained",
                  done:
                    quiz.questions.length > 0 &&
                    quiz.questions.every((q) => q.explanation.trim().length > 0),
                },
                { label: "Category and difficulty", done: Boolean(quiz.categoryId) },
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      row.done
                        ? "border-[oklch(0.72_0.13_150/0.6)] bg-[oklch(0.72_0.13_150/0.2)]"
                        : "border-foreground/20",
                    )}
                  >
                    {row.done ? (
                      <Check
                        className="h-2.5 w-2.5 text-[oklch(0.86_0.12_150)]"
                        strokeWidth={3}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className={row.done ? "text-foreground/70" : "text-foreground/50"}>
                    {row.label}
                  </span>
                </li>
              ))}
            </ul>
          </StudioPanel>
        </div>
      }
    >
      <StudioHeader
        eyebrow={isNew ? "New quiz" : "Quiz builder"}
        title={quiz.title || "Untitled quiz"}
        description="Set the rules once, then work through the question list. Nothing publishes until you submit for review."
        actions={
          <GeoButton asChild size="sm" variant="ghost">
            <Link to="/studio/quizzes">Back to quizzes</Link>
          </GeoButton>
        }
      />

      <StudioPanel className="mb-4">
        <StudioPanelHeader title="Quiz settings" />
        <div className="grid gap-4 [&>*]:min-w-0 md:grid-cols-2">
          <GeoInput
            id="quiz-title"
            label="Title"
            value={quiz.title}
            placeholder="Rivers of the World"
            onChange={(e) => patch({ title: e.target.value })}
          />
          <GeoSelect
            id="quiz-category"
            label="Category"
            value={quiz.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value })}
          >
            {STUDIO_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </GeoSelect>
          <GeoTextarea
            id="quiz-description"
            label="Description"
            rows={3}
            value={quiz.description}
            placeholder="What will players learn?"
            onChange={(e) => patch({ description: e.target.value })}
            wrapperClassName="md:col-span-2"
          />
          <GeoSelect
            id="quiz-difficulty"
            label="Difficulty"
            value={quiz.difficulty}
            onChange={(e) => patch({ difficulty: e.target.value as StudioQuiz["difficulty"] })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </GeoSelect>
          <GeoSelect
            id="quiz-mode"
            label="Mode"
            value={quiz.mode}
            onChange={(e) => patch({ mode: e.target.value as StudioQuiz["mode"] })}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </GeoSelect>
          <GeoSelect
            id="quiz-time"
            label="Seconds per question"
            value={String(quiz.timeLimit)}
            onChange={(e) => patch({ timeLimit: Number(e.target.value) })}
          >
            {TIME_LIMITS.map((t) => (
              <option key={t} value={t}>
                {t === 0 ? "Untimed" : `${t}s`}
              </option>
            ))}
          </GeoSelect>
          <GeoInput
            id="quiz-tags"
            label="Tags"
            hint="Comma separated"
            value={quiz.tags.join(", ")}
            onChange={(e) =>
              patch({
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      </StudioPanel>

      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <StudioPanel padded={false}>
          <div className="flex items-center justify-between border-b border-bronze/12 px-4 py-3">
            <p className="text-[0.82rem] font-semibold text-foreground">
              Questions
              <span className="ml-2 text-[0.72rem] font-normal text-foreground/50">
                {quiz.questions.length}
              </span>
            </p>
          </div>

          <ul className="max-h-[26rem] overflow-y-auto rail-scroll p-2">
            {quiz.questions.length === 0 ? (
              <li className="px-2 py-6 text-center text-[0.78rem] text-foreground/50">
                No questions yet. Add one below.
              </li>
            ) : (
              quiz.questions.map((q, i) => (
                <li key={q.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                      i === selected ? "bg-bronze/12" : "hover:bg-bronze/[0.06]",
                    )}
                  >
                    <GripVertical
                      className="h-3.5 w-3.5 shrink-0 text-foreground/50"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className={cn(
                          "truncate text-[0.8rem]",
                          i === selected ? "text-bronze-glow" : "text-foreground/75",
                        )}
                      >
                        {i + 1}. {q.prompt || "Untitled question"}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] text-foreground/50">
                        {QUESTION_TYPE_META.find((t) => t.id === q.type)?.label} · {q.difficulty}
                      </p>
                    </button>
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        aria-label="Move question up"
                        onClick={() => move(i, -1)}
                        className="px-1 text-[0.6rem] text-foreground/50 hover:text-bronze"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label="Move question down"
                        onClick={() => move(i, 1)}
                        className="px-1 text-[0.6rem] text-foreground/50 hover:text-bronze"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete question"
                      onClick={() => removeQuestion(i)}
                      className="shrink-0 rounded p-1 text-foreground/50 transition-colors hover:text-[oklch(0.84_0.15_25)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-bronze/12 p-3">
            <p className="mb-2 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
              Add question
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUESTION_TYPE_META.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  disabled={!type.available}
                  title={type.hint}
                  onClick={() => addQuestion(type.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[0.7rem] transition-colors",
                    type.available
                      ? "border-bronze/15 text-foreground/70 hover:border-bronze/45 hover:text-bronze-glow"
                      : "cursor-not-allowed border-bronze/[0.07] text-foreground/50",
                  )}
                >
                  <Plus className="h-3 w-3 shrink-0" strokeWidth={2.2} aria-hidden />
                  <span className="truncate">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </StudioPanel>

        <StudioPanel>
          {!question ? (
            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
              <p className="text-[0.9rem] font-medium text-foreground/70">No question selected</p>
              <p className="mt-1.5 max-w-xs text-[0.8rem] text-foreground/50">
                Add a question type from the list to start writing.
              </p>
            </div>
          ) : (
            <>
              <StudioPanelHeader
                title={`Question ${selected + 1}`}
                hint={QUESTION_TYPE_META.find((t) => t.id === question.type)?.hint ?? ""}
              />
              <div className="space-y-4">
                <GeoTextarea
                  id="q-prompt"
                  label="Prompt"
                  rows={2}
                  value={question.prompt}
                  placeholder="Which river carries the greatest volume of water to the ocean?"
                  onChange={(e) => patchQuestion(selected, { prompt: e.target.value })}
                />

                {question.options.length > 0 ? (
                  <fieldset>
                    <legend className="mb-2 block text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50">
                      Options — mark the correct one
                    </legend>
                    <div className="space-y-2">
                      {question.options.map((option, oi) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Mark option ${oi + 1} correct`}
                            aria-pressed={option.correct}
                            onClick={() =>
                              patchQuestion(selected, {
                                options: question.options.map((o, i) => ({
                                  ...o,
                                  correct: i === oi,
                                })),
                              })
                            }
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              option.correct
                                ? "border-[oklch(0.72_0.13_150/0.6)] bg-[oklch(0.72_0.13_150/0.18)] text-[oklch(0.86_0.12_150)]"
                                : "border-bronze/15 text-foreground/50 hover:border-bronze/40",
                            )}
                          >
                            <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                          </button>
                          <label htmlFor={`opt-${option.id}`} className="sr-only">
                            Option {oi + 1}
                          </label>
                          <input
                            id={`opt-${option.id}`}
                            value={option.label}
                            placeholder={`Option ${oi + 1}`}
                            onChange={(e) =>
                              patchQuestion(selected, {
                                options: question.options.map((o, i) =>
                                  i === oi ? { ...o, label: e.target.value } : o,
                                ),
                              })
                            }
                            className="h-9 w-full rounded-lg border border-bronze/15 bg-[oklch(0.175_0.006_60)] px-3 text-[0.82rem] text-foreground outline-none placeholder:text-foreground/50 focus:border-bronze/50"
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <GeoInput
                    id="q-accepted"
                    label="Accepted answers"
                    hint="Comma separated. Matching is case and spacing forgiving."
                    value={question.accepted.join(", ")}
                    onChange={(e) =>
                      patchQuestion(selected, {
                        accepted: e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                )}

                <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2">
                  <GeoSelect
                    id="q-difficulty"
                    label="Difficulty"
                    value={question.difficulty}
                    onChange={(e) =>
                      patchQuestion(selected, {
                        difficulty: e.target.value as StudioQuestion["difficulty"],
                      })
                    }
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </GeoSelect>
                  <GeoInput
                    id="q-image"
                    label="Media key"
                    hint="Optional — links a media library asset"
                    value={question.imageKey ?? ""}
                    onChange={(e) => patchQuestion(selected, { imageKey: e.target.value || null })}
                  />
                </div>

                <GeoTextarea
                  id="q-explanation"
                  label="Explanation"
                  rows={3}
                  value={question.explanation}
                  placeholder="Shown in review after the answer is graded."
                  onChange={(e) => patchQuestion(selected, { explanation: e.target.value })}
                />
              </div>
            </>
          )}
        </StudioPanel>
      </div>
    </StudioShell>
  );
}
