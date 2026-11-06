/**
 * MockPaymentGateway — Full-featured test payment UI for Gstore.
 *
 * Renders when MOCK_PAYMENTS_ENABLED=true (or VITE_MOCK_PAYMENTS=true) is set
 * in the server environment.  Replaces the simple 3-button "choose outcome"
 * picker with a realistic payment flow:
 *
 *   • UPI      — test UPI IDs that determine the outcome
 *   • Card     — industry-standard test card numbers
 *   • Net Banking — simulated bank redirect
 *   • Wallets  — simulated wallet authorization
 *
 * No real credentials are collected.  All inputs are pre-filled with clearly
 * fictional test values and the UI is prominently labelled "TEST MODE".
 *
 * TEST VALUES (outcome determined by what the user enters)
 * ─────────────────────────────────────────────────────────
 * UPI IDs
 *   success@okaxis         → Payment succeeds
 *   failure@okaxis         → Payment declined
 *   pending@okaxis         → Simulates timeout (→ failed after delay)
 *   cancel@okaxis          → Payment cancelled
 *   anything else          → succeeds by default
 *
 * Card Numbers
 *   4111 1111 1111 1111    → Visa Test — Success
 *   5500 0000 0000 0004    → Mastercard Test — Success
 *   4000 0000 0000 0002    → Visa Test — Declined
 *   4000 0000 0000 9995    → Visa Test — Insufficient funds (failed)
 *   4000 0000 0000 0019    → Visa Test — Pending / timeout
 *   anything else          → success
 *
 * Net Banking / Wallets
 *   All test banks and wallets succeed by default.
 *
 * Developer Controls (always visible)
 *   Force any outcome regardless of the form values.
 */

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FlaskConical,
  Landmark,
  Loader2,
  Phone,
  RefreshCw,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatInrPaise } from "../lib/gstoreProductPrices";

// ── Types ─────────────────────────────────────────────────────────────────────

type MockPaymentMethod = "upi" | "card" | "netbanking" | "wallet";
type InternalOutcome = "success" | "failed" | "cancel" | "pending";

export type MockPaymentGatewayProps = {
  /** GST-inclusive total in paise (matches server-computed total). */
  totalMinor: number;
  /** e.g. "GVRZE-2026-0001" */
  orderNumber: string;
  /**
   * Called when the user completes or abandons the mock payment.
   * "pending" is not passed — it resolves to "failed" after the timeout
   * animation so the parent always receives a final outcome.
   */
  onOutcome: (outcome: "success" | "failed" | "cancel") => void;
};

// ── Test data ─────────────────────────────────────────────────────────────────

const UPI_QUICK_FILLS: { label: string; id: string; outcome: InternalOutcome }[] = [
  { label: "✓ Success",   id: "success@okaxis",   outcome: "success" },
  { label: "✗ Failure",   id: "failure@okaxis",   outcome: "failed"  },
  { label: "⟳ Timeout",   id: "pending@okaxis",   outcome: "pending" },
  { label: "← Cancel",    id: "cancel@okaxis",    outcome: "cancel"  },
];

const TEST_CARDS: { number: string; label: string; outcome: InternalOutcome }[] = [
  { number: "4111 1111 1111 1111", label: "Visa — Success",             outcome: "success" },
  { number: "5500 0000 0000 0004", label: "Mastercard — Success",        outcome: "success" },
  { number: "4000 0000 0000 0002", label: "Visa — Declined",             outcome: "failed"  },
  { number: "4000 0000 0000 9995", label: "Visa — Insufficient Funds",   outcome: "failed"  },
  { number: "4000 0000 0000 0019", label: "Visa — Pending / Timeout",    outcome: "pending" },
];

const MOCK_BANKS = [
  "State Bank of India (Test)",
  "HDFC Bank (Test)",
  "ICICI Bank (Test)",
  "Axis Bank (Test)",
  "Kotak Mahindra Bank (Test)",
  "Punjab National Bank (Test)",
  "Bank of Baroda (Test)",
  "Canara Bank (Test)",
  "Union Bank of India (Test)",
  "IndusInd Bank (Test)",
];

const MOCK_WALLETS: { id: string; label: string; emoji: string }[] = [
  { id: "paytm",   label: "Paytm Wallet (Test)",    emoji: "💙" },
  { id: "phonepe", label: "PhonePe (Test)",          emoji: "💜" },
  { id: "gpay",    label: "Google Pay (Test)",       emoji: "🔵" },
  { id: "amazon",  label: "Amazon Pay (Test)",       emoji: "🟡" },
  { id: "mobikwik",label: "MobiKwik (Test)",         emoji: "🟢" },
];

// ── Outcome helpers ───────────────────────────────────────────────────────────

