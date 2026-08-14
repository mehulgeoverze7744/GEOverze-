import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import { SideDrawer } from "@/components/shared/side-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  backendReadyQuestionTypes,
  questionDifficulties,
  questionTypes,
  type QuestionDifficulty,
  type QuestionRecord,
  type QuestionType,
} from "@/features/questions/types";
import { issuesFor, validateQuestion } from "@/features/questions/validation";
import {
  catalogDaysAgo,
  countriesByRegion,
  languages,
  quizCategories,
  regions,
  topics,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function createBlankQuestion(): QuestionRecord {
  return {
    id: `QN-${Math.floor(Math.random() * 9000) + 9000}`,
    prompt: "",
    type: "Multiple Choice",
    difficulty: "Medium",
    category: quizCategories[0] as string,
    region: "Global",
    country: "Worldwide",
    topic: topics[0] as string,
    tags: [],
    language: "English",
    explanation: "",
    options: [
      { id: "o1", text: "", correct: true },
      { id: "o2", text: "", correct: false },
    ],
    answerText: "",
    mediaLabel: "",
    requiresMedia: false,
    usageCount: 0,
    status: "draft",
    author: "Admin",
    createdAt: catalogDaysAgo(0, 10),
    updatedAt: catalogDaysAgo(0, 10),
  };
}

function FieldErrors({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {messages.map((message) => (
        <li key={message} className="flex items-center gap-1 text-xs text-destructive">
          <AlertTriangle className="size-3" aria-hidden="true" />
          {message}
        </li>
      ))}
    </ul>
  );
}

export interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionRecord | null;
  onSave: (question: QuestionRecord) => void;
}

