/** Per-user notification dismiss/read state (client cache until a backend exists). */

const STORAGE_PREFIX = "geoverze.notifications.v1";

export type PersistedNotificationPrefs = {
  dismissedIds: string[];
  readAtById: Record<string, number>;
};

export const EMPTY_NOTIFICATION_PREFS: PersistedNotificationPrefs = {
  dismissedIds: [],
  readAtById: {},
};

export function notificationPersistKey(userId: string) {
  return `${STORAGE_PREFIX}.${userId}`;
}

export function loadNotificationPrefs(userId: string): PersistedNotificationPrefs {
  try {
    const raw = localStorage.getItem(notificationPersistKey(userId));
    if (!raw) return { ...EMPTY_NOTIFICATION_PREFS };

    const parsed = JSON.parse(raw) as Partial<PersistedNotificationPrefs>;
    return {
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
      readAtById:
        parsed.readAtById && typeof parsed.readAtById === "object" ? parsed.readAtById : {},
    };
  } catch {
    return { ...EMPTY_NOTIFICATION_PREFS };
  }
}

export function saveNotificationPrefs(userId: string, prefs: PersistedNotificationPrefs) {
  localStorage.setItem(notificationPersistKey(userId), JSON.stringify(prefs));
}
