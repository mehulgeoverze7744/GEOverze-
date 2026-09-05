import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { usePreferencesStore, type ToggleKey } from "@/stores/preferencesStore";

/** Live switch bound to a persisted preference toggle. */
export function PrefSwitch({ toggle, label }: { toggle: ToggleKey; label: string }) {
  const checked = usePreferencesStore((s) => s.toggles[toggle]);
  const setToggle = usePreferencesStore((s) => s.setToggle);

  return (
    <Switch
      checked={checked}
      onCheckedChange={(value) => setToggle(toggle, value)}
      aria-label={label}
      className="data-[state=checked]:bg-bronze/70"
    />
  );
}

export const notAvailable = (what: string) =>
  toast(`${what} isn't available yet`, {
    description: "It activates once GEOverze accounts are backed by a server.",
  });
