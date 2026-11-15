import type { PostgrestError } from "@supabase/supabase-js";

export class AdminQueryError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AdminQueryError";
  }
}

export function throwOnError<T>(
  result: { data: T; error: PostgrestError | null },
  context: string,
): NonNullable<T> {
  if (result.error) {
    throw new AdminQueryError(`${context}: ${result.error.message}`, result.error.code);
  }
  if (result.data == null) {
    throw new AdminQueryError(`${context}: no data returned`);
  }
  return result.data;
}

export function formatAdminError(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
