import { Coins, IndianRupee } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  formatDualPriceShort,
  formatInrPayButtonLabel,
  type GstorePaymentMethod,
} from "../lib/gstoreDualPricing";
import { SF_UI_FONT } from "./storefront-ui";

type ProductPaymentSelectorProps = {
  method: GstorePaymentMethod;
  onChange: (method: GstorePaymentMethod) => void;
  inrMinor: number;
  credits: number;
  balance: number | null;
  signedIn: boolean;
  authReady: boolean;
  className?: string;
};

export function ProductPaymentSelector({
  method,
  onChange,
  inrMinor,
  credits,
  balance,
  signedIn,
  authReady,
  className,
}: ProductPaymentSelectorProps) {
  const affordable = signedIn && balance !== null && balance >= credits;

  return (
    <div className={cn("mt-3 space-y-2.5", className)}>
      <p className={`text-[11px] font-medium uppercase tracking-[0.15em] text-[#555] ${SF_UI_FONT}`}>
        Pay with
      </p>
      <p className="text-[15px] font-bold leading-snug text-black sm:text-[16px]">
        {formatDualPriceShort(inrMinor, credits)}
      </p>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Product payment method"
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
          <span className="text-[13px] font-semibold leading-tight">
            {formatInrPayButtonLabel(inrMinor)}
          </span>
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
            "Pay instantly using your available GVRZE credits."
          ) : (
            <>
              You need {credits} credits (you have {balance}). Pay instantly using your available
              GVRZE credits once your balance is sufficient.
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