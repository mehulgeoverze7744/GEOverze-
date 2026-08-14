import { type ComponentProps, useId, useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { PASSWORD_RULES, evaluatePassword } from "@/features/auth/lib/password";
import { AuthFieldFrame, authFieldClass } from "./AuthField";

/** Password input with show/hide toggle. */
export function PasswordField({
  id,
  label,
  hint,
  error,
  className,
  required,
  ...props
}: Omit<ComponentProps<"input">, "type"> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <AuthFieldFrame
      id={id}
      {...(label ? { label } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(required ? { required } : {})}
    >
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(
            authFieldClass,
            "pr-12",
            error && "border-destructive/60 focus:ring-destructive/25",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-foreground/50 transition-colors motion-fast hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
          )}
        </button>
      </div>
    </AuthFieldFrame>
  );
}

const METER_TONE = [
  "bg-destructive/70",
  "bg-destructive/70",
  "bg-bronze/40",
  "bg-bronze/70",
  "bg-bronze",
  "bg-bronze-glow",
] as const;

/** Live strength meter plus animated requirement checklist. */
export function PasswordStrengthMeter({ value, className }: { value: string; className?: string }) {
  const strength = evaluatePassword(value);
  const listId = useId();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-4">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-charcoal/70"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={PASSWORD_RULES.length}
          aria-valuenow={strength.score}
          aria-label="Password strength"
        >
          <span
            className={cn(
              "block h-full rounded-full transition-all motion-base motion-reduce:transition-none",
              METER_TONE[strength.score],
            )}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
        <span
          aria-live="polite"
          className={cn(
            "w-16 text-right text-[0.62rem] uppercase tracking-[0.24em]",
            strength.valid ? "text-bronze-glow" : "text-foreground/50",
          )}
        >
          {strength.label === "Empty" ? "" : strength.label}
        </span>
      </div>

      <ul id={listId} className="grid gap-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const passed = strength.passed.includes(rule.id);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-2 text-[0.7rem] transition-colors motion-fast motion-reduce:transition-none",
                passed ? "text-bronze-glow" : "text-foreground/50",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all motion-base motion-reduce:transition-none",
                  passed ? "scale-100 border-bronze/60 bg-bronze/20" : "scale-95 border-bronze/15",
                )}
              >
                {passed ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={2.4} aria-hidden="true" />
                ) : (
                  <X className="h-2.5 w-2.5 opacity-40" strokeWidth={2} aria-hidden="true" />
                )}
              </span>
              <span>{rule.label}</span>
              <span className="sr-only">{passed ? " — met" : " — not met"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
