import { memo, useLayoutEffect, useRef } from "react";

import "./community-vision.css";

const COMMUNITY_VISION_BG = "/assets/home/community-vision.jpg";

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Section 7 — Community & Vision with cinematic scroll parallax. */
export const CommunityVision = memo(function CommunityVision() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const eyebrow = eyebrowRef.current;
    const heading = headingRef.current;
    if (!section || !bg || !eyebrow || !heading) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const travel = mobile ? 8 : 12;
      const scale = mobile ? 1.06 : 1.08;

      ctx = gsap.context(() => {
        gsap.set(bg, { scale, yPercent: travel * -0.5 });
        gsap.set([eyebrow, heading], { opacity: 0, y: 22 });

        ScrollTrigger.create({
          trigger: section,
          start: "top 92%",
          end: "bottom 8%",
          scrub: mobile ? 0.7 : 0.95,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const reveal = clamp01((p - 0.08) / 0.42);
            const yPercent = (p - 0.5) * travel;

            bg.style.transform = `translate3d(0, ${yPercent.toFixed(3)}%, 0) scale(${scale.toFixed(4)})`;

            const eyebrowShift = 18 * (1 - clamp01(reveal / 0.85));
            const headingShift = 22 * (1 - clamp01((reveal - 0.08) / 0.85));

            eyebrow.style.opacity = String(clamp01(reveal / 0.75));
            eyebrow.style.transform = `translate3d(0, ${eyebrowShift.toFixed(2)}px, 0)`;

            heading.style.opacity = String(clamp01((reveal - 0.1) / 0.8));
            heading.style.transform = `translate3d(0, ${headingShift.toFixed(2)}px, 0)`;
          },
        });
      }, section);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="community-vision w-full"
      aria-labelledby="community-vision-heading"
    >
      <div className="community-vision__media" aria-hidden>
        <img
          ref={bgRef}
          src={COMMUNITY_VISION_BG}
          alt=""
          className="community-vision__image"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="community-vision__content">
        <p ref={eyebrowRef} className="community-vision__eyebrow eyebrow">
          Community &amp; vision
        </p>
        <h2
          ref={headingRef}
          id="community-vision-heading"
          className="community-vision__heading mx-auto mt-6 max-w-3xl font-light leading-[1.18] tracking-tight text-[clamp(1.6rem,3.4vw,2.6rem)]"
        >
          Building the world&rsquo;s most engaging geography learning community.
        </h2>
      </div>
    </section>
  );
});
