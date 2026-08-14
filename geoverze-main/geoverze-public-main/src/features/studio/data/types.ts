/**
 * Creator Studio domain types.
 *
 * Shapes deliberately mirror what a future Supabase schema would return, so
 * screens can switch from the placeholder catalogues in this folder to real
 * rows without touching component code.
 */

export type ContentStatus =
  "draft" | "in-review" | "scheduled" | "published" | "rejected" | "archived";

export const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  "in-review": "In review",
  scheduled: "Scheduled",
  published: "Published",
  rejected: "Needs changes",
  archived: "Archived",
};

export type StudioDifficulty = "Easy" | "Medium" | "Hard" | "Expert";

export type StudioQuizMode = "Solo" | "Timed" | "Head to head" | "Multiplayer" | "Practice";

/** Question kinds the builder can author today. */
export type BuilderQuestionType = "mcq" | "image" | "text" | "flag" | "shape" | "capital";

/** Declared but not yet authorable — shown as disabled tiles. */
export type FutureQuestionType = "order" | "dragdrop" | "audio" | "video";

export type StudioQuestionType = BuilderQuestionType | FutureQuestionType;

export type StudioOption = {
  id: string;
  label: string;
  correct: boolean;
};

export type StudioQuestion = {
  id: string;
  type: StudioQuestionType;
  prompt: string;
  options: StudioOption[];
  /** Free-text accepted answers for `text` / `capital` questions. */
  accepted: string[];
  explanation: string;
  difficulty: StudioDifficulty;
  /** Media seed — procedural art until real uploads land. */
  imageKey: string | null;
};

export type StudioQuiz = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: StudioDifficulty;
  mode: StudioQuizMode;
  /** Seconds per question, `0` for untimed. */
  timeLimit: number;
  questionLimit: number;
  coverKey: string;
  tags: string[];
  status: ContentStatus;
  updatedAt: string;
  plays: number;
  completionRate: number;
  averageScore: number;
  questions: StudioQuestion[];
};

export type ArticleBlock =
  | { id: string; kind: "heading"; level: 2 | 3; text: string }
  | { id: string; kind: "paragraph"; text: string }
  | { id: string; kind: "list"; ordered: boolean; items: string[] }
  | { id: string; kind: "image"; imageKey: string; caption: string }
  | { id: string; kind: "table"; columns: string[]; rows: string[][] }
  | { id: string; kind: "fact"; title: string; text: string }
  | { id: string; kind: "didyouknow"; text: string }
  | { id: string; kind: "reference"; label: string; source: string };

export type ArticleBlockKind = ArticleBlock["kind"];

export const BLOCK_LABEL: Record<ArticleBlockKind, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  list: "List",
  image: "Image",
  table: "Table",
  fact: "Fact box",
  didyouknow: "Did you know",
  reference: "Reference",
};

export type StudioArticle = {
  id: string;
  title: string;
  summary: string;
  categoryId: string;
  tags: string[];
  coverKey: string;
  status: ContentStatus;
  updatedAt: string;
  readMinutes: number;
  views: number;
  bookmarks: number;
  blocks: ArticleBlock[];
};

export type MediaKind = "image" | "document" | "quiz-asset";

export type MediaAsset = {
  id: string;
  name: string;
  kind: MediaKind;
  /** Procedural art seed standing in for a real thumbnail. */
  artKey: string;
  /** Bytes. */
  size: number;
  dimensions: string | null;
  uploadedAt: string;
  usedIn: number;
  tags: string[];
};

export type SeriesPoint = { label: string; value: number };

export type AnalyticsMetric = {
  id: string;
  label: string;
  value: number;
  format: "number" | "percent" | "score" | "money";
  deltaPercent: number;
  series: SeriesPoint[];
};

export type Follower = {
  id: string;
  name: string;
  handle: string;
  tier: "Explorer" | "Navigator" | "Cartographer";
  followedAt: string;
  quizzesPlayed: number;
  articlesRead: number;
  country: string;
};

export type Transaction = {
  id: string;
  date: string;
  label: string;
  kind: "quiz-royalty" | "article-royalty" | "bundle-sale" | "credit-bonus" | "payout";
  /** Minor units of USD. `null` when the entry is credit-only. */
  amount: number | null;
  credits: number | null;
  status: "cleared" | "pending";
};

export type Payout = {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "paid" | "scheduled" | "processing";
  reference: string;
};

export type StudioNotification = {
  id: string;
  kind: "review" | "milestone" | "comment" | "payout" | "system";
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export type ActivityEntry = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "publish" | "draft" | "review" | "audience" | "earning";
};
