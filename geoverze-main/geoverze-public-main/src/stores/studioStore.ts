/**
 * Creator Studio local state.
 *
 * Holds workspace UI preferences and in-progress drafts so the builder screens
 * survive navigation. Nothing here talks to a backend — every mutation is a
 * local edit that a future Supabase layer would replace.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { StudioArticle, StudioQuiz } from "@/features/studio/data/types";

type StudioState = {
  /** Left workspace rail collapsed to icons. */
  sidebarCollapsed: boolean;
  /** Right context panel visible on wide screens. */
  contextPanelOpen: boolean;
  /** Draft edits keyed by content id. */
  quizDrafts: Record<string, StudioQuiz>;
  articleDrafts: Record<string, StudioArticle>;
  /** Last save timestamp per content id, for the "saved" indicator. */
  savedAt: Record<string, number>;
  toggleSidebar: () => void;
  setSidebar: (collapsed: boolean) => void;
  toggleContextPanel: () => void;
  saveQuizDraft: (quiz: StudioQuiz) => void;
  saveArticleDraft: (article: StudioArticle) => void;
  clearDraft: (id: string) => void;
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      contextPanelOpen: true,
      quizDrafts: {},
      articleDrafts: {},
      savedAt: {},
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleContextPanel: () => set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),
      saveQuizDraft: (quiz) =>
        set((s) => ({
          quizDrafts: { ...s.quizDrafts, [quiz.id]: quiz },
          savedAt: { ...s.savedAt, [quiz.id]: Date.now() },
        })),
      saveArticleDraft: (article) =>
        set((s) => ({
          articleDrafts: { ...s.articleDrafts, [article.id]: article },
          savedAt: { ...s.savedAt, [article.id]: Date.now() },
        })),
      clearDraft: (id) =>
        set((s) => {
          const quizDrafts = { ...s.quizDrafts };
          const articleDrafts = { ...s.articleDrafts };
          delete quizDrafts[id];
          delete articleDrafts[id];
          return { quizDrafts, articleDrafts };
        }),
    }),
    { name: "geoverze.studio" },
  ),
);
