/** Available store credits: the progression balance minus what's already spent. */
import { useProgressionStore } from "@/stores/progressionStore";
import { useStoreStore } from "@/stores/storeStore";

export function useStoreCredits(): number {
  const balance = useProgressionStore((s) => s.player.credits);
  const spent = useStoreStore((s) => s.creditsSpent);
  return Math.max(0, balance - spent);
}
