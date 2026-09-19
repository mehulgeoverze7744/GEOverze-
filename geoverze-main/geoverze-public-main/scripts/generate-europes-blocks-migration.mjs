import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blocksPath = join(root, "src/features/library/data/europes-smallest-states-blocks.ts");
const raw = readFileSync(blocksPath, "utf8");
const match = raw.match(/export const EUROPES_SMALLEST_STATES_BLOCKS[^=]*=\s*(\[[\s\S]*?\n\];)/);
if (!match) throw new Error("Could not parse blocks array");

const blocks = Function(`"use strict"; return (${match[1].slice(0, -1)})`)();

const RESOURCE_ID = "66cc187f-e761-47c7-a671-6d9889663ddd";

const REFERENCE_BLOCKS = new Set([
  "callout",
  "sizeComparison",
  "timeline",
  "stateGlance",
  "geoDiagram",
  "dualCompare",
  "profileStrip",
  "crossLinks",
]);

function dbKind(block) {
  return REFERENCE_BLOCKS.has(block.kind) ? "reference" : block.kind;
}

function toPayload(block) {
  if (REFERENCE_BLOCKS.has(block.kind)) {
    const { kind, ...rest } = block;
    return { blockType: kind, ...rest };
  }
  switch (block.kind) {
    case "heading":
      return { id: block.id, text: block.text };
    case "paragraph":
      return { text: block.text };
    case "list":
      return { items: [...block.items], ...(block.ordered ? { ordered: true } : {}) };
    case "quote":
      return {
        text: block.text,
        ...(block.attribution ? { attribution: block.attribution } : {}),
      };
    case "image":
      return {
        art: block.art,
        caption: block.caption,
        external_src: block.externalSrc,
        ...(block.credit ? { credit: block.credit } : {}),
      };
    case "facts":
      return {
        title: block.title,
        facts: block.facts.map((f) => ({ label: f.label, value: f.value })),
        ...(block.layout ? { layout: block.layout } : {}),
      };
    case "table":
      return {
        title: block.title,
        columns: [...block.columns],
        rows: block.rows.map((r) => [...r]),
      };
    case "didYouKnow":
      return block.items ? { items: [...block.items] } : { text: block.text };
    default:
      return block;
  }
}

const lines = [
  "-- Europe's smallest states — atlas-parchment editorial content",
  "",
  `update public.library_resources`,
  `set`,
  `  title = 'Europe''s Smallest States',`,
  `  dek = 'Six tiny countries, six very different stories of survival, sovereignty and identity.',`,
  `  read_time_minutes = 26,`,
  `  tags = array['europe','microstates','countries','vatican','history']`,
  `where id = '${RESOURCE_ID}';`,
  "",
  `delete from public.library_resource_blocks where resource_id = '${RESOURCE_ID}';`,
  "",
];

blocks.forEach((block, position) => {
  const payload = JSON.stringify(toPayload(block)).replace(/'/g, "''");
  lines.push(
    `insert into public.library_resource_blocks (id, resource_id, position, kind, payload)`,
    `values (gen_random_uuid(), '${RESOURCE_ID}', ${position}, '${dbKind(block)}', '${payload}'::jsonb);`,
    "",
  );
});

const out = join(root, "../../supabase/migrations/20260919120000_europes_smallest_states_parchment.sql");
writeFileSync(out, lines.join("\n"));
console.log("Wrote", out, "with", blocks.length, "blocks");
