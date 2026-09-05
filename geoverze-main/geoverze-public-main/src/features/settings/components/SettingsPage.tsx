import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { isSettingsSection } from "@/features/settings/lib/settingsSections";

import { SettingsDetail } from "./SettingsDetail";
import { SettingsHome } from "./SettingsHome";
import "../styles/settings.css";

const routeApi = getRouteApi("/_app/settings");

/**
 * Product-style settings — grouped landing with focused detail views.
 *
 * Presentation preferences persist locally via preferencesStore.
 * Account-bound rows preserve existing placeholder behaviour.
 */
export function SettingsPage() {
  const { section } = routeApi.useSearch();
  const navigate = useNavigate({ from: "/settings" });

  useEffect(() => {
    if (section && !isSettingsSection(section)) {
      void navigate({ search: { section: undefined }, replace: true });
    }
  }, [navigate, section]);

  const showDetail = isSettingsSection(section);

  return (
    <PageShell>
      <SectionContainer size="default" className="settings-page mx-auto max-w-[56rem]">
        {!showDetail ? (
          <>
            <header className="settings-header">
              <AnimatedSection>
                <p className="settings-eyebrow">Settings</p>
                <h1 className="settings-title">Make GEOverze yours.</h1>
                <p className="settings-description">
                  Manage your account, experience and preferences.
                </p>
              </AnimatedSection>
            </header>
            <SettingsHome />
          </>
        ) : (
          <SettingsDetail section={section} />
        )}
      </SectionContainer>
    </PageShell>
  );
}
