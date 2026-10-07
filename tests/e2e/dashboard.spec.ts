import { expect, test } from "@playwright/test";

test("live-only UI shows missing data without providers or invented values", async ({ page }) => {
  const encode = (value: Record<string, unknown>) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const googleCredential = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ aud: "tradesense-test.apps.googleusercontent.com", iss: "https://accounts.google.com", exp: Math.floor(Date.now() / 1_000) + 3_600, sub: "e2e-google-user", email: "trader@example.com", email_verified: true, name: "Demo Trader" })}.test-signature`;
  await page.addInitScript(({ credential }) => {
    let callback: ((response: { credential: string }) => void) | undefined;
    Object.defineProperty(window, "google", { configurable: true, value: { accounts: { id: {
      initialize: (options: { callback: (response: { credential: string }) => void }) => { callback = options.callback; },
      renderButton: (parent: HTMLElement) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Sign in with Google";
        button.addEventListener("click", () => callback?.({ credential }));
        parent.append(button);
      },
      disableAutoSelect: () => undefined,
    } } } });
  }, { credential: googleCredential });
  await page.goto("/");
  await expect(page.getByText("missing data", { exact: true })).toBeVisible();
  await expect(page.getByText("MOCK DATA", { exact: false })).toHaveCount(0);
  await page.getByRole("button", { name: "Open Intelligence Dashboard" }).click();
  await expect(page.getByRole("button", { name: "Fake sign in · open demo" })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  await expect(page).toHaveURL(/\?view=dashboard$/);
  await expect(page.getByText("LIVE DATA", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to fixture/ })).toHaveCount(0);
  await expect(page.getByText("missing data", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Analyze & simulate" }).click();
  await expect(page.getByText(/missing data: RYO is not configured/)).toBeVisible();
  await expect(page.getByText("BLOCKED STALE PRICE", { exact: true })).toHaveCount(0);
});
