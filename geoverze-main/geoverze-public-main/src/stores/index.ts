/**
 * Global state barrel.
 *
 * Conventions:
 * - One store per domain, in this folder, named `<domain>Store.ts`.
 * - Stores hold state and pure setters only. Data fetching lives in the feature
 *   module (TanStack Query) and calls into the store when a result must be
 *   shared app-wide.
 * - Always subscribe through a selector so a component re-renders only when the
 *   slice it reads changes: `useCartStore(selectCartCount)`.
 * - Persist only what is safe to keep on a shared device (preferences, cart).
 *   Session material is never persisted by hand — the auth client owns it.
 */

export { useAuthStore, selectIsSignedIn, selectUser, selectRole } from "./authStore";
export type { AuthStatus, SessionUser } from "./authStore";

export { usePreferencesStore, selectMotion, selectUnits } from "./preferencesStore";
export type { MotionPreference, UnitSystem } from "./preferencesStore";

export { useCartStore, selectCartCount, selectCartSubtotal } from "./cartStore";
export type { CartLine } from "./cartStore";

export { useNotificationsStore, selectUnreadCount } from "./notificationsStore";
export type { Notification, NotificationKind } from "./notificationsStore";

export {
  useQuizStore,
  selectAccuracy,
  selectScore,
  selectAnswered,
  selectHasRun,
  DEFAULT_SETTINGS,
} from "./quizStore";
export type { RunAnswer, QuizMode, QuizStatus, QuizSettings } from "./quizStore";
