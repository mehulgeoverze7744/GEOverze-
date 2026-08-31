import type { Enums } from "@/lib/supabase/database.types";
import { isLibraryMediaPath } from "@/lib/supabase/library-media";

export type CanonicalBlock = {
  kind: Enums<"library_block_kind">;
  payload: Record<string, unknown>;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Convert Admin Markdown body to canonical library_resource_blocks rows. */
export function markdownToBlocks(markdown: string): CanonicalBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: CanonicalBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushParagraph = () => {
    const text = paragraph.join("\n").trim();
    if (text) blocks.push({ kind: "paragraph", payload: { text } });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({
      kind: "list",
      payload: { items: listItems, ordered: listOrdered },
    });
    listItems = [];
    listOrdered = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      flushList();
      flushParagraph();
      continue;
    }

    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flushList();
      flushParagraph();
      const text = heading[1]!.trim();
      blocks.push({
        kind: "heading",
        payload: { id: slugifyHeading(text), text },
      });
      continue;
    }

    const quote = trimmed.match(/^>\s?(.+)$/);
    if (quote) {
      flushList();
      flushParagraph();
      blocks.push({ kind: "quote", payload: { text: quote[1]!.trim() } });
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushList();
      flushParagraph();
      const caption = image[1]!.trim();
      const src = image[2]!.trim();
      const payload: Record<string, unknown> = { caption, art: src };
      if (isLibraryMediaPath(src)) payload.storage_path = src;
      blocks.push({ kind: "image", payload });
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      if (listItems.length > 0 && listOrdered) flushList();
      listOrdered = false;
      listItems.push(unordered[1]!.trim());
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (listItems.length > 0 && !listOrdered) flushList();
      listOrdered = true;
      listItems.push(ordered[1]!.trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushList();
  flushParagraph();
  return blocks;
}

/** Convert canonical blocks back to Markdown for the Admin editor. */
export function blocksToMarkdown(blocks: readonly CanonicalBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.kind) {
      case "heading": {
        const text = String(block.payload.text ?? "");
        const id = String(block.payload.id ?? slugifyHeading(text));
        parts.push(`## ${text}`, "");
        if (id && id !== slugifyHeading(text)) {
          /* id preserved in payload only */
        }
        break;
      }
      case "paragraph":
        parts.push(String(block.payload.text ?? ""), "");
        break;
      case "list": {
        const items = (block.payload.items as string[] | undefined) ?? [];
        const ordered = Boolean(block.payload.ordered);
        for (const [index, item] of items.entries()) {
          parts.push(ordered ? `${index + 1}. ${item}` : `- ${item}`);
        }
        parts.push("");
        break;
      }
      case "quote": {
        const text = String(block.payload.text ?? "");
        const attribution = block.payload.attribution
          ? `\n— ${String(block.payload.attribution)}`
          : "";
        parts.push(`> ${text}${attribution}`, "");
        break;
      }
      case "image": {
        const art = String(block.payload.storage_path ?? block.payload.art ?? "image");
        parts.push(`![${String(block.payload.caption ?? "Image")}](${art})`, "");
        break;
      }
      case "map":
        parts.push(
          `[map:${String(block.payload.region ?? "region")}] ${String(block.payload.caption ?? "")}`,
          "",
        );
        break;
      case "facts": {
        const title = String(block.payload.title ?? "Facts");
        const facts = (block.payload.facts as { label: string; value: string }[] | undefined) ?? [];
        parts.push(`### ${title}`, "");
        for (const fact of facts) {
          parts.push(`- **${fact.label}:** ${fact.value}`);
        }
        parts.push("");
        break;
      }
      case "didYouKnow":
        parts.push(`> Did you know: ${String(block.payload.text ?? "")}`, "");
        break;
      case "table":
      case "reference":
        parts.push(`[${block.kind}] ${JSON.stringify(block.payload)}`, "");
        break;
      default:
        parts.push(JSON.stringify(block.payload), "");
    }
  }

  return parts.join("\n").trim();
}
