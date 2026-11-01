import { StorefrontCategoryCards } from "./StorefrontCategoryCards";
import { ExploreMoreLink, SF_SHELL, SF_UI_FONT } from "./storefront-ui";

/** Shop by category — the three Figma category cards, wired to the existing category shelves. */
export function StorefrontCategories() {
  return (
    <section
      id="collections"
      aria-labelledby="sf-categories"
      className="bg-white py-[clamp(40px,6vw,88px)]"
    >
      <div className={SF_SHELL}>
        <div className="flex items-center justify-between gap-4">
          <h2
            id="sf-categories"
            className={`text-[18px] font-semibold text-black md:text-[20px] ${SF_UI_FONT}`}
          >
            Shop By Category
          </h2>
          <ExploreMoreLink />
        </div>

        <StorefrontCategoryCards className="mt-[clamp(20px,3.2vw,46px)]" />
      </div>
    </section>
  );
}