function upiOutcome(id: string): InternalOutcome {
  const l = id.toLowerCase();
  if (l.includes("fail") || l.includes("declin")) return "failed";
  if (l.includes("pend"))                           return "pending";
  if (l.includes("cancel"))                         return "cancel";
  return "success";
}

function cardOutcome(raw: string): InternalOutcome {
  const digits = raw.replace(/[\s-]/g, "");
  if (digits === "4000000000000002") return "failed";
  if (digits === "4000000000009995") return "failed";
  if (digits === "4000000000000019") return "pending";
  return "success";
}

// ── Processing animation ──────────────────────────────────────────────────────

const STEPS_NORMAL: string[] = [
  "Initiating payment…",
  "Connecting to bank…",
  "Authenticating…",
  "Processing transaction…",
  "Confirming payment…",
];

const STEPS_REDIRECT: string[] = [
  "Redirecting to bank…",
  "Bank authentication in progress…",
  "Waiting for bank confirmation…",
  "Processing response…",
  "Finalising payment…",
];

// ── Helper components ─────────────────────────────────────────────────────────

function MethodTab({
  method, active, icon: Icon, label, onClick,
}: {
  method: MockPaymentMethod;
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all flex-1",
        active
          ? "bg-[#111827] text-white border-[#111827] shadow-sm"
          : "border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF] bg-white",
      )}
      aria-pressed={active}
    >
      <Icon className="w-4 h-4" strokeWidth={1.8} />
      {label}
    </button>
  );
}

