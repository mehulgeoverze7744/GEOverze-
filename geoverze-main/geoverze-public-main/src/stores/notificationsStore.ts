/**
 * In-app notification queue. Toasts are rendered by sonner; this store is for
 * durable, user-dismissable notices (season results, purchases, invites).
 */
import { create } from "zustand";

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
  items: Notification[];
  seeded: boolean;
  push: (item: Omit<Notification, "id" | "createdAt">) => void;
  /**
   * Fills the center with example notices once per session while there is no
   * backend. Ignored after the first call, and never overwrites real notices.
   */
  seed: (items: Omit<Notification, "id">[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
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
    set((state) =>
      state.seeded
        ? state
        : {
            seeded: true,
            items: [
              ...items.map((item, index) => ({ ...item, id: `seed-${index}` })),
              ...state.items,
            ],
          },
    ),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, readAt: Date.now() } : n)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => (n.readAt ? n : { ...n, readAt: Date.now() })),
    })),
  dismiss: (id) => set((state) => ({ items: state.items.filter((n) => n.id !== id) })),
  clear: () => set({ items: [] }),
}));

export const selectUnreadCount = (s: NotificationsState) =>
  s.items.reduce((n, item) => (item.readAt ? n : n + 1), 0);
