import { useMemo, useState } from "react";
import { AlertTriangle, Check, GripVertical, Plus, Search, Trash2 } from "lucide-react";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchBar } from "@/components/shared/search-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { questionRecords } from "@/features/questions/data";
import { QuizPlayerPreview } from "@/features/questions/question-preview";
import type { QuestionRecord } from "@/features/questions/types";
import {
  quizDifficulties,
  type QuizDifficulty,
  type QuizRecord,
  type QuizVisibility,
} from "@/features/quizzes/types";
import { catalogDaysAgo, languages, quizCategories, quizVisibilities } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const steps = ["Details", "Questions", "Settings", "Review"] as const;
type Step = (typeof steps)[number];

export function createBlankQuiz(): QuizRecord {
  return {
    id: `QZ-${Math.floor(Math.random() * 9000) + 9000}`,
    title: "",
    creatorId: "CR-1001",
    creator: "GEOverze Studio",
    category: quizCategories[0] as string,
    difficulty: "Medium",
    questionCount: 0,
    durationMinutes: 0,
    status: "draft",
    visibility: "Private",
    language: "English",
    tags: [],
    thumbnailLabel: "",
    timeLimitMinutes: 0,
    passingScore: 60,
    instructions: "Answer every question. You can review explanations after each answer.",
    description: "",
    createdAt: catalogDaysAgo(0, 12),
    updatedAt: catalogDaysAgo(0, 12),
    plays: 0,
    completionRate: 0,
    averageScore: 0,
    rating: 0,
    ratingCount: 0,
    questionIds: [],
    difficultyMix: { Easy: 0, Medium: 0, Hard: 0, Expert: 0 },
    playsSeries: Array.from({ length: 12 }, () => 0),
    activity: [],
    versions: [],
  };
}

function issuesFor(draft: QuizRecord) {
  const issues: string[] = [];
  if (!draft.title.trim()) issues.push("A quiz title is required.");
  if (!draft.description.trim()) issues.push("Add a short description for the catalogue.");
  if (draft.questionIds.length < 3) issues.push("Add at least three questions.");
  if (draft.passingScore < 1 || draft.passingScore > 100)
    issues.push("Passing score must be between 1 and 100.");
  return issues;
}

export interface QuizBuilderProps {
  initial: QuizRecord;
  submitLabel?: string | undefined;
  onSave: (quiz: QuizRecord) => void;
  onCancel: () => void;
}

