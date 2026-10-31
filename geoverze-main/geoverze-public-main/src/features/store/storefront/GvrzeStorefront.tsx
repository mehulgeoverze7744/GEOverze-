import "./storefront.css";

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { TryOnStudio } from "../tryon/TryOnStudio";
import { StorefrontBestSellers } from "./StorefrontBestSellers";
import { StorefrontBrandStatement } from "./StorefrontBrandStatement";
import { StorefrontCategories } from "./StorefrontCategories";
import { StorefrontFeatured } from "./StorefrontFeatured";
import { StorefrontHero } from "./StorefrontHero";
import { StorefrontNav } from "./StorefrontNav";

function readTryOnHash(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash.replace(/^#/, "") === "try-on";
}

/**
 * Gstore front page (/geostore), redesigned from the "thegvrze" Figma file.
 *
 * Everything is scoped to #gvrze-storefront. The site-wide navbar and
 * backdrop are hidden only while this page is mounted (see storefront.css);
 * the shared site footer stays visible so the store matches the homepage.
 */
export function GvrzeStorefront() {
  const [studioOpen, setStudioOpen] = useState(readTryOnHash);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setStudioOpen(readTryOnHash());
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useEffect(() => {
    if (!studioOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [studioOpen]);

  return (
    <div id="gvrze-storefront">
      <StorefrontNav />
      <StorefrontHero />
      <StorefrontBestSellers />
      <StorefrontCategories />
      <StorefrontFeatured />
      <StorefrontBrandStatement />
      {studioOpen ? (
        <TryOnStudio
          mode="overlay"
          onClose={() => {
            setStudioOpen(false);
            void navigate({ to: "/geostore", hash: "" });
          }}
        />
      ) : null}
    </div>
  );
}
