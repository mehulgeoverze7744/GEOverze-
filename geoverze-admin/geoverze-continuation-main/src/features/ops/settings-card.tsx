import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Card wrapper used by every settings section. The submit handler is the
 * single swap point for a persistence call once the backend exists.
 */
export function SettingsCard({
  title,
  description,
  children,
  saveLabel = "Save section",
  className,
}: {
  title: string;
  description?: string | undefined;
  children: ReactNode;
  saveLabel?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <form
      className={cn("space-y-4 rounded-lg border border-border bg-card p-4", className)}
      onSubmit={(event) => {
        event.preventDefault();
        toast.success(`${title} saved locally — persisted once the backend is connected.`);
      }}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
      <Button type="submit" size="sm">
        {saveLabel}
      </Button>
    </form>
  );
}

export function SettingsField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SettingsToggle({
  label,
  description,
  defaultChecked,
  onChange,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        defaultChecked={defaultChecked ?? false}
        aria-label={label}
        onCheckedChange={(checked) =>
          onChange
            ? onChange(checked)
            : toast.info(`${label} ${checked ? "enabled" : "disabled"} (local only).`)
        }
      />
    </div>
  );
}
