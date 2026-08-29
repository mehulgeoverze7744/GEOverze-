/** Authoritative store credit balance from user_progression. */
import { selectIsSignedIn, useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";

export type StoreCreditsState = {
  /** Whole credits when signed in; null when logged out or auth is still resolving. */
  balance: number | null;
  signedIn: boolean;
  authReady: boolean;
};

export function useStoreCredits(): number | null {
  return useStoreCreditsState().balance;
}

/** Balance plus auth semantics for UI that needs loading/logged-out handling. */
export function useStoreCreditsState(): StoreCreditsState {
  const status = useAuthStore((s) => s.status);
  const signedIn = status === "signed-in";
  const authReady = status !== "unknown";
  const credits = useProgressionStore((s) => s.player.credits);

  return {
    balance: signedIn ? credits : null,
    signedIn,
    authReady,
  };
}
