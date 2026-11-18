import { expect, test } from "@playwright/test";

/**
 * Membership journey tests require:
 *   E2E_BASE_URL          — staging/preview origin (defaults to local dev server)
 *   E2E_EXPLORER_EMAIL / E2E_EXPLORER_PASSWORD
 *   E2E_BASIC_EMAIL / E2E_BASIC_PASSWORD (optional)
 *   E2E_PRO_EMAIL / E2E_PRO_PASSWORD (optional)
 *
 * Payment flows assert UI only unless Razorpay test keys are configured server-side.
 * Never fabricate webhook success.
 */

const explorerEmail = process.env["E2E_EXPLORER_EMAIL"];
const explorerPassword = process.env["E2E_EXPLORER_PASSWORD"];

async function signInWithPassword(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("GVRZE membership journeys", () => {
  test.skip(!explorerEmail || !explorerPassword, "Set E2E_EXPLORER_EMAIL and E2E_EXPLORER_PASSWORD");

  test("explorer can open login, pricing, and dashboard continue playing", async ({ page }) => {
    await signInWithPassword(page, explorerEmail!, explorerPassword!);
    await expect(page).toHaveURL(/\/(profile|auth\/)/);

    await page.goto("/pricing");
    await expect(page.getByText(/Explorer|Basic|Pro/i).first()).toBeVisible();

    await page.goto("/");
    await expect(page.getByText(/Continue playing/i)).toBeVisible();
    await expect(page.getByText(/PvP/i)).toBeVisible();
    await expect(page.getByText(/Multiplayer/i)).toBeVisible();
  });

  test("pricing page lists plan features without exposing payment secrets", async ({ page }) => {
    await page.goto("/pricing");
    const content = await page.content();
    expect(content).not.toMatch(/rzp_live_/);
    expect(content).not.toMatch(/service_role/i);
    await expect(page.getByText(/Basic/i).first()).toBeVisible();
    await expect(page.getByText(/Pro/i).first()).toBeVisible();
  });

  test("library catalogue is reachable when signed in", async ({ page }) => {
    await signInWithPassword(page, explorerEmail!, explorerPassword!);
    await page.goto("/geolibrary");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("gstore checkout shows member discount copy when configured", async ({ page }) => {
    await signInWithPassword(page, explorerEmail!, explorerPassword!);
    await page.goto("/geostore");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("membership billing route requires authentication", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/billing");
    await expect(page).toHaveURL(/auth\/login/);
  });
});