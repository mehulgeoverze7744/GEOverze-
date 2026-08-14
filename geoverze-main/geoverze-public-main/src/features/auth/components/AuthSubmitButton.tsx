import { Spinner } from "@/components/shared/Spinner";
import { GeoButton } from "@/components/shared/GeoButton";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Submit button with a built-in pending state.
 *
 * Keeps the label in place while a spinner replaces it, so the button never
 * changes size mid-request.
 */
export function AuthSubmitButton({
  pending,
  pendingLabel = "Working",
  children,
  className,
  disabled,
  ...props
}: ComponentProps<typeof GeoButton> & { pending?: boolean; pendingLabel?: string }) {
  return (
    <GeoButton
      type="submit"
      variant="primary"
      size="lg"
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={cn("w-full active:scale-[0.985]", className)}
      {...props}
    >
      {pending ? (
        <>
          <Spinner size="sm" label={pendingLabel} />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </GeoButton>
  );
}
