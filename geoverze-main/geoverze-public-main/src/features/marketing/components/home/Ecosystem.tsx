import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { memo, type SyntheticEvent } from "react";

import { SectionContainer } from "@/components/shared";

import type { HomeFeature } from "../../data/home";
import { ecosystem } from "../../data/home";
import { SectionIntro } from "./SectionIntro";

import "./ecosystem.css";

const FALLBACK_IMAGE = "/assets/home/ecosystem/fallback.jpg";

function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset.fallback === "1") {
    img.style.display = "none";
    img.parentElement?.classList.add("is-fallback");
    return;
  }
  img.dataset.fallback = "1";
  img.src = FALLBACK_IMAGE;
}

function EcosystemCard({ page }: { page: HomeFeature }) {
  return (
    <Link to={page.to} className="ecosystem-card" aria-label={`${page.title}: ${page.description}`}>
      <div className="ecosystem-card__media">
        <img
          src={page.imageSrc}
          alt={page.imageAlt}
          width={1200}
          height={900}
          loading="eager"
          decoding="async"
          className="ecosystem-card__img"
          style={{ objectPosition: page.imagePosition ?? "center center" }}
          onError={handleImageError}
        />
        <div className="ecosystem-card__overlay" aria-hidden />
      </div>
      <div className="ecosystem-card__content">
        <div className="ecosystem-card__copy">
          <h3>{page.title}</h3>
          <p>{page.description}</p>
        </div>
        <span className="ecosystem-card__go" aria-hidden>
          <ArrowUpRight strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  );
}

/** Section 5 — GVRZE Ecosystem. */
export const Ecosystem = memo(function Ecosystem() {
  return (
    <section className="ecosystem-section">
      <SectionContainer size="wide">
        <SectionIntro eyebrow="The ecosystem" title="One universe, many interconnected rooms" />
        <div className="ecosystem-grid" role="list" aria-label="GVRZE platform pages">
          {ecosystem.map((page) => (
            <div key={page.to} className="ecosystem-grid__item" role="listitem">
              <EcosystemCard page={page} />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
});
