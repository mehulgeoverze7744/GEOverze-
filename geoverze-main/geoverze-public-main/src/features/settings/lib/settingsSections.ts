/** Settings section identifiers — maps to URL search `section`. */
export type SettingsSection =
  | "account"
  | "profile"
  | "appearance"
  | "region"
  | "notifications"
  | "privacy"
  | "security"
  | "billing"
  | "data";

export const SETTINGS_SECTIONS = new Set<string>([
  "account",
  "profile",
  "appearance",
  "region",
  "notifications",
  "privacy",
  "security",
  "billing",
  "data",
]);

export function isSettingsSection(value: string | undefined): value is SettingsSection {
  return Boolean(value && SETTINGS_SECTIONS.has(value));
}

export const SECTION_TITLES: Record<SettingsSection, string> = {
  account: "Account",
  profile: "Profile",
  appearance: "Appearance",
  region: "Language & region",
  notifications: "Notifications",
  privacy: "Privacy",
  security: "Security",
  billing: "Subscription",
  data: "Data & account",
};

export const SECTION_DESCRIPTIONS: Record<SettingsSection, string> = {
  account: "Your sign-in identity and account details.",
  profile: "How you appear to other explorers.",
  appearance: "Theme and visual preferences.",
  region: "Language and measurement preferences.",
  notifications: "Choose what GEOverze sends you.",
  privacy: "Visibility and data preferences.",
  security: "Password and account protection.",
  billing: "Your plan, credits and billing.",
  data: "Export or manage your account data.",
};

export const UNITS_LABELS = {
  metric: "Kilometres",
  imperial: "Miles",
} as const;

export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
};
