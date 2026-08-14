import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { topicBySlug } from "../data/topics";

/** Hashtag-style topic chips. Known topics link to their topic page. */
export function TopicChips({
  topics,
  className,
}: {
  topics: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {topics.map((topic) => {
        const known = topicBySlug(topic);
        const label = `#${topic}`;
        return (
          <li key={topic}>
            {known ? (
              <Link
                to="/community/topic/$slug"
                params={{ slug: topic }}
                className="inline-flex rounded-full border border-bronze/20 px-2.5 py-1 text-[0.65rem] text-foreground/55 transition-[color,border-color] motion-snap hover:border-bronze/45 hover:text-bronze-glow"
              >
                {label}
              </Link>
            ) : (
              <span className="inline-flex rounded-full border border-foreground/10 px-2.5 py-1 text-[0.65rem] text-foreground/50">
                {label}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
