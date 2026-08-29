import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { refreshProgression } from "@/lib/supabase/auth-sync";
import { selectUser, useAuthStore } from "@/stores/authStore";
import { useProgressionStore } from "@/stores/progressionStore";

import {
  CreditPurchaseError,
  placeCreditOrder,
  type PlaceCreditOrderResult,
} from "../lib/placeCreditOrder";
import { entitlementsQueryKey } from "./useEntitlements";

export type CreditPurchaseTarget = {
  slug: string;
  name: string;
  serverProductId: string;
};

export type UseCreditPurchaseResult = {
  purchase: (target: CreditPurchaseTarget) => Promise<PlaceCreditOrderResult | null>;
  purchasingSlug: string | null;
  isPurchasing: (slug: string) => boolean;
};

/** Production credit reward purchase via place_credit_order. */
export function useCreditPurchase(): UseCreditPurchaseResult {
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);

  const purchase = useCallback(
    async (target: CreditPurchaseTarget): Promise<PlaceCreditOrderResult | null> => {
      if (!user) {
        toast.error("Sign in required", {
          description: "Create an account or sign in to claim rewards with credits.",
          action: {
            label: "Sign in",
            onClick: () => void navigate({ to: "/auth/login" }),
          },
        });
        return null;
      }

      if (purchasingSlug) return null;

      setPurchasingSlug(target.slug);

      try {
        const result = await placeCreditOrder(target.serverProductId, 1);

        const player = useProgressionStore.getState().player;
        useProgressionStore.getState().setPlayer({
          ...player,
          credits: result.new_balance,
        });

        void refreshProgression(user.id);
        void queryClient.invalidateQueries({ queryKey: entitlementsQueryKey });

        toast.success(`${target.name} claimed`, {
          description: `${result.credits_total} credits spent · ${result.new_balance} credits remaining`,
        });

        return result;
      } catch (error) {
        if (error instanceof CreditPurchaseError) {
          switch (error.code) {
            case "unauthenticated":
              toast.error("Sign in required", {
                description: error.message,
                action: {
                  label: "Sign in",
                  onClick: () => void navigate({ to: "/auth/login" }),
                },
              });
              break;
            case "insufficient_credits":
              toast.error("Not enough credits", { description: error.message });
              break;
            case "already_owned":
              toast.message("Already in your library", { description: error.message });
              void queryClient.invalidateQueries({ queryKey: entitlementsQueryKey });
              break;
            case "inactive_product":
              toast.error("Unavailable", { description: error.message });
              break;
            default:
              toast.error("Purchase failed", { description: error.message });
          }
        } else {
          toast.error("Purchase failed", {
            description: error instanceof Error ? error.message : "Please try again.",
          });
        }
        return null;
      } finally {
        setPurchasingSlug(null);
      }
    },
    [navigate, purchasingSlug, queryClient, user],
  );

  const isPurchasing = useCallback((slug: string) => purchasingSlug === slug, [purchasingSlug]);

  return { purchase, purchasingSlug, isPurchasing };
}
