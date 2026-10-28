/**
 * Confirmed legal details, plus placeholders that must stay unpublished
 * until the business confirms them.
 *
 * Do not fill a null field with a guessed company name, address, phone
 * number, shipping promise, or refund deadline.
 */

export const legalConfig = {
  serviceName: "GVRZE",
  siteUrl: "https://geoverze.com",
  /**
   * Published on the contact page as the general address. The on-site
   * contact form does not deliver messages yet, so this email is the
   * working support route.
   */
  supportEmail: "hello@geoverze.com",
  /**
   * TODO: Confirm a dedicated privacy contact. Until then, privacy
   * questions use the published support email.
   */
  privacyEmail: "hello@geoverze.com",
  /**
   * TODO: Confirm the contracting legal entity before publication.
   * Do not present a proposed company as already incorporated.
   */
  entityName: null as string | null,
  /** TODO: Confirm a registered or business address. */
  address: null as string | null,
  /** TODO: Confirm a customer-support telephone number. None is published. */
  supportPhone: null as string | null,
  /** TODO: Confirm order-processing time. Not an operational commitment. */
  processingTime: null as string | null,
  /** TODO: Confirm delivery ranges by destination. Not a delivery guarantee. */
  deliveryEstimate: null as string | null,
  /**
   * Proposed window for reporting visible damage or a wrong item.
   * Pending business confirmation. It does not remove statutory rights.
   */
  defectReportWindow: "48 hours after delivery",
  /** Proposed governing law, subject to legal review. */
  governingLaw: "India",
  effectiveDate: "28 October 2026",
  lastUpdated: "28 October 2026",
} as const;

export const legalRoutes = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/refund-policy", label: "Refund & Replacement Policy" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/terms-of-service", label: "Terms of Service" },
] as const;

export type LegalRoute = (typeof legalRoutes)[number]["to"];
