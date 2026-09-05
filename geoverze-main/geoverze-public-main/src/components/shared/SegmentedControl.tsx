import { useCallback, useRef, type CSSProperties, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import "./styles/segmented-control.css";

export type SegmentedOption<T extends string> = {
  id: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Visual treatment for the sliding indicator. */
  variant?: "gold" | "bronze";
  /** Accessible label for the control group. */
  ariaLabel: string;
  className?: string;
  /** Stretch to full container width (four equal columns). */
  fullWidth?: boolean;
  /** Use tab semantics when panels are controlled elsewhere. */
  tabMode?: boolean;
  tabIdPrefix?: string;
  panelIdPrefix?: string;
};

/** Premium pill segmented control with sliding metallic indicator. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "bronze",
  ariaLabel,
  className,
  fullWidth = false,
  tabMode = false,
  tabIdPrefix = "geo-seg-tab",
  panelIdPrefix = "geo-seg-panel",
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  const focusOption = useCallback(
    (index: number) => {
      const clamped = (index + options.length) % options.length;
      const next = options[clamped];
      if (!next) return;
      onChange(next.id);
      buttonRefs.current[clamped]?.focus();
    },
    [onChange, options],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (options.length < 2) return;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusOption(activeIndex - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusOption(activeIndex + 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={cn("geo-segmented", fullWidth && "geo-segmented--full", className)}
      style={
        {
          "--geo-seg-active-index": activeIndex,
          "--geo-seg-count": options.length,
        } as CSSProperties
      }
      data-variant={variant}
      role={tabMode ? "tablist" : "group"}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      <span className="geo-segmented-indicator" aria-hidden="true" />
      {options.map((option, index) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role={tabMode ? "tab" : undefined}
            id={tabMode ? `${tabIdPrefix}-${option.id}` : undefined}
            aria-selected={tabMode ? active : undefined}
            aria-controls={tabMode ? `${panelIdPrefix}-${option.id}` : undefined}
            aria-pressed={tabMode ? undefined : active}
            data-active={active}
            onClick={() => onChange(option.id)}
            className="geo-segmented-option"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
