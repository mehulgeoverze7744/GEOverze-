import type { ReactNode } from "react";

import { ErrorState } from "./ErrorState";

/**
 * The one state machine every data-backed surface renders through.
 *
 * Pass the loading flag, the error and the emptiness test; pass the matching
 * skeleton and empty state. Once real queries land, callers hand it
 * `isLoading` / `error` from TanStack Query and nothing else changes.
 */
export function DataState({
  isLoading = false,
  error = null,
  isEmpty = false,
  skeleton,
  empty,
  onRetry,
  errorTitle,
  errorDescription,
  children,
}: {
  isLoading?: boolean;
  error?: Error | string | null;
  isEmpty?: boolean;
  skeleton?: ReactNode;
  empty?: ReactNode;
  onRetry?: () => void;
  errorTitle?: string;
  errorDescription?: string;
  children: ReactNode;
}) {
  if (isLoading) return <>{skeleton ?? null}</>;

  if (error) {
    const message = typeof error === "string" ? error : error.message;
    return (
      <ErrorState
        {...(errorTitle ? { title: errorTitle } : {})}
        description={errorDescription ?? message}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  if (isEmpty) return <>{empty ?? null}</>;

  return <>{children}</>;
}
