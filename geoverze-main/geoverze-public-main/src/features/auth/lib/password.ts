/**
 * Password strength model shared by signup and reset.
 *
 * Pure functions only — no React, so the rules can move to the backend
 * unchanged when authentication is wired up.
 */

export type PasswordRuleId = "length" | "uppercase" | "lowercase" | "number" | "special";

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  test: (value: string) => boolean;
};

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "lowercase", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "One number", test: (v) => /\d/.test(v) },
  { id: "special", label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
] as const;

export type PasswordStrength = {
  /** Rules currently satisfied. */
  passed: PasswordRuleId[];
  /** 0–5. */
  score: number;
  /** Percentage for the meter. */
  percent: number;
  label: "Empty" | "Weak" | "Fair" | "Good" | "Strong";
  /** True once every rule passes. */
  valid: boolean;
};

export function evaluatePassword(value: string): PasswordStrength {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).map((rule) => rule.id);
  const score = passed.length;
  const label: PasswordStrength["label"] =
    value.length === 0
      ? "Empty"
      : score <= 2
        ? "Weak"
        : score === 3
          ? "Fair"
          : score === 4
            ? "Good"
            : "Strong";

  return {
    passed,
    score,
    percent: (score / PASSWORD_RULES.length) * 100,
    label,
    valid: score === PASSWORD_RULES.length,
  };
}

export function isPasswordValid(value: string) {
  return evaluatePassword(value).valid;
}