export function QuestionEditor({ open, onOpenChange, question, onSave }: QuestionEditorProps) {
  const [draft, setDraft] = useState<QuestionRecord>(question ?? createBlankQuestion());
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(question ?? createBlankQuestion());
      setShowErrors(false);
    }
  }, [open, question]);

  const issues = validateQuestion(draft);
  const patch = (changes: Partial<QuestionRecord>) => setDraft((prev) => ({ ...prev, ...changes }));
  const usesOptions =
    draft.type === "Multiple Choice" ||
    draft.type === "True / False" ||
    draft.type === "Matching" ||
    draft.type === "Ordering";
  const errorsFor = (field: Parameters<typeof issuesFor>[1]) =>
    showErrors ? issuesFor(issues, field).map((issue) => issue.message) : [];

  const submit = () => {
    if (issues.length > 0) {
      setShowErrors(true);
      return;
    }
    onSave({ ...draft, updatedAt: catalogDaysAgo(0, 12) });
    onOpenChange(false);
  };

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={question ? "Edit question" : "New question"}
      description="Questions are reusable across every quiz in the catalogue."
      width="sm:max-w-xl"
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={submit}>
            Save question
          </Button>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {showErrors && issues.length > 0 && (
            <span className="text-xs text-destructive">
              {issues.length} validation issue{issues.length > 1 ? "s" : ""} to resolve
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="q-prompt">Question text</Label>
          <Textarea
            id="q-prompt"
            value={draft.prompt}
            onChange={(event) => patch({ prompt: event.target.value })}
            placeholder="Which city is the capital of Norway?"
            className={cn("mt-1", errorsFor("prompt").length > 0 && "border-destructive")}
          />
          <FieldErrors messages={errorsFor("prompt")} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="q-type">Type</Label>
            <Select
              value={draft.type}
              onValueChange={(value) =>
                patch({
                  type: value as QuestionType,
                  requiresMedia: value === "Image Based" || value === "Map Based",
                })
              }
            >
              <SelectTrigger id="q-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                    {backendReadyQuestionTypes.includes(type) ? " (backend-ready)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="q-difficulty">Difficulty</Label>
            <Select
              value={draft.difficulty}
              onValueChange={(value) => patch({ difficulty: value as QuestionDifficulty })}
            >
              <SelectTrigger id="q-difficulty" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionDifficulties.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldErrors messages={errorsFor("difficulty")} />
          </div>
          <div>
            <Label htmlFor="q-category">Category</Label>
            <Select value={draft.category} onValueChange={(value) => patch({ category: value })}>
              <SelectTrigger id="q-category" className="mt-1">
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
          <div>
            <Label htmlFor="q-topic">Topic</Label>
            <Select value={draft.topic} onValueChange={(value) => patch({ topic: value })}>
              <SelectTrigger id="q-topic" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="q-region">Region</Label>
            <Select
              value={draft.region}
              onValueChange={(value) =>
                patch({ region: value, country: countriesByRegion[value]?.[0] ?? "Worldwide" })
              }
            >
              <SelectTrigger id="q-region" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="q-country">Country</Label>
            <Select value={draft.country} onValueChange={(value) => patch({ country: value })}>
              <SelectTrigger id="q-country" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(countriesByRegion[draft.region] ?? ["Worldwide"]).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="q-language">Language</Label>
            <Select value={draft.language} onValueChange={(value) => patch({ language: value })}>
              <SelectTrigger id="q-language" className="mt-1">
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
          <div>
            <Label htmlFor="q-tags">Tags</Label>
            <Input
              id="q-tags"
              className="mt-1"
              value={draft.tags.join(", ")}
              placeholder="beginner, map-first"
              onChange={(event) =>
                patch({
                  tags: event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>

        {usesOptions ? (
          <div>
            <div className="flex items-center justify-between">
              <Label>Answer options</Label>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() =>
                  patch({
                    options: [
                      ...draft.options,
                      {
                        id: `o${draft.options.length + 1}-${Date.now()}`,
                        text: "",
                        correct: false,
                      },
                    ],
                  })
                }
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add option
              </Button>
            </div>
            <ul className="mt-2 space-y-2">
              {draft.options.map((option) => (
                <li key={option.id} className="flex items-center gap-2">
                  <Input
                    value={option.text}
                    aria-label="Option text"
                    placeholder="Option text"
                    onChange={(event) =>
                      patch({
                        options: draft.options.map((entry) =>
                          entry.id === option.id ? { ...entry, text: event.target.value } : entry,
                        ),
                      })
                    }
                  />
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch
                      checked={option.correct}
                      aria-label="Mark as correct answer"
                      onCheckedChange={(checked) =>
                        patch({
                          options: draft.options.map((entry) =>
                            entry.id === option.id
                              ? { ...entry, correct: checked }
                              : draft.type === "True / False"
                                ? { ...entry, correct: false }
                                : entry,
                          ),
                        })
                      }
                    />
                    Correct
                  </label>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    aria-label="Remove option"
                    onClick={() =>
                      patch({ options: draft.options.filter((entry) => entry.id !== option.id) })
                    }
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            <FieldErrors messages={errorsFor("options")} />
          </div>
        ) : (
          <div>
            <Label htmlFor="q-answer">Correct answer</Label>
            <Input
              id="q-answer"
              className="mt-1"
              value={draft.answerText}
              onChange={(event) => patch({ answerText: event.target.value })}
              placeholder="Oslo"
            />
            <FieldErrors messages={errorsFor("answerText")} />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="q-media">Media reference</Label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Switch
                checked={draft.requiresMedia}
                aria-label="Question requires media"
                onCheckedChange={(checked) => patch({ requiresMedia: checked })}
              />
              Requires media
            </label>
          </div>
          <Input
            id="q-media"
            className="mt-1"
            value={draft.mediaLabel}
            onChange={(event) => patch({ mediaLabel: event.target.value })}
            placeholder="media/norway-flag.png"
          />
          <FieldErrors messages={errorsFor("mediaLabel")} />
        </div>

        <div>
          <Label htmlFor="q-explanation">Explanation</Label>
          <Textarea
            id="q-explanation"
            className="mt-1"
            value={draft.explanation}
            onChange={(event) => patch({ explanation: event.target.value })}
            placeholder="Shown to players after they answer."
          />
          <FieldErrors messages={errorsFor("explanation")} />
        </div>
      </div>
    </SideDrawer>
  );
}
