import { Coins, IndianRupee } from "lucide-react";

import { cn } from "@/lib/utils";

import type { StickerPaymentMethod } from "../lib/stickerPricing";
import { SF_UI_FONT } from "./storefront-ui";

type StickerPaymentSelectorProps = {
  method: StickerPaymentMethod;
  onChange: (method: StickerPaymentMethod) => void;
  credits: number;
  balance: number | null;
  signedIn: boolean;
  authReady: boolean;
  className?: string;
};

export function StickerPaymentSelector({
  method,
  onChange,
  credits,
  balance,
  signedIn,
  authReady,
  className,
}: StickerPaymentSelectorProps) {
  const affordable = signedIn && balance !== null && balance >= credits;

  return (
    <div className={cn("mt-3 space-y-2.5", className)}>
      <p className={`text-[11px] font-medium uppercase tracking-[0.15em] text-[#555] ${SF_UI_FONT}`}>
        Pay with
      </p>
      <p className="text-[15px] font-bold leading-snug text-black sm:text-[16px]">
        ₹150 <span className="font-semibold text-[#666]">OR</span> {credits} CREDITS
      </p>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Sticker payment method"
      >
        <button
          type="button"
          role="radio"
          aria-checked={method === "inr"}
          onClick={() => onChange("inr")}
          className={cn(
            "flex min-h-[44px] items-center gap-2.5 rounded-[14px] border px-3 py-2.5 text-left transition-colors",
            method === "inr"
              ? "border-black bg-black text-white"
              : "border-[#d0d0d0] bg-white text-black hover:border-black/40",
          )}
        >
          <IndianRupee className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-[13px] font-semibold leading-tight">Pay ₹150</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={method === "credits"}
          onClick={() => onChange("credits")}
          className={cn(
            "flex min-h-[44px] items-center gap-2.5 rounded-[14px] border px-3 py-2.5 text-left transition-colors",
            method === "credits"
              ? "border-black bg-black text-white"
              : "border-[#d0d0d0] bg-white text-black hover:border-black/40",
          )}
        >
          <Coins className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-[13px] font-semibold leading-tight">Pay {credits} Credits</span>
        </button>
      </div>
      {method === "credits" ? (
        <p className={`text-[12px] leading-relaxed text-[#666] ${SF_UI_FONT}`}>
          {!authReady ? (
            "Loading account…"
          ) : !signedIn ? (
            "Sign in to pay with credits. Your balance is verified at checkout."
          ) : balance === null ? (
            "Sign in to see your credit balance."
          ) : affordable ? (
            <>You have {balance} credits — enough for this collection.</>
          ) : (
            <>
              You have {balance} credits — need {credits - balance} more for one collection.
            </>
          )}
        </p>
      ) : (
        <p className={`text-[12px] leading-relaxed text-[#666] ${SF_UI_FONT}`}>
          Standard Gstore checkout with GST and Razorpay.
        </p>
      )}
    </div>
  );
}