function ProcessingOverlay({
  step, totalMinor, outcome, onDone,
}: {
  step: string;
  totalMinor: number;
  outcome: InternalOutcome;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"processing" | "timeout_wait" | "done">("processing");
  const [countdown, setCountdown] = useState(5);
  const doneFired = useRef(false);

  useEffect(() => {
    if (outcome === "pending") {
      // Simulate a "payment pending" state → times out after 2 s then countdown
      const t = setTimeout(() => setPhase("timeout_wait"), 2000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [outcome]);

  useEffect(() => {
    if (phase === "timeout_wait") {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [phase]);

  useEffect(() => {
    if (phase === "done" && !doneFired.current) {
      doneFired.current = true;
      onDone();
    }
  }, [phase, onDone]);

  if (phase === "timeout_wait") {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
        <p className="font-semibold text-[#111827] text-sm">Payment Pending</p>
        <p className="text-xs text-[#6B7280]">
          Waiting for bank confirmation…
          <br />
          <span className="text-amber-600 font-medium">Timing out in {countdown}s</span>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6 space-y-3">
      <div className="mx-auto w-14 h-14 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
      </div>
      <p className="font-semibold text-[#111827] text-sm">{step}</p>
      <p className="text-xs text-[#9CA3AF]">
        {formatInrPaise(totalMinor)} · {outcome === "success" ? "Payment authorised" : outcome === "failed" ? "Verifying…" : "Please wait…"}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MockPaymentGateway({
  totalMinor,
  orderNumber,
  onOutcome,
}: MockPaymentGatewayProps) {
  const [method, setMethod] = useState<MockPaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [internalOutcome, setInternalOutcome] = useState<InternalOutcome | null>(null);

  // UPI state
  const [upiId, setUpiId] = useState("success@okaxis");

  // Card state
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/26");
  const [cardCvv, setCardCvv] = useState("737");
  const [cardName, setCardName] = useState("TEST USER");

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState(MOCK_BANKS[0] ?? "");

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState<string>("paytm");

  // Format card number with spaces every 4 digits
  function handleCardNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    const spaced = digits.replace(/(.{4})/g, "$1 ").trimEnd();
    setCardNumber(spaced);
  }

  function handleExpiryChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  }

  // Run the processing animation then resolve the outcome
  async function runProcessing(outcome: InternalOutcome, steps: string[]) {
    setInternalOutcome(outcome);
    setProcessing(true);
    // Animate through steps
    for (const step of steps) {
      setProcessingStep(step);
      await new Promise<void>(r => setTimeout(r, 500));
    }
  }

  function handleProcessingDone() {
    setProcessing(false);
    // Map internal → external outcome (pending → failed with timeout)
    const external =
      internalOutcome === "success" ? "success"
      : internalOutcome === "cancel" ? "cancel"
      : "failed"; // covers "failed" and "pending" (timed-out)
    onOutcome(external);
  }

  async function handlePay() {
    let outcome: InternalOutcome;
    let steps: string[];

    switch (method) {
      case "upi":
        outcome = upiOutcome(upiId);
        steps   = STEPS_NORMAL;
        break;
      case "card":
        outcome = cardOutcome(cardNumber);
        steps   = STEPS_NORMAL;
        break;
      case "netbanking":
        outcome = "success"; // All mock banks succeed
        steps   = STEPS_REDIRECT;
        break;
      case "wallet":
        outcome = "success"; // All mock wallets succeed
        steps   = STEPS_NORMAL;
        break;
    }

    await runProcessing(outcome, steps);
  }

  function handleCancel() {
    onOutcome("cancel");
  }

  // Developer force controls
  async function forceOutcome(outcome: InternalOutcome) {
    await runProcessing(outcome, STEPS_NORMAL.slice(0, 3));
  }

  // ── Processing overlay ────────────────────────────────────────────────────

  if (processing && internalOutcome !== null) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Test Mode — No real charges
          </span>
        </div>
        <div className="px-5 py-2">
          <ProcessingOverlay
            step={processingStep}
            totalMinor={totalMinor}
            outcome={internalOutcome}
            onDone={handleProcessingDone}
          />
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">

      {/* ── TEST MODE banner ── */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Test Gateway — No real charges
          </span>
        </div>
        <span className="text-xs text-amber-600 font-medium hidden sm:block">{orderNumber}</span>
      </div>

      {/* ── Order amount ── */}
      <div className="px-5 pt-4 pb-3 border-b border-[#F3F4F6]">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[#6B7280]">Amount to simulate</span>
          <span className="font-bold text-lg text-[#111827]">{formatInrPaise(totalMinor)}</span>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          GST-inclusive · No real payment will be processed
        </p>
      </div>

      <div className="px-5 pt-4 pb-5 space-y-5">

        {/* ── Method tabs ── */}
        <div>
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2.5">
            Select Payment Method
          </p>
          <div className="flex gap-2">
            <MethodTab method="upi"       active={method === "upi"}        icon={Phone}     label="UPI"         onClick={() => setMethod("upi")} />
            <MethodTab method="card"      active={method === "card"}       icon={CreditCard} label="Card"       onClick={() => setMethod("card")} />
            <MethodTab method="netbanking" active={method === "netbanking"} icon={Landmark}  label="Net Banking" onClick={() => setMethod("netbanking")} />
            <MethodTab method="wallet"    active={method === "wallet"}     icon={Wallet}    label="Wallets"     onClick={() => setMethod("wallet")} />
          </div>
        </div>

        {/* ── UPI tab ── */}
        {method === "upi" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                UPI ID <span className="text-[#9CA3AF] font-normal">(test value)</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="success@okaxis"
                className="w-full border border-[#E5E7EB] focus:border-[#374151] focus:ring-2 focus:ring-[#111827]/8 focus:outline-none rounded-xl px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] transition-colors"
              />
            </div>

            {/* Quick fills */}
            <div>
              <p className="text-xs text-[#9CA3AF] mb-2">Quick fill test values:</p>
              <div className="flex flex-wrap gap-2">
                {UPI_QUICK_FILLS.map(qf => (
                  <button
                    key={qf.id}
                    type="button"
                    onClick={() => setUpiId(qf.id)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border transition-all font-medium",
                      upiId === qf.id
                        ? "bg-[#111827] text-white border-[#111827]"
                        : "border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF] bg-white",
                    )}
                  >
                    {qf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 text-xs text-[#6B7280] space-y-1">
              <p className="font-medium text-[#374151]">Test UPI IDs</p>
              <p><code className="bg-white px-1 rounded text-[10px] border border-[#E5E7EB]">success@okaxis</code> → Payment authorised</p>
              <p><code className="bg-white px-1 rounded text-[10px] border border-[#E5E7EB]">failure@okaxis</code> → Payment declined</p>
              <p><code className="bg-white px-1 rounded text-[10px] border border-[#E5E7EB]">pending@okaxis</code> → Simulates bank timeout</p>
              <p><code className="bg-white px-1 rounded text-[10px] border border-[#E5E7EB]">cancel@okaxis</code> → Payment cancelled</p>
            </div>
          </div>
        )}

        {/* ── Card tab ── */}
        {method === "card" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Card Number <span className="text-[#9CA3AF] font-normal">(test value)</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => handleCardNumberChange(e.target.value)}
                placeholder="4111 1111 1111 1111"
                maxLength={19}
                className="w-full border border-[#E5E7EB] focus:border-[#374151] focus:ring-2 focus:ring-[#111827]/8 focus:outline-none rounded-xl px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] font-mono tracking-wider transition-colors"
              />
            </div>

            {/* Quick card fill */}
            <div>
              <p className="text-xs text-[#9CA3AF] mb-2">Quick fill test cards:</p>
              <div className="space-y-1.5">
                {TEST_CARDS.map(tc => (
                  <button
                    key={tc.number}
                    type="button"
                    onClick={() => setCardNumber(tc.number)}
                    className={cn(
                      "w-full text-left text-xs px-3 py-2 rounded-lg border transition-all font-mono",
                      cardNumber === tc.number
                        ? "bg-[#111827] text-white border-[#111827]"
                        : "border-[#E5E7EB] text-[#374151] hover:border-[#9CA3AF] bg-white",
                    )}
                  >
                    <span className="tracking-wider">{tc.number}</span>
                    <span className={cn(
                      "ml-2 font-sans not-italic text-[10px]",
                      cardNumber === tc.number ? "text-white/70" : "text-[#9CA3AF]",
                    )}>
                      {tc.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-[#4B5563] mb-1.5">Expiry</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={e => handleExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full border border-[#E5E7EB] focus:border-[#374151] focus:ring-2 focus:ring-[#111827]/8 focus:outline-none rounded-xl px-3 py-3 text-sm text-[#111827] text-center font-mono transition-colors"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-[#4B5563] mb-1.5">CVV</label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="737"
                  maxLength={4}
                  className="w-full border border-[#E5E7EB] focus:border-[#374151] focus:ring-2 focus:ring-[#111827]/8 focus:outline-none rounded-xl px-3 py-3 text-sm text-[#111827] text-center font-mono transition-colors"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-[#4B5563] mb-1.5">Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase().slice(0, 26))}
                  placeholder="TEST USER"
                  className="w-full border border-[#E5E7EB] focus:border-[#374151] focus:ring-2 focus:ring-[#111827]/8 focus:outline-none rounded-xl px-3 py-3 text-xs text-[#111827] font-mono uppercase transition-colors"
                />
              </div>
            </div>

            <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              These test values are never sent to any real payment processor.
            </p>
          </div>
        )}

        {/* ── Net Banking tab ── */}
        {method === "netbanking" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1.5">
                Select Bank <span className="text-[#9CA3AF] font-normal">(all succeed in test mode)</span>
              </label>
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="w-full border border-[#E5E7EB] focus:border-[#374151] focus:ring-2 focus:ring-[#111827]/8 focus:outline-none rounded-xl px-4 py-3 text-sm text-[#111827] bg-white transition-colors"
              >
                {MOCK_BANKS.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-1">
              <p className="font-medium">Simulated Bank Redirect</p>
              <p>
                Clicking "Pay Now" will simulate a redirect to {selectedBank} and return
                with a successful payment confirmation. No real bank authentication occurs.
              </p>
            </div>
          </div>
        )}

        {/* ── Wallets tab ── */}
        {method === "wallet" && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#4B5563]">
              Select Wallet <span className="text-[#9CA3AF] font-normal">(all succeed in test mode)</span>
            </p>
            <div className="space-y-2">
              {MOCK_WALLETS.map(w => (
                <label
                  key={w.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedWallet === w.id
                      ? "border-[#111827] bg-[#F9FAFB]"
                      : "border-[#E5E7EB] hover:border-[#9CA3AF] bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="wallet"
                    value={w.id}
                    checked={selectedWallet === w.id}
                    onChange={() => setSelectedWallet(w.id)}
                    className="accent-[#111827]"
                  />
                  <span className="text-lg leading-none" aria-hidden="true">{w.emoji}</span>
                  <span className="text-sm text-[#374151] font-medium">{w.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#374151] hover:border-[#9CA3AF] hover:bg-[#F9FAFB] transition-all font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111827] text-white font-bold text-sm hover:bg-[#1F2937] active:bg-[#111827] transition-colors shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            Pay {formatInrPaise(totalMinor)}
          </button>
        </div>

        {/* ── Dev Tools ── */}
        <DevToolsPanel onForce={forceOutcome} />
      </div>
    </div>
  );
}

// ── Developer controls ────────────────────────────────────────────────────────

function DevToolsPanel({ onForce }: { onForce: (outcome: InternalOutcome) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-dashed border-amber-300 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700">Dev Controls — Force outcome</span>
        </div>
        <span className="text-amber-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 bg-amber-50 border-t border-amber-200 space-y-3">
          <p className="text-xs text-amber-700">
            Override the outcome regardless of test values entered above.
            Useful for scripted testing without changing form inputs.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { outcome: "success" as const, label: "✓ Force Success",  cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
                { outcome: "failed"  as const, label: "✗ Force Failure",  cls: "bg-red-500 hover:bg-red-600 text-white" },
                { outcome: "pending" as const, label: "⟳ Force Timeout",  cls: "bg-amber-500 hover:bg-amber-600 text-white" },
                { outcome: "cancel"  as const, label: "← Force Cancel",   cls: "bg-white hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]" },
              ] as const
            ).map(({ outcome, label, cls }) => (
              <button
                key={outcome}
                type="button"
                onClick={() => onForce(outcome)}
                className={cn("text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm", cls)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-amber-600">
            These controls are only visible in test mode (MOCK_PAYMENTS_ENABLED=true).
            They are never compiled into production builds where mock mode is disabled.
          </p>
        </div>
      )}
    </div>
  );
}
