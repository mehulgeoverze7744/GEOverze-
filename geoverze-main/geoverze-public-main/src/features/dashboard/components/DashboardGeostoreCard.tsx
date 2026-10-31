import { Link } from "@tanstack/react-router";

import { merchProductById } from "@/features/marketing/data/geostoreMerch";
import { productImageForSlug } from "@/features/store/data/productImages";
import { productBySlug } from "@/features/store/data/products";
import { categoryById } from "@/features/store/data/taxonomy";
import { SF_ASSETS } from "@/features/store/storefront/storefront-assets";
import { storefrontTeeById } from "@/features/store/storefront/storefront-product-data";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { cn } from "@/lib/utils";

import "./dashboard-geostore-widget.css";

const SHOWCASE_SLUGS = [
  "midnight-black-tshirt",
  "hoodie-every-point-has-a-story",
  "crystal-earth-globe",
] as const;

type ShowcaseItem = {
  slug: string;
  name: string;
  categoryLabel: string;
  image: { src: string; alt: string };
  tone: string;
  fit: "contain" | "cover";
};

function resolveShowcaseItem(slug: string): ShowcaseItem | null {
  const tee = storefrontTeeById(slug);
  if (tee) {
    return {
      slug: tee.id,
      name: tee.name,
      categoryLabel: tee.categoryLabel,
      image: tee.image,
      tone: tee.tone,
      fit: "contain",
    };
  }

  const product = productBySlug(slug);
  const image = productImageForSlug(slug);
  if (!product || !image) return null;

  const merch = merchProductById(slug);
  const category = categoryById(product.category);

  return {
    slug: product.slug,
    name: product.name,
    categoryLabel: merch?.categoryLabel ?? (category?.label ?? product.category).toUpperCase(),
    image: { src: image.src, alt: image.alt },
    tone: "#f4f6f8",
    fit: product.category === "hoodies" ? "contain" : "cover",
  };
}

const SHOWCASE_ITEMS = SHOWCASE_SLUGS.map(resolveShowcaseItem).filter(
  (item): item is ShowcaseItem => item !== null,
);

/** Mini GVRZE Store widget — live credits plus real storefront merchandise. */
export function DashboardGeostoreCard({ className }: { className?: string }) {
  const credits = useProgressionStore(selectPlayer).credits;
  const creditLabel = Number.isFinite(credits) ? Math.max(0, credits).toLocaleString() : "0";

  return (
    <section
      className={cn("dashboard-geostore", className)}
      aria-labelledby="dashboard-geostore-heading"
    >
      <div className="dashboard-geostore__hero" aria-hidden="true">
        <img
          src={SF_ASSETS.hero.src}
          width={SF_ASSETS.hero.width}
          height={SF_ASSETS.hero.height}
          alt=""
          decoding="async"
          className="dashboard-geostore__hero-img"
        />
      </div>

      <div className="dashboard-geostore__grid">
        <div className="dashboard-geostore__copy">
          <p className="dashboard-geostore__label">GVRZE STORE</p>
          <h2 id="dashboard-geostore-heading" className="dashboard-geostore__title">
            Explore the GVRZE Store
          </h2>
          <p className="dashboard-geostore__dek">
            Discover exclusive drops, premium merchandise and rewards.
          </p>
          <p className="dashboard-geostore__credits">
            <span className="dashboard-geostore__credits-value">{creditLabel}</span>
            <span className="dashboard-geostore__credits-meta">GVRZE credits available</span>
          </p>
          <div className="dashboard-geostore__actions">
            <Link to="/geostore" className="dashboard-geostore__cta">
              VISIT GVRZE STORE
            </Link>
            <Link to="/geostore/rewards" className="dashboard-geostore__link">
              VIEW REWARDS
            </Link>
          </div>
        </div>

        <div className="dashboard-geostore__showcase">
          <ul className="dashboard-geostore__products">
            {SHOWCASE_ITEMS.map((item) => (
              <li key={item.slug} className="dashboard-geostore__product">
                <Link
                  to="/geostore/product/$slug"
                  params={{ slug: item.slug }}
                  className="dashboard-geostore__product-link"
                >
                  <span
                    className="dashboard-geostore__product-frame"
                    style={{ backgroundColor: item.tone }}
                  >
                    <img
                      src={item.image.src}
                      alt={item.image.alt}
                      loading="lazy"
                      decoding="async"
                      className={
                        item.fit === "contain"
                          ? "dashboard-geostore__product-img dashboard-geostore__product-img--contain"
                          : "dashboard-geostore__product-img"
                      }
                    />
                  </span>
                  <span className="dashboard-geostore__product-meta">
                    <span className="dashboard-geostore__product-cat">{item.categoryLabel}</span>
                    <span className="dashboard-geostore__product-name">{item.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/geostore/browse" className="dashboard-geostore__explore">
            EXPLORE COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
}
