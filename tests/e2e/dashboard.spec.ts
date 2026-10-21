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
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  await page.screenshot({ path: "/tmp/tradesense-landing-light.png" });
  await expect(page.getByText("missing data", { exact: true })).toBeVisible();
  await expect(page.getByText("MOCK DATA", { exact: false })).toHaveCount(0);
  await page.getByRole("button", { name: "Open Intelligence Dashboard" }).click();
  await expect(page.getByRole("button", { name: "Fake sign in · open demo" })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  await expect(page).toHaveURL(/\?view=dashboard$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect.poll(() => page.locator("body").evaluate((el) => getComputedStyle(el).color)).toBe("rgb(24, 44, 34)");
  await page.screenshot({ path: "/tmp/tradesense-theme-light.png", fullPage: true });
  await page.getByRole("button", { name: "Switch to dark theme" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.locator(".overview-template-page").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(11, 13, 18)");
  await expect.poll(() => page.locator(".overview-template-summary").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(17, 21, 25)");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.getByLabel("Selected asset").selectOption("ETH");
  await expect(page.getByRole("heading", { name: "Market Overview", exact: true })).toBeVisible();
  await expect(page.locator(".sidebar.desktop-sidebar")).toBeVisible();
  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.getByText("Total portfolio equity", { exact: true })).toBeVisible();
  await expect(page.locator(".overview-template-chart")).toBeVisible();
  await expect(page.locator(".overview-template-chart-empty")).toBeVisible();
  await expect(page.locator(".overview-template-chart").getByText("missing data", { exact: true })).toHaveCount(0);
  for (const range of ["1D", "1W", "1M", "3M", "1Y"]) await expect(page.getByRole("button", { name: range, exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Expand chart" })).toHaveCount(0);
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(page).toHaveURL(/\?view=analysis(?:&|$)/);
  await expect(page.getByRole("heading", { name: "Behind the decision.", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page).toHaveURL(/\?view=dashboard(?:&|$)/);
  await expect(page.getByText("RYO MARKET OVERVIEW", { exact: true })).toHaveCount(0);
  await expect(page.getByText("SAVED RUN WORKFLOW", { exact: true })).toHaveCount(0);
  await expect(page.getByText("SUPPORTED MARKET CANDIDATES", { exact: true })).toHaveCount(0);
  await expect(page.getByText("AUTONOMOUS SCANS", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: "/tmp/tradesense-overview-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/tradesense-overview-mobile.png" });
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect.poll(() => page.locator(".overview-template-page").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.getByText("LIVE DATA", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to fixture/ })).toHaveCount(0);
  await expect(page.getByText("missing data", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Analyze & Simulate" }).click();
  await expect(page.getByText(/missing data: RYO is not configured/)).toBeVisible();
  await expect(page.getByText("BLOCKED STALE PRICE", { exact: true })).toHaveCount(0);
});
