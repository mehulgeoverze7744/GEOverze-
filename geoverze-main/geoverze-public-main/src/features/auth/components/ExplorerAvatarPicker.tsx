import { AVATAR_CATEGORIES, findAvatar } from "@/features/auth/data/onboarding";
import { cn } from "@/lib/utils";

import { ExplorerAvatar } from "./ExplorerAvatar";

/**
 * Unified GVRZE avatar selector — explorer portraits plus legacy character presets.
 */
export function ExplorerAvatarPicker({
  selectedId,
  onSelect,
  preview = false,
  columns = "responsive",
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  preview?: boolean;
  columns?: "responsive" | "onboarding";
}) {
  const selected = selectedId ? findAvatar(selectedId) : null;

  return (
    <div className="space-y-6">
      {preview && selected ? (
        <div className="flex flex-col items-center gap-2">
          <ExplorerAvatar
            avatarId={selected.id}
            size="xl"
            alt={selected.label}
            priority
            bordered
          />
          <p className="text-[15px] font-medium text-[#1D1D1F]">{selected.label}</p>
        </div>
      ) : null}

      <div
        className={cn("space-y-6", columns === "onboarding" && "max-h-[min(52vh,28rem)] overflow-y-auto pr-0.5")}
        role="presentation"
      >
        {AVATAR_CATEGORIES.map((category) => {
          const options = category.avatarIds
            .map((id) => findAvatar(id))
            .filter((avatar): avatar is NonNullable<ReturnType<typeof findAvatar>> => Boolean(avatar));

          if (options.length === 0) return null;

          return (
            <section key={category.id} aria-labelledby={`avatar-cat-${category.id}`} className="space-y-3">
              <h3
                id={`avatar-cat-${category.id}`}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86868B]"
              >
                {category.label}
              </h3>
              <div
                role="radiogroup"
                aria-label={category.label}
                className={cn(
                  "grid grid-cols-2 gap-3 sm:grid-cols-4",
                  columns === "onboarding" && "sm:grid-cols-3",
                )}
              >
                {options.map((avatar) => {
                  const on = selectedId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onSelect(avatar.id)}
                      className={cn(
                        "ob-chip flex flex-col items-center gap-2 rounded-2xl p-2.5 sm:p-3",
                        "transition-all duration-200 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/35 focus-visible:ring-offset-2",
                        on ? "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]" : "hover:bg-white/70",
                      )}
                    >
                      <span
                        className={cn(
                          "transition-transform duration-200 ease-out",
                          on ? "scale-105" : "scale-100",
                        )}
                      >
                        <ExplorerAvatar
                          avatarId={avatar.id}
                          size="lg"
                          alt=""
                          selected={on}
                          bordered={!on}
                        />
                      </span>
                      <span
                        className={cn(
                          "text-center text-[12px] font-medium leading-snug",
                          on ? "text-[#1D1D1F]" : "text-[#86868B]",
                        )}
                      >
                        {avatar.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}