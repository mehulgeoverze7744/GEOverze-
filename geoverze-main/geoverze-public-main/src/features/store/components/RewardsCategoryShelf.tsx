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
      <div className="flex items-center gap-3">
        <rewardsGroup.icon className="h-4 w-4 text-bronze" strokeWidth={1.6} />
        <h2 className="text-lg font-light tracking-tight text-foreground">{rewardsGroup.label}</h2>
        <p className="text-xs text-foreground/50">{rewardsGroup.blurb}</p>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </div>
    </AnimatedSection>
  );
}
