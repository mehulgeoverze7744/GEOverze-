import { Bookmark, Eye, FileEdit, Files, Star } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { LibraryStatsSummary } from "@/features/library/data";
import { num } from "@/lib/format";

export function LibraryStats({
  summary,
  state = "ready",
}: {
  summary: LibraryStatsSummary;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid columns={5} label="GEOlibrary statistics">
      <StatCard
        label="Total resources"
        value={num(summary.total)}
        icon={Files}
        hint={`${num(summary.archived)} archived`}
        state={state}
      />
      <StatCard
        label="Published"
        value={num(summary.published)}
        icon={Eye}
        hint={`${num(summary.pending)} pending review`}
        state={state}
      />
      <StatCard label="Drafts" value={num(summary.draft)} icon={FileEdit} state={state} />
      <StatCard
        label="Featured"
        value={num(summary.featured)}
        icon={Star}
        hint="Shown on the library home"
        state={state}
      />
      <StatCard
        label="Total views"
        value={num(summary.views)}
        icon={Bookmark}
        hint={`${num(summary.bookmarks)} bookmarks`}
        state={state}
      />
    </StatGrid>
  );
}
