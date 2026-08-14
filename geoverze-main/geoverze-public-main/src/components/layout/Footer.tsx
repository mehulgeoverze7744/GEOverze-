import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { BrandMark } from "@/components/shared/BrandMark";
import { GeoButton } from "@/components/shared/GeoButton";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { footerNav, site, socialLinks } from "@/config/site";

const linkClass =
  "transition-colors motion-fast hover:text-bronze focus-visible:outline-none focus-visible:text-bronze";

const socialIcons: Record<string, LucideIcon> = {
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
};

export const Footer = memo(function Footer() {
  return (
    <footer className="relative mt-auto border-t border-bronze/12 bg-background pt-16 pb-10">
      <SectionContainer size="wide">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.4fr]">
          <div>
            <Link
              to="/"
              aria-label={`${site.name} home`}
              className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
            >
              <BrandMark size="lg" withWordmark />
            </Link>
            <p className="mt-6 flex flex-wrap items-center gap-3 text-[0.62rem] uppercase tracking-[0.3em] text-bronze/90">
              <span>{site.slogan}</span>
              <span className="text-bronze/90">/</span>
              <span>{site.tagline}</span>
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-foreground/50">
              Building the world&rsquo;s most engaging geography learning community — exploration,
              education and connection inside one cinematic universe.
            </p>

            <form
              className="mt-8 max-w-sm"
              onSubmit={(e) => {
                e.preventDefault();
                toast("Newsletter isn't live yet", {
                  description: "Sign-ups open when the platform launches publicly.",
                });
              }}
            >
              <label
                htmlFor="newsletter-email"
                className="block text-[0.62rem] uppercase tracking-[0.3em] text-bronze/90"
              >
                Dispatches
              </label>
              <p className="mt-3 text-sm leading-relaxed text-foreground/50">
                Occasional notes as the universe expands. No noise.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 rounded-full border border-bronze/20 bg-charcoal/50 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/50 transition-colors motion-fast focus:border-bronze/60 focus:outline-none focus:ring-2 focus:ring-bronze/20"
                />
                <GeoButton type="submit" variant="primary" size="sm" className="shrink-0">
                  Join
                </GeoButton>
              </div>
            </form>

            <div className="mt-8 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <span
                    key={social.label}
                    title={`${social.label} — coming soon`}
                    aria-label={`${social.label} — coming soon`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze/90"
                  >
                    {Icon ? <Icon className="h-4 w-4" strokeWidth={1.4} aria-hidden /> : null}
                  </span>
                );
              })}
            </div>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-bronze/90">
                  {group.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className={`text-sm text-foreground/50 ${linkClass}`}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-bronze/10 pt-8 text-[0.65rem] uppercase tracking-[0.26em] text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. {site.slogan}. {site.tagline}.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className={linkClass}>
              Privacy
            </Link>
            <Link to="/terms" className={linkClass}>
              Terms
            </Link>
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
});
