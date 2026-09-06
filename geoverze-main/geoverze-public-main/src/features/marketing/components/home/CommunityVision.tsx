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
  const copyRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const eyebrow = eyebrowRef.current;
    const heading = headingRef.current;
    const copy = copyRef.current;
    if (!section || !bg || !eyebrow || !heading || !copy) return;

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
      const enterScale = mobile ? 1.07 : 1.12;
      const settleScale = mobile ? 1.02 : 1.04;
      const enterShift = mobile ? 4 : 8;

      ctx = gsap.context(() => {
        gsap.set(bg, { scale: enterScale, yPercent: enterShift });
        gsap.set([eyebrow, heading, copy], { opacity: 0, y: 22 });

        ScrollTrigger.create({
          trigger: section,
          start: "top 92%",
          end: "bottom 8%",
          scrub: mobile ? 0.65 : 0.85,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const reveal = clamp01((p - 0.08) / 0.42);
            const settle = clamp01((p - 0.35) / 0.4);
            const exit = clamp01((p - 0.72) / 0.28);

            const scale = enterScale - (enterScale - settleScale) * settle;
            const yPercent = enterShift * (1 - settle) + exit * (mobile ? 3 : 5);

            bg.style.transform = `translate3d(0, ${yPercent.toFixed(3)}%, 0) scale(${scale.toFixed(4)})`;

            const eyebrowShift = 18 * (1 - clamp01(reveal / 0.85));
            const headingShift = 22 * (1 - clamp01((reveal - 0.08) / 0.85));
            const copyShift = 20 * (1 - clamp01((reveal - 0.18) / 0.85));

            eyebrow.style.opacity = String(clamp01(reveal / 0.75));
            eyebrow.style.transform = `translate3d(0, ${eyebrowShift.toFixed(2)}px, 0)`;

            heading.style.opacity = String(clamp01((reveal - 0.1) / 0.8));
            heading.style.transform = `translate3d(0, ${headingShift.toFixed(2)}px, 0)`;

            copy.style.opacity = String(clamp01((reveal - 0.22) / 0.78));
            copy.style.transform = `translate3d(0, ${copyShift.toFixed(2)}px, 0)`;
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
        <div className="community-vision__overlay" />
      </div>

      <div className="community-vision__content">
        <p ref={eyebrowRef} className="community-vision__eyebrow eyebrow">
          Community &amp; vision
        </p>
        <h2
          ref={headingRef}
          id="community-vision-heading"
          className="community-vision__heading mx-auto mt-6 max-w-3xl font-light leading-[1.18] tracking-tight text-foreground text-[clamp(1.6rem,3.4vw,2.6rem)]"
        >
          Building the world&rsquo;s most engaging geography learning community.
        </h2>
        <p
          ref={copyRef}
          className="community-vision__copy mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-foreground/50 md:text-base"
        >
          GEOverze exists for the curious — for anyone who has traced a coastline on a map and
          wanted to know more. Our mission is to connect exploration, education and community so
          that learning about Earth feels like travelling it.
        </p>
      </div>
    </section>
  );
});
