import { AnimatedSection } from "@/components/shared";

import { CategoryTile } from "./CategoryTile";
import { STORE_CATEGORIES, STORE_GROUPS } from "../data/taxonomy";

const rewardsGroup = STORE_GROUPS.find((group) => group.id === "rewards");

/** Reward category cards (avatars, badges, frames, themes, boosts). */
export function RewardsCategoryShelf({ className }: { className?: string }) {
  if (!rewardsGroup) return null;

  const categories = STORE_CATEGORIES.filter((category) => category.group === "rewards");

  return (
    <AnimatedSection className={className}>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <rewardsGroup.icon className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.6} />
        <p className="text-sm font-light text-foreground/80">{rewardsGroup.label}</p>
        <p className="min-w-0 text-xs text-foreground/50">{rewardsGroup.blurb}</p>
      </div>
      <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryTile key={category.id} category={category} compact />
        ))}
      </div>
    </AnimatedSection>
  );
}
