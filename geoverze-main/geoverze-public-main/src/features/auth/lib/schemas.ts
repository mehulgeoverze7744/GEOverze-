/**
 * Zod schemas for every auth form. One module so validation rules stay
 * identical between screens and can be reused server-side later.
 */
import { z } from "zod";

import { isPasswordValid } from "./password";

const email = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Enter a valid email address" })
  .max(255, { message: "Email is too long" });

const strongPassword = z
  .string()
  .min(1, { message: "Password is required" })
  .max(72, { message: "Password is too long" })
  .refine(isPasswordValid, { message: "Password does not meet all requirements" });

const name = (field: string) =>
  z
    .string()
    .trim()
    .min(1, { message: `${field} is required` })
    .max(60, { message: `${field} must be under 60 characters` });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    firstName: name("First name"),
    lastName: name("Last name"),
    username: z
      .string()
      .trim()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(24, { message: "Username must be under 24 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, { message: "Letters, numbers and underscores only" }),
    email,
    password: strongPassword,
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
    country: z.string().min(1, { message: "Select your country" }),
    acceptTerms: z.literal(true, { message: "You must accept the Terms of Service" }),
    acceptPrivacy: z.literal(true, { message: "You must accept the Privacy Policy" }),
    newsletter: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/** Field-keyed error map produced from a failed parse. */
export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

export function collectErrors<T>(error: z.ZodError): FieldErrors<T> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) result[key] = issue.message;
  }
  return result as FieldErrors<T>;
}
