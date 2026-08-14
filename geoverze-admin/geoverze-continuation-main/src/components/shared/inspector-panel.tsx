import type { ReactNode } from "react";

import { SideDrawer, type SideDrawerProps } from "@/components/shared/side-drawer";

export type InspectorPanelProps = Omit<SideDrawerProps, "side" | "width" | "flush">;

/**
 * Read-only record inspector. Thin wrapper over `SideDrawer` so every
 * slide-over in the app shares one implementation, header and padding.
 */
export function InspectorPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: InspectorPanelProps) {
  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
    >
      {children}
    </SideDrawer>
  );
}

export function InspectorField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
