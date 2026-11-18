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
            !selected && "text-[#86868B]",
            error && "border-[#FF3B30]",
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <span aria-hidden="true">{selected.flag}</span>
                <span className="truncate text-[#1D1D1F]">{selected.name}</span>
              </>
            ) : (
              "Select your country"
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[#86868B] transition-transform duration-200",
              open && "rotate-180",
            )}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[16px] border border-[#E5E5EA] bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#86868B]"
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
                className="w-full rounded-[12px] border border-[#E5E5EA] bg-[#F5F5F7] py-2.5 pl-9 pr-3 text-[13px] text-[#1D1D1F] placeholder:text-[#86868B] outline-none focus:border-[#007AFF] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,122,255,0.16)]"
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
                <li className="px-3 py-4 text-center text-[13px] text-[#86868B]">
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
                          "flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-left text-[13px] transition-colors duration-150",
                          isActive ? "bg-[#F5F5F7] text-[#1D1D1F]" : "text-[#86868B]",
                        )}
                      >
                        <span aria-hidden="true">{country.flag}</span>
                        <span className="flex-1 truncate">{country.name}</span>
                        {isSelected ? (
                          <Check
                            className="h-3 w-3 text-[#007AFF]"
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
