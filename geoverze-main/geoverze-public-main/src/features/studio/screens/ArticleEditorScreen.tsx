import { Link } from "@tanstack/react-router";
import { Check, Eye, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared/GeoButton";
import { GeoInput, GeoSelect, GeoTextarea } from "@/components/shared/GeoField";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/stores/studioStore";
import { emptyArticle, emptyBlock, findArticle } from "../data/articles";
import { STUDIO_CATEGORIES } from "../data/creator";
import { BLOCK_LABEL, type ArticleBlock, type StudioArticle } from "../data/types";
import { CoverThumb } from "../components/CoverThumb";
import { StatusPill } from "../components/StatusPill";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatRelative } from "../lib/format";

const BLOCK_KINDS = Object.keys(BLOCK_LABEL) as (keyof typeof BLOCK_LABEL)[];

/** Block editor for long-form content. Structure-first, no rich-text surprises. */
export function ArticleEditorScreen({ articleId }: { articleId: string }) {
  const drafts = useStudioStore((s) => s.articleDrafts);
  const saveDraft = useStudioStore((s) => s.saveArticleDraft);

  const source = drafts[articleId] ?? findArticle(articleId) ?? emptyArticle();
  const [article, setArticle] = useState<StudioArticle>(source);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const patch = (next: Partial<StudioArticle>) => setArticle((a) => ({ ...a, ...next }));

  const patchBlock = (index: number, next: ArticleBlock) =>
    setArticle((a) => ({ ...a, blocks: a.blocks.map((b, i) => (i === index ? next : b)) }));

  const addBlock = (kind: ArticleBlock["kind"]) =>
    setArticle((a) => ({ ...a, blocks: [...a.blocks, emptyBlock(kind)] }));

  const removeBlock = (index: number) =>
    setArticle((a) => ({ ...a, blocks: a.blocks.filter((_, i) => i !== index) }));

  const move = (index: number, direction: -1 | 1) =>
    setArticle((a) => {
      const target = index + direction;
      if (target < 0 || target >= a.blocks.length) return a;
      const blocks = [...a.blocks];
      const x = blocks[index];
      const y = blocks[target];
      if (!x || !y) return a;
      blocks[index] = y;
      blocks[target] = x;
      return { ...a, blocks };
    });

  const save = () => {
    const stamped = { ...article, updatedAt: new Date().toISOString() };
    setArticle(stamped);
    saveDraft(stamped);
    setSavedNote(`Saved locally at ${new Date().toLocaleTimeString("en-US")}`);
  };

  const words = article.blocks.reduce((n, b) => {
    const text =
      "text" in b ? b.text : "items" in b ? b.items.join(" ") : "source" in b ? b.source : "";
    return n + text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  return (
    <StudioShell
      context={
        <div className="space-y-4">
          <StudioPanel>
            <StudioPanelHeader title="Publishing" hint="Placeholder — no backend yet" />
            <StatusPill status={article.status} />
            <p className="mt-2 text-[0.75rem] text-foreground/50">
              Edited {formatRelative(article.updatedAt)}
            </p>
            {savedNote ? (
              <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-[oklch(0.86_0.12_150)]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                {savedNote}
              </p>
            ) : null}
            <div className="mt-4 space-y-2">
              <GeoButton size="sm" variant="primary" className="w-full" onClick={save}>
                Save draft
              </GeoButton>
              <GeoButton size="sm" variant="secondary" className="w-full gap-2" disabled>
                <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Submit for review
              </GeoButton>
              <GeoButton size="sm" variant="ghost" className="w-full gap-2" disabled>
                <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Preview in GEOlibrary
              </GeoButton>
            </div>
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="Document" />
            <dl className="space-y-2.5 text-[0.8rem]">
              <div className="flex justify-between">
                <dt className="text-foreground/50">Blocks</dt>
                <dd className="tabular-nums text-foreground/80">{article.blocks.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/50">Words</dt>
                <dd className="tabular-nums text-foreground/80">{words}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/50">Read time</dt>
                <dd className="tabular-nums text-foreground/80">
                  {Math.max(1, Math.round(words / 200))} min
                </dd>
              </div>
            </dl>
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="Cover" />
            <CoverThumb artKey={article.coverKey} label={article.title} className="h-24 w-full" />
          </StudioPanel>
        </div>
      }
    >
      <StudioHeader
        eyebrow={articleId === "new" ? "New article" : "Article editor"}
        title={article.title || "Untitled article"}
        description="Compose in blocks: headings, paragraphs, lists, tables, fact boxes and references."
        actions={
          <GeoButton asChild size="sm" variant="ghost">
            <Link to="/studio/articles">Back to articles</Link>
          </GeoButton>
        }
      />

      <StudioPanel className="mb-4">
        <StudioPanelHeader title="Article details" />
        <div className="grid gap-4 [&>*]:min-w-0 md:grid-cols-2">
          <GeoInput
            id="article-title"
            label="Title"
            value={article.title}
            placeholder="How Long Is a Coastline?"
            onChange={(e) => patch({ title: e.target.value })}
          />
          <GeoSelect
            id="article-category"
            label="Category"
            value={article.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value })}
          >
            {STUDIO_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </GeoSelect>
          <GeoTextarea
            id="article-summary"
            label="Summary"
            rows={2}
            value={article.summary}
            placeholder="One sentence that earns the click."
            onChange={(e) => patch({ summary: e.target.value })}
            wrapperClassName="md:col-span-2"
          />
          <GeoInput
            id="article-tags"
            label="Tags"
            hint="Comma separated"
            value={article.tags.join(", ")}
            onChange={(e) =>
              patch({
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
          <GeoInput
            id="article-cover"
            label="Cover key"
            value={article.coverKey}
            onChange={(e) => patch({ coverKey: e.target.value })}
          />
        </div>
      </StudioPanel>

      <StudioPanel>
        <StudioPanelHeader title="Content blocks" hint="Reorder, edit or remove any block" />

        {article.blocks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-bronze/20 px-4 py-10 text-center text-[0.82rem] text-foreground/50">
            Empty document. Add your first block below.
          </p>
        ) : (
          <ol className="space-y-3">
            {article.blocks.map((block, i) => (
              <li key={block.id} className="rounded-lg border border-bronze/12 p-3.5">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="rounded-full border border-bronze/20 px-2 py-0.5 text-[0.66rem] uppercase tracking-[0.14em] text-bronze/90">
                    {BLOCK_LABEL[block.kind]}
                  </span>
                  <span className="text-[0.7rem] text-foreground/50">block {i + 1}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move block up"
                      onClick={() => move(i, -1)}
                      className="rounded px-1.5 py-0.5 text-[0.65rem] text-foreground/50 hover:text-bronze"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Move block down"
                      onClick={() => move(i, 1)}
                      className="rounded px-1.5 py-0.5 text-[0.65rem] text-foreground/50 hover:text-bronze"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      aria-label="Delete block"
                      onClick={() => removeBlock(i)}
                      className="rounded p-1 text-foreground/50 transition-colors hover:text-[oklch(0.84_0.15_25)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                </div>

                <BlockEditor block={block} index={i} onChange={patchBlock} />
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 border-t border-bronze/12 pt-4">
          <p className="mb-2 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
            Add block
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BLOCK_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => addBlock(kind)}
                className="flex items-center gap-1.5 rounded-md border border-bronze/15 px-2.5 py-1.5 text-[0.72rem] text-foreground/70 transition-colors hover:border-bronze/45 hover:text-bronze-glow"
              >
                <Plus className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                {BLOCK_LABEL[kind]}
              </button>
            ))}
          </div>
        </div>
      </StudioPanel>
    </StudioShell>
  );
}

const inputClass =
  "w-full rounded-lg border border-bronze/15 bg-[oklch(0.175_0.006_60)] px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-foreground/50 focus:border-bronze/50";

/** One editor per block kind. Intentionally plain-text — structure over styling. */
function BlockEditor({
  block,
  index,
  onChange,
}: {
  block: ArticleBlock;
  index: number;
  onChange: (index: number, next: ArticleBlock) => void;
}) {
  switch (block.kind) {
    case "heading":
      return (
        <div className="flex gap-2">
          <select
            aria-label="Heading level"
            value={block.level}
            onChange={(e) =>
              onChange(index, { ...block, level: Number(e.target.value) === 3 ? 3 : 2 })
            }
            className={cn(inputClass, "w-24 shrink-0")}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            aria-label="Heading text"
            value={block.text}
            placeholder="Section heading"
            onChange={(e) => onChange(index, { ...block, text: e.target.value })}
            className={inputClass}
          />
        </div>
      );
    case "paragraph":
    case "didyouknow":
      return (
        <textarea
          aria-label={BLOCK_LABEL[block.kind]}
          rows={3}
          value={block.text}
          placeholder={block.kind === "paragraph" ? "Write the paragraph…" : "A surprising fact…"}
          onChange={(e) => onChange(index, { ...block, text: e.target.value })}
          className={inputClass}
        />
      );
    case "fact":
      return (
        <div className="space-y-2">
          <input
            aria-label="Fact title"
            value={block.title}
            placeholder="Fact title"
            onChange={(e) => onChange(index, { ...block, title: e.target.value })}
            className={inputClass}
          />
          <textarea
            aria-label="Fact body"
            rows={2}
            value={block.text}
            placeholder="Fact body"
            onChange={(e) => onChange(index, { ...block, text: e.target.value })}
            className={inputClass}
          />
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[0.75rem] text-foreground/55">
            <input
              type="checkbox"
              checked={block.ordered}
              onChange={(e) => onChange(index, { ...block, ordered: e.target.checked })}
              className="h-3.5 w-3.5 accent-[oklch(0.68_0.09_62)]"
            />
            Numbered list
          </label>
          {block.items.map((item, i) => (
            <input
              key={i}
              aria-label={`List item ${i + 1}`}
              value={item}
              placeholder={`Item ${i + 1}`}
              onChange={(e) =>
                onChange(index, {
                  ...block,
                  items: block.items.map((x, xi) => (xi === i ? e.target.value : x)),
                })
              }
              className={inputClass}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(index, { ...block, items: [...block.items, ""] })}
            className="text-[0.72rem] text-bronze underline-offset-4 hover:underline"
          >
            Add item
          </button>
        </div>
      );
    case "image":
      return (
        <div className="flex flex-wrap items-center gap-3">
          <CoverThumb artKey={block.imageKey} className="h-16 w-24 shrink-0" />
          <div className="min-w-[12rem] flex-1 space-y-2">
            <input
              aria-label="Image key"
              value={block.imageKey}
              placeholder="Media library key"
              onChange={(e) => onChange(index, { ...block, imageKey: e.target.value })}
              className={inputClass}
            />
            <input
              aria-label="Image caption"
              value={block.caption}
              placeholder="Caption"
              onChange={(e) => onChange(index, { ...block, caption: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      );
    case "table":
      return (
        <div className="space-y-2">
          <input
            aria-label="Table columns"
            value={block.columns.join(" | ")}
            placeholder="Column A | Column B"
            onChange={(e) =>
              onChange(index, { ...block, columns: e.target.value.split("|").map((c) => c.trim()) })
            }
            className={inputClass}
          />
          {block.rows.map((row, ri) => (
            <input
              key={ri}
              aria-label={`Table row ${ri + 1}`}
              value={row.join(" | ")}
              placeholder="Cell | Cell"
              onChange={(e) =>
                onChange(index, {
                  ...block,
                  rows: block.rows.map((r, i) =>
                    i === ri ? e.target.value.split("|").map((c) => c.trim()) : r,
                  ),
                })
              }
              className={inputClass}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              onChange(index, { ...block, rows: [...block.rows, block.columns.map(() => "")] })
            }
            className="text-[0.72rem] text-bronze underline-offset-4 hover:underline"
          >
            Add row
          </button>
        </div>
      );
    case "reference":
    default:
      return (
        <div className="space-y-2">
          <input
            aria-label="Reference label"
            value={block.kind === "reference" ? block.label : ""}
            placeholder="Author, year"
            onChange={(e) =>
              block.kind === "reference" && onChange(index, { ...block, label: e.target.value })
            }
            className={inputClass}
          />
          <input
            aria-label="Reference source"
            value={block.kind === "reference" ? block.source : ""}
            placeholder="Publication or URL"
            onChange={(e) =>
              block.kind === "reference" && onChange(index, { ...block, source: e.target.value })
            }
            className={inputClass}
          />
        </div>
      );
  }
}
