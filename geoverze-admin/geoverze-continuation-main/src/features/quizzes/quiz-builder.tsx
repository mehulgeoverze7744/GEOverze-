import { useMemo, useState } from "react";
import { AlertTriangle, Check, GripVertical, Plus, Search } from "lucide-react";

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

const allSteps = ["Details", "Questions", "Settings", "Review"] as const;
type Step = (typeof allSteps)[number];

export function createBlankQuiz(): QuizRecord {
  return {
    id: "",
    title: "",
    creatorId: "",
    creator: "GEOverze Studio",
    category: quizCategories[0] as string,
    difficulty: "Medium",
    questionCount: 0,
    durationMinutes: 5,
    status: "draft",
    visibility: "Private",
    language: "English",
    tags: [],
    thumbnailLabel: "",
    timeLimitMinutes: 0,
    passingScore: 60,
    instructions: "Answer every question. You can review explanations after each answer.",
    description: "",
    rewardXp: 100,
    rewardCredits: 25,
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

function issuesFor(draft: QuizRecord, manageQuestions: boolean) {
  const issues: string[] = [];
  if (!draft.title.trim()) issues.push("A quiz title is required.");
  if (!draft.description.trim()) issues.push("Add a short description for the catalogue.");
  if (manageQuestions && draft.questionIds.length < 3) {
    issues.push("Add at least three questions.");
  }
  if (draft.rewardXp < 0) issues.push("Reward XP must be zero or greater.");
  if (draft.rewardCredits < 0) issues.push("Reward credits must be zero or greater.");
  if (draft.durationMinutes < 1) issues.push("Duration must be at least 1 minute.");
  return issues;
}

export interface QuizBuilderProps {
  initial: QuizRecord;
  submitLabel?: string | undefined;
  onSave: (quiz: QuizRecord) => void;
  onCancel: () => void;
  /** When false, questions are managed on the quiz detail page (Supabase-scoped). */
  manageQuestions?: boolean;
  saving?: boolean;
}

/** Multi-step quiz builder. Persistence happens in the caller via Supabase mutations. */
export function QuizBuilder({
  initial,
  submitLabel = "Save quiz",
  onSave,
  onCancel,
  manageQuestions = false,
  saving = false,
}: QuizBuilderProps) {
  const [draft, setDraft] = useState<QuizRecord>(initial);
  const steps = useMemo(
    () => (manageQuestions ? [...allSteps] : allSteps.filter((s) => s !== "Questions")),
    [manageQuestions],
  );
  const [step, setStep] = useState<Step>(steps[0] as Step);
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

  const issues = issuesFor(draft, manageQuestions);
  const stepIndex = steps.indexOf(step);

  const submit = () => {
    onSave({
      ...draft,
      questionCount: draft.questionIds.length,
      durationMinutes: Math.max(1, draft.durationMinutes),
      rewardXp: Math.max(0, draft.rewardXp),
      rewardCredits: Math.max(0, draft.rewardCredits),
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
            <Label htmlFor="quiz-creator">Creator</Label>
            <Input
              id="quiz-creator"
              value={draft.creator}
              onChange={(event) => set("creator", event.target.value)}
              placeholder="GEOverze Studio"
            />
          </div>
          {!manageQuestions && (
            <p className="text-xs text-muted-foreground">
              Questions are added on the quiz detail page after saving. Tags, visibility, passing
              score and instructions are UI-only until a future schema update.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="quiz-tags">Tags (UI only — not saved to database)</Label>
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

      {step === "Questions" && manageQuestions && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <EmptyState
              title="Question bank not connected"
              description="Add questions from the quiz detail page after creating this quiz in Supabase."
            />
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
                title="Mock bank only"
                description="Use the Questions tab on the quiz detail page for Supabase-backed questions."
              />
            ) : (
              <ul className="max-h-96 divide-y divide-border overflow-y-auto">
                {candidates.map((question) => (
                  <li key={question.id} className="flex items-start gap-2 px-3 py-2 opacity-50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{question.prompt}</p>
                      <DifficultyBadge level={question.difficulty} />
                    </div>
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
            <Label htmlFor="quiz-duration">Duration (minutes)</Label>
            <Input
              id="quiz-duration"
              type="number"
              min={1}
              value={draft.durationMinutes}
              onChange={(event) => set("durationMinutes", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-thumbnail">Art / thumbnail path</Label>
            <Input
              id="quiz-thumbnail"
              value={draft.thumbnailLabel}
              onChange={(event) => set("thumbnailLabel", event.target.value)}
              placeholder="flags or thumbnails/world-capitals.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-reward-xp">Reward XP</Label>
            <Input
              id="quiz-reward-xp"
              type="number"
              min={0}
              value={draft.rewardXp}
              onChange={(event) => set("rewardXp", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-reward-credits">Reward credits</Label>
            <Input
              id="quiz-reward-credits"
              type="number"
              min={0}
              value={draft.rewardCredits}
              onChange={(event) => set("rewardCredits", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-visibility">Visibility (UI only)</Label>
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
            <Label htmlFor="quiz-time-limit">Time limit (UI only, minutes)</Label>
            <Input
              id="quiz-time-limit"
              type="number"
              min={0}
              value={draft.timeLimitMinutes}
              onChange={(event) => set("timeLimitMinutes", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-passing">Passing score (UI only, %)</Label>
            <Input
              id="quiz-passing"
              type="number"
              min={1}
              max={100}
              value={draft.passingScore}
              onChange={(event) => set("passingScore", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="quiz-instructions">Player instructions (UI only)</Label>
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
            <SectionHeader title="Summary" description="Check before saving." />
            <dl className="space-y-2 text-sm">
              {[
                ["Title", draft.title || "—"],
                ["Category", draft.category],
                ["Difficulty", draft.difficulty],
                ["Duration", `${draft.durationMinutes} min`],
                ["Reward XP", String(draft.rewardXp)],
                ["Reward credits", String(draft.rewardCredits)],
                ["Questions", manageQuestions ? String(draft.questionIds.length) : "Add on detail page"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
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
          {!manageQuestions && (
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              After saving, open the Questions tab to add at least three questions before
              publishing.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={stepIndex === 0 || saving}
            onClick={() => setStep(steps[stepIndex - 1] as Step)}
          >
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button size="sm" onClick={() => setStep(steps[stepIndex + 1] as Step)}>
              Next
            </Button>
          ) : (
            <Button size="sm" disabled={issues.length > 0 || saving} onClick={submit}>
              {saving ? "Saving…" : submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
