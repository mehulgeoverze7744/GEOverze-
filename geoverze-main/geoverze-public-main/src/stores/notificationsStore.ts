/**
 * In-app notification queue. Toasts are rendered by sonner; this store is for
 * durable, user-dismissable notices (season results, purchases, invites).
 *
 * Dismiss/read state is persisted per authenticated user in localStorage until
 * a Supabase notifications table exists.
 */
import { create } from "zustand";

import {
  EMPTY_NOTIFICATION_PREFS,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type PersistedNotificationPrefs,
} from "@/features/profile/lib/notification-persistence";

export type NotificationKind = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  /** Epoch ms. */
  createdAt: number;
  readAt?: number;
};

type NotificationsState = {
  userId: string | null;
  prefs: PersistedNotificationPrefs;
  items: Notification[];
  seeded: boolean;
  push: (item: Omit<Notification, "id" | "createdAt">) => void;
  /**
   * Fills the centre with example notices once per session while there is no
   * backend. Respects per-user dismissed/read persistence.
   */
  seed: (items: Omit<Notification, "id">[]) => void;
  /** Switch the active user and reload persisted dismiss/read state. */
  syncForUser: (userId: string | null) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

function persistPrefs(userId: string | null, prefs: PersistedNotificationPrefs) {
  if (!userId) return;
  saveNotificationPrefs(userId, prefs);
}

function applySeedItems(
  seeds: Omit<Notification, "id">[],
  prefs: PersistedNotificationPrefs,
  existing: Notification[],
) {
  const dismissed = new Set(prefs.dismissedIds);
  const seededItems = seeds
    .map((item, index) => ({ ...item, id: `seed-${index}` }))
    .filter((item) => !dismissed.has(item.id))
    .map((item) => ({
      ...item,
      readAt: prefs.readAtById[item.id] ?? item.readAt,
    }));

  const dynamicItems = existing.filter((item) => !item.id.startsWith("seed-"));
  return [...seededItems, ...dynamicItems];
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  userId: null,
  prefs: { ...EMPTY_NOTIFICATION_PREFS },
  items: [],
  seeded: false,
  push: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          id: `${Date.now().toString(36)}-${state.items.length}`,
          createdAt: Date.now(),
        },
      ],
    })),
  seed: (items) =>
    set((state) => {
      if (state.seeded || !state.userId) return state;
      return {
        seeded: true,
        items: applySeedItems(items, state.prefs, state.items),
      };
    }),
  syncForUser: (userId) => {
    const current = get();
    if (current.userId === userId) return;

    if (!userId) {
      set({
        userId: null,
        prefs: { ...EMPTY_NOTIFICATION_PREFS },
        items: [],
        seeded: false,
      });
      return;
    }

    const prefs = loadNotificationPrefs(userId);
    set({
      userId,
      prefs,
      items: [],
      seeded: false,
    });
  },
  markRead: (id) =>
    set((state) => {
      const readAt = Date.now();
      const prefs = {
        ...state.prefs,
        readAtById: { ...state.prefs.readAtById, [id]: readAt },
      };
      persistPrefs(state.userId, prefs);
      return {
        prefs,
        items: state.items.map((n) => (n.id === id ? { ...n, readAt } : n)),
      };
    }),
  markAllRead: () =>
    set((state) => {
      const readAt = Date.now();
      const readAtById = { ...state.prefs.readAtById };
      for (const item of state.items) {
        if (!item.readAt) readAtById[item.id] = readAt;
      }
      const prefs = { ...state.prefs, readAtById };
      persistPrefs(state.userId, prefs);
      return {
        prefs,
        items: state.items.map((n) => (n.readAt ? n : { ...n, readAt })),
      };
    }),
  dismiss: (id) =>
    set((state) => {
      const prefs = {
        ...state.prefs,
        dismissedIds: [...new Set([...state.prefs.dismissedIds, id])],
      };
      persistPrefs(state.userId, prefs);
      return {
        prefs,
        items: state.items.filter((n) => n.id !== id),
      };
    }),
  clear: () =>
    set((state) => {
      const prefs = {
        ...state.prefs,
        dismissedIds: [...new Set([...state.prefs.dismissedIds, ...state.items.map((n) => n.id)])],
      };
      persistPrefs(state.userId, prefs);
      return { prefs, items: [] };
    }),
}));

export const selectUnreadCount = (s: NotificationsState) =>
  s.items.reduce((n, item) => (item.readAt ? n : n + 1), 0);
