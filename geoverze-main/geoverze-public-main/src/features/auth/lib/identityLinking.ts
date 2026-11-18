/**
 * Product policy for automatic identity linking.
 *
 * Linking is performed by Supabase Auth when the Google provider is enabled,
 * automatic linking is on, and sign-in uses signInWithIdToken (GIS) or OAuth.
 * This module does not merge accounts, match
 * emails in the browser, or call the service role.
 */
export type IdentityLinkingScenario =
  | "verified_email_password_same_google_email"
  | "unverified_email_password_same_google_email"
  | "new_google_email"
  | "returning_google_user"
  | "google_email_different_from_existing_account";

export type IdentityLinkingOutcome = {
  sameUserId: boolean;
  createsNewUser: boolean;
  attachesGoogleIdentity: boolean;
  requiresDashboardAutomaticLinking: boolean;
  preservesCreditsMembershipOrders: boolean;
  notes: string;
};

export function expectedAutomaticLinkingOutcome(
  scenario: IdentityLinkingScenario,
): IdentityLinkingOutcome {
  switch (scenario) {
    case "verified_email_password_same_google_email":
      return {
        sameUserId: true,
        createsNewUser: false,
        attachesGoogleIdentity: true,
        requiresDashboardAutomaticLinking: true,
        preservesCreditsMembershipOrders: true,
        notes:
          "Supabase attaches the Google identity to the existing verified email user when automatic linking is enabled. UUID, profile, credits, membership and orders stay on that user.",
      };
    case "unverified_email_password_same_google_email":
      return {
        sameUserId: false,
        createsNewUser: true,
        attachesGoogleIdentity: false,
        requiresDashboardAutomaticLinking: true,
        preservesCreditsMembershipOrders: true,
        notes:
          "Unverified email/password accounts must not receive a Google identity automatically. Google creates a separate user until the original email is confirmed.",
      };
    case "new_google_email":
      return {
        sameUserId: false,
        createsNewUser: true,
        attachesGoogleIdentity: true,
        requiresDashboardAutomaticLinking: false,
        preservesCreditsMembershipOrders: true,
        notes: "A new Google email creates a new auth user. handle_new_user inserts profile, role and progression once.",
      };
    case "returning_google_user":
      return {
        sameUserId: true,
        createsNewUser: false,
        attachesGoogleIdentity: false,
        requiresDashboardAutomaticLinking: false,
        preservesCreditsMembershipOrders: true,
        notes: "A returning Google identity resolves to the same user. Profile rows are not replaced.",
      };
    case "google_email_different_from_existing_account":
      return {
        sameUserId: false,
        createsNewUser: true,
        attachesGoogleIdentity: true,
        requiresDashboardAutomaticLinking: false,
        preservesCreditsMembershipOrders: true,
        notes:
          "A Google address that does not match an existing verified email is a separate account. No client-side email merge is allowed.",
      };
  }
}
