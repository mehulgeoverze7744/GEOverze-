import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  GeoButton,
  GlassCard,
  PageHeader,
  SectionContainer,
} from "@/components/shared";
import { AuthField } from "@/features/auth/components/AuthField";
import { contactChannels } from "../data/contact";

/** Contact page. Submission is intentionally inert until the mail module lands. */
export function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Send a signal"
        description="Partnerships, institution access, press or support — tell us what you need and we'll come back to you."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <AnimatedSection>
              <GlassCard strong className="p-8 md:p-10">
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast("Message routing isn't live yet", {
                      description: "The contact form connects in a later phase.",
                    });
                  }}
                >
                  <AuthField id="contact-name" label="Name" placeholder="Your name" />
                  <AuthField
                    id="contact-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                  />
                  <div className="space-y-2">
                    <label
                      htmlFor="contact-message"
                      className="block text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="What would you like to talk about?"
                      className="w-full resize-none rounded-xl border border-bronze/20 bg-charcoal/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/50 transition-colors focus:border-bronze/60 focus:outline-none focus:ring-2 focus:ring-bronze/20"
                    />
                  </div>
                  <GeoButton type="submit" variant="primary" size="lg" className="w-full">
                    Send message
                  </GeoButton>
                </form>
              </GlassCard>
            </AnimatedSection>

            <div className="space-y-5">
              {contactChannels.map((channel, i) => (
                <AnimatedSection key={channel.title} delay={i * 90}>
                  <GlassCard className="flex items-start gap-4 p-7">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bronze/30 bg-bronze/10 text-bronze">
                      <channel.icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-[0.66rem] uppercase tracking-[0.28em] text-bronze/90">
                        {channel.title}
                      </p>
                      <p className="mt-2 text-sm text-foreground/55">{channel.description}</p>
                    </div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>
    </PageShell>
  );
}
