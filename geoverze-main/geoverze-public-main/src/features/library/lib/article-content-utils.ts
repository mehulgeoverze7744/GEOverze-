import type { ArticleBlock } from "@/features/library/data/articles";

const WORDS_PER_MINUTE = 220;

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function estimateReadingMinutes(blocks: readonly ArticleBlock[]): number {
  let words = 0;
  for (const block of blocks) {
    switch (block.kind) {
      case "paragraph":
      case "quote":
        words += block.text.split(/\s+/).length;
        break;
      case "list":
        words += block.items.join(" ").split(/\s+/).length;
        break;
      case "callout":
      case "didYouKnow":
        words += (block.text ?? "").split(/\s+/).length;
        if ("items" in block && block.items) {
          words += block.items.join(" ").split(/\s+/).length;
        }
        break;
      case "heading":
        words += block.text.split(/\s+/).length;
        break;
      case "facts":
        words += block.facts
          .map((f) => `${f.label} ${f.value}`)
          .join(" ")
          .split(/\s+/).length;
        break;
      case "timeline":
        words += block.events
          .map((e) => `${e.date} ${e.text}`)
          .join(" ")
          .split(/\s+/).length;
        break;
      default:
        break;
    }
  }
  return Math.max(5, Math.round(words / WORDS_PER_MINUTE));
}

export function editorialClosing(params: {
  conclusion: string;
  remember?: string;
  quizTopic: string;
}): readonly ArticleBlock[] {
  const blocks: ArticleBlock[] = [
    { kind: "heading", id: "conclusion", text: "Conclusion" },
    { kind: "paragraph", text: params.conclusion },
  ];
  if (params.remember) {
    blocks.push({
      kind: "callout",
      variant: "key-idea",
      text: params.remember,
    });
  }
  blocks.push({
    kind: "didYouKnow",
    text: `Figures and place names in this feature align with GEOlibrary datasets used in Let's Play ${params.quizTopic} questions — reading here sharpens map and quiz accuracy.`,
  });
  return blocks;
}
