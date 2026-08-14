import { Fragment } from "react";

export interface HighlightProps {
  text: string;
  query?: string | undefined;
  className?: string | undefined;
}

/** Renders `text` with every case-insensitive occurrence of `query` marked. */
export function Highlight({ text, query, className }: HighlightProps) {
  const needle = query?.trim();
  if (!needle) return <span className={className}>{text}</span>;

  const lower = text.toLowerCase();
  const target = needle.toLowerCase();
  const parts: { value: string; match: boolean }[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const index = lower.indexOf(target, cursor);
    if (index === -1) {
      parts.push({ value: text.slice(cursor), match: false });
      break;
    }
    if (index > cursor) parts.push({ value: text.slice(cursor, index), match: false });
    parts.push({ value: text.slice(index, index + target.length), match: true });
    cursor = index + target.length;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => (
        <Fragment key={`${part.value}-${i}`}>
          {part.match ? (
            <mark className="rounded-[2px] bg-primary/25 px-0.5 text-foreground">{part.value}</mark>
          ) : (
            part.value
          )}
        </Fragment>
      ))}
    </span>
  );
}
