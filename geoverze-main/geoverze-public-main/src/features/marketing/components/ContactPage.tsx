import { type FormEvent, useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { contactChannels } from "../data/contact";
import "../styles/contact.css";

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>;

const EMPTY_FORM: ContactFormState = { name: "", email: "", message: "" };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(values: ContactFormState): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email.";
  else if (!isValidEmail(values.email.trim())) errors.email = "Please enter a valid email.";
  if (!values.message.trim()) errors.message = "Please write a message.";
  return errors;
}

/** Contact page. Submission stays inert until the mail module lands. */
export function ContactPage() {
  const [values, setValues] = useState<ContactFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    toast("Message routing isn't live yet", {
      description: "The contact form connects in a later phase.",
    });
  }

  return (
    <PageShell>
      <SectionContainer className="ct">
        <Breadcrumb
          items={[{ label: "Home", to: "/" }, { label: "Contact" }]}
          className="ct-crumb"
        />

        <header className="ct-header">
          <p className="ct-kicker">Contact</p>
          <h1 className="ct-title">Let's talk.</h1>
          <p className="ct-lede">
            Partnerships, institutions, press, support, or anything GEOverze — send us a message and
            we'll get back to you.
          </p>
        </header>

        <div className="ct-layout">
          <article className="ct-card">
            <h2 className="ct-card-title">Send us a message</h2>
            <p className="ct-card-copy">Tell us what you're working on.</p>

            <form className="ct-form" onSubmit={handleSubmit} noValidate>
              <div className="ct-field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={values.name}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, name: event.target.value }));
                    if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                  }}
                />
                {errors.name ? (
                  <p id="contact-name-error" className="ct-error" role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="ct-field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={values.email}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, email: event.target.value }));
                    if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                  }}
                />
                {errors.email ? (
                  <p id="contact-email-error" className="ct-error" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="ct-field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="What would you like to talk about?"
                  value={values.message}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, message: event.target.value }));
                    if (errors.message) {
                      setErrors((current) => ({ ...current, message: undefined }));
                    }
                  }}
                />
                {errors.message ? (
                  <p id="contact-message-error" className="ct-error" role="alert">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <button type="submit" className="ct-submit">
                Send Message
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </article>

          <aside className="ct-options">
            <p className="ct-options-kicker">Contact options</p>
            <ul className="ct-group">
              {contactChannels.map((channel) => (
                <li key={channel.id}>
                  <a href={channel.href} className="ct-row">
                    <span className="ct-row-icon" aria-hidden="true">
                      {channel.emoji}
                    </span>
                    <span className="ct-row-copy">
                      <span className="ct-row-title">{channel.title}</span>
                      <span className="ct-row-meta">{channel.description}</span>
                    </span>
                    <ChevronRight className="ct-row-arrow" strokeWidth={1.75} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
