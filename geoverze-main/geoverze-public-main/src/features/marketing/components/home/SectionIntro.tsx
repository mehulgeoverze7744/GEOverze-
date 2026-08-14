import { memo } from "react";

import { AnimatedSection } from "@/components/shared";

/** Shared eyebrow + heading + copy block used by every home section. */
export const SectionIntro = memo(function SectionIntro({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <AnimatedSection className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-light leading-[1.08] tracking-tight text-foreground text-[clamp(1.8rem,3.6vw,2.8rem)]">
        {title}
      </h2>
      {copy ? (
        <p className="mt-5 text-sm leading-relaxed text-foreground/55 md:text-base">{copy}</p>
      ) : null}
    </AnimatedSection>
  );
});
