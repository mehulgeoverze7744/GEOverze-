import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  rowsForSizes,
  sizeGuideKindForCategory,
  sizeGuideTitle,
  type SizeGuideKind,
} from "./sizeGuide";

type SizeGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizes: readonly string[];
  categorySlug?: string;
  kind?: SizeGuideKind;
};

export function SizeGuideDialog({
  open,
  onOpenChange,
  sizes,
  categorySlug = "tshirts",
  kind,
}: SizeGuideDialogProps) {
  const resolvedKind = kind ?? sizeGuideKindForCategory(categorySlug);
  const rows = rowsForSizes(sizes);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close size guide"
        className="absolute inset-0 bg-[rgb(23_35_53/0.35)] backdrop-blur-[6px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-size-guide-title"
        className="relative z-[1] flex max-h-[min(88dvh,720px)] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[18px] bg-white shadow-[0_24px_80px_rgb(23_35_53/0.22)] sm:rounded-[18px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="sf-size-guide-title"
              className="text-[16px] font-semibold tracking-tight text-black sm:text-[18px]"
            >
              {sizeGuideTitle(resolvedKind)}
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[#555]">
              Size mapping for GVRZE apparel. A factory measurement chart is not
              published in the catalogue yet — this is a fit reference only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black hover:bg-black/5"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 sm:px-6">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-[0.16em] text-[#888]">
                <th className="py-2 pr-3 font-semibold">Size</th>
                <th className="py-2 pr-3 font-semibold">Fit</th>
                <th className="py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.size} className="border-b border-black/6">
                  <td className="py-3 pr-3 font-semibold text-black">{row.size}</td>
                  <td className="py-3 pr-3 text-[#333]">{row.fit}</td>
                  <td className={cn("py-3 text-[#555]")}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[12px] leading-relaxed text-[#666]">
            Choose the size you usually wear. If you are between sizes, size up
            for a relaxed streetwear fit.
          </p>
        </div>
      </div>
    </div>
  );
}