/** Multi-step quiz builder. Pure UI state — persistence happens in the caller. */
export function QuizBuilder({
  initial,
  submitLabel = "Save quiz",
  onSave,
  onCancel,
}: QuizBuilderProps) {
  const [draft, setDraft] = useState<QuizRecord>(initial);
  const [step, setStep] = useState<Step>("Details");
  const [query, setQuery] = useState("");

  const set = <K extends keyof QuizRecord>(key: K, value: QuizRecord[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const selected = useMemo(
    () =>
      draft.questionIds
        .map((id) => questionRecords.find((question) => question.id === id))
        .filter((question): question is QuestionRecord => question !== undefined),
    [draft.questionIds],
  );

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questionRecords
      .filter((question) => !draft.questionIds.includes(question.id))
      .filter((question) => !q || question.prompt.toLowerCase().includes(q))
      .slice(0, 40);
  }, [query, draft.questionIds]);

  const issues = issuesFor(draft);
  const stepIndex = steps.indexOf(step);

  const addQuestion = (id: string) => set("questionIds", [...draft.questionIds, id]);
  const removeQuestion = (id: string) =>
    set(
      "questionIds",
      draft.questionIds.filter((entry) => entry !== id),
    );
  const move = (index: number, delta: number) => {
    const next = [...draft.questionIds];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item as string);
    set("questionIds", next);
  };

  const submit = () => {
    const mix: Record<QuizDifficulty, number> = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
    for (const question of selected) mix[question.difficulty] += 1;
    onSave({
      ...draft,
      questionCount: draft.questionIds.length,
      durationMinutes: Math.max(1, Math.round(draft.questionIds.length * 0.75)),
      difficultyMix: mix,
      updatedAt: catalogDaysAgo(0, 12),
    });
  };

  return (
    <div className="space-y-4">
      <ol className="flex flex-wrap items-center gap-2" aria-label="Quiz builder steps">
        {steps.map((entry, index) => (
          <li key={entry}>
            <button
              type="button"
              onClick={() => setStep(entry)}
              aria-current={entry === step ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                entry === step
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-full border border-border text-xs tabular">
                {index < stepIndex ? <Check className="size-3" aria-hidden="true" /> : index + 1}
              </span>
              {entry}
            </button>
          </li>
        ))}
      </ol>

      {step === "Details" && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Title</Label>
            <Input
              id="quiz-title"
              value={draft.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="e.g. World Capitals Challenge"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-description">Description</Label>
            <Textarea
              id="quiz-description"
              value={draft.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="What will players learn?"
              rows={3}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quiz-category">Category</Label>
              <Select value={draft.category} onValueChange={(value) => set("category", value)}>
                <SelectTrigger id="quiz-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quizCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-difficulty">Difficulty</Label>
              <Select
                value={draft.difficulty}
                onValueChange={(value) => set("difficulty", value as QuizDifficulty)}
              >
                <SelectTrigger id="quiz-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quizDifficulties.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-language">Language</Label>
              <Select value={draft.language} onValueChange={(value) => set("language", value)}>
                <SelectTrigger id="quiz-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-tags">Tags</Label>
            <Input
              id="quiz-tags"
              value={draft.tags.join(", ")}
              onChange={(event) =>
                set(
                  "tags",
                  event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
              placeholder="timed, classroom"
            />
          </div>
        </div>
      )}

      {step === "Questions" && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card">
            <SectionHeader
              title={`Selected questions (${selected.length})`}
              description="Order defines play sequence."
              className="border-b border-border px-3 py-2"
            />
            {selected.length === 0 ? (
              <EmptyState
                title="No questions yet"
                description="Add questions from the bank on the right."
              />
            ) : (
              <ul className="divide-y divide-border">
                {selected.map((question, index) => (
                  <li key={question.id} className="flex items-start gap-2 px-3 py-2">
                    <GripVertical
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{question.prompt}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <DifficultyBadge level={question.difficulty} />
                        <span className="text-xs text-muted-foreground">{question.type}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => move(index, -1)}
                        aria-label={`Move question ${index + 1} up`}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => move(index, 1)}
                        aria-label={`Move question ${index + 1} down`}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => removeQuestion(question.id)}
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-3 py-2">
              <SearchBar
                compact
                value={query}
                onChange={setQuery}
                label="Search the question bank"
                placeholder="Search the question bank…"
              />
            </div>
            {candidates.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching questions"
                description="Try a different search term."
              />
            ) : (
              <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                {candidates.map((question) => (
                  <li key={question.id} className="flex items-start gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{question.prompt}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <DifficultyBadge level={question.difficulty} />
                        <span className="text-xs text-muted-foreground">{question.region}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => addQuestion(question.id)}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {step === "Settings" && (
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quiz-visibility">Visibility</Label>
            <Select
              value={draft.visibility}
              onValueChange={(value) => set("visibility", value as QuizVisibility)}
            >
              <SelectTrigger id="quiz-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quizVisibilities.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-time-limit">Time limit (minutes, 0 = none)</Label>
            <Input
              id="quiz-time-limit"
              type="number"
              min={0}
              value={draft.timeLimitMinutes}
              onChange={(event) => set("timeLimitMinutes", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-passing">Passing score (%)</Label>
            <Input
              id="quiz-passing"
              type="number"
              min={1}
              max={100}
              value={draft.passingScore}
              onChange={(event) => set("passingScore", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-thumbnail">Thumbnail path</Label>
            <Input
              id="quiz-thumbnail"
              value={draft.thumbnailLabel}
              onChange={(event) => set("thumbnailLabel", event.target.value)}
              placeholder="thumbnails/world-capitals.jpg"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="quiz-instructions">Player instructions</Label>
            <Textarea
              id="quiz-instructions"
              rows={3}
              value={draft.instructions}
              onChange={(event) => set("instructions", event.target.value)}
            />
          </div>
        </div>
      )}

      {step === "Review" && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <SectionHeader title="Summary" description="Check before publishing." />
            <dl className="space-y-2 text-sm">
              {[
                ["Title", draft.title || "—"],
                ["Category", draft.category],
                ["Difficulty", draft.difficulty],
                ["Questions", String(draft.questionIds.length)],
                ["Visibility", draft.visibility],
                ["Passing score", `${draft.passingScore}%`],
                [
                  "Time limit",
                  draft.timeLimitMinutes ? `${draft.timeLimitMinutes} min` : "No limit",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-1">
              {draft.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
            {issues.length > 0 && (
              <ul className="space-y-1 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                {issues.map((issue) => (
                  <li key={issue} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <QuizPlayerPreview questions={selected} heading={draft.title || "Untitled quiz"} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={stepIndex === 0}
            onClick={() => setStep(steps[stepIndex - 1] as Step)}
          >
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button size="sm" onClick={() => setStep(steps[stepIndex + 1] as Step)}>
              Next
            </Button>
          ) : (
            <Button size="sm" disabled={issues.length > 0} onClick={submit}>
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
