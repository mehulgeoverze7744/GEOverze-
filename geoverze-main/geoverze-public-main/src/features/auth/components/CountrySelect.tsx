import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { COUNTRIES, findCountry } from "@/features/auth/data/countries";
import { cn } from "@/lib/utils";
import { AuthFieldFrame, authFieldClass } from "./AuthField";

/**
 * Searchable country selector.
 *
 * Hand-rolled listbox: button trigger, filter input, and full keyboard support
 * (arrows, Home/End, Enter, Escape) with roving `aria-activedescendant`.
 */
export function CountrySelect({
  id,
  value,
  onChange,
  label = "Country",
  error,
  required,
}: {
  id: string;
  value: string;
  onChange: (code: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = findCountry(value);
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (country) => country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const index = Math.max(
        0,
        COUNTRIES.findIndex((country) => country.code === value),
      );
      setActiveIndex(index);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const commit = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) commit(option.code);
    }
  };

  return (
    <AuthFieldFrame
      id={id}
      label={label}
      {...(error ? { error } : {})}
      {...(required ? { required } : {})}
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            authFieldClass,
            "flex items-center justify-between text-left",
            !selected && "text-foreground/50",
            error && "border-destructive/60",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <span aria-hidden="true">{selected.flag}</span>
                <span className="truncate text-foreground">{selected.name}</span>
              </>
            ) : (
              "Select your country"
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-foreground/50 transition-transform motion-fast",
              open && "rotate-180",
            )}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div className="glass-panel-strong absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-bronze/25 p-2 shadow-[var(--glow-bronze)]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/50"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-listbox`}
                aria-activedescendant={
                  options[activeIndex] ? `${id}-option-${options[activeIndex].code}` : undefined
                }
                aria-label="Search countries"
                placeholder="Search countries"
                className="w-full rounded-lg border border-bronze/15 bg-charcoal/60 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-foreground/50 outline-none focus:border-bronze/50 focus:ring-2 focus:ring-bronze/20"
              />
            </div>
            <ul
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              aria-label="Countries"
              className="mt-2 max-h-56 overflow-y-auto"
            >
              {options.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-foreground/50">
                  No countries match that search.
                </li>
              ) : (
                options.map((country, index) => {
                  const isActive = index === activeIndex;
                  const isSelected = country.code === value;
                  return (
                    <li key={country.code} role="none">
                      <button
                        type="button"
                        id={`${id}-option-${country.code}`}
                        role="option"
                        aria-selected={isSelected}
                        data-active={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => commit(country.code)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors motion-fast",
                          isActive ? "bg-bronze/15 text-foreground" : "text-foreground/65",
                        )}
                      >
                        <span aria-hidden="true">{country.flag}</span>
                        <span className="flex-1 truncate">{country.name}</span>
                        {isSelected ? (
                          <Check
                            className="h-3 w-3 text-bronze"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </AuthFieldFrame>
  );
}
