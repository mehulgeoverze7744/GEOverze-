import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ContinueReadingCardMenuProps = {
  articleTitle: string;
  onRemove: () => void;
  className?: string;
};

/** Card overflow menu for Continue Reading dismiss actions. */
export function ContinueReadingCardMenu({
  articleTitle,
  onRemove,
  className,
}: ContinueReadingCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Options for ${articleTitle}`}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border border-bronze/25 bg-[oklch(0.12_0.006_60/0.88)] text-foreground/70 backdrop-blur transition-all motion-fast hover:border-bronze/45 hover:text-bronze-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
            className,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[12rem] border-bronze/20 bg-charcoal/95 text-foreground"
      >
        <DropdownMenuItem
          className="cursor-pointer text-sm text-foreground/85 focus:bg-bronze/10 focus:text-foreground"
          onSelect={onRemove}
        >
          Remove from Continue Reading
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
