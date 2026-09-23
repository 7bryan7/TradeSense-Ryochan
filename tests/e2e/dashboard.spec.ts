import { expect, test } from "@playwright/test";

test("creates a simulated decision and answers without changing chat into a trade", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("No wallet. No real funds. All fills are simulated.")).toBeVisible();
  await page.getByRole("button", { name: "Analyze & simulate" }).click();
  await expect(page.getByText("BUY", { exact: true })).toBeVisible();
  const portfolioCard = page.getByText("PAPER PORTFOLIO", { exact: true }).locator("..");
  const cashAfterDecision = await portfolioCard.getByRole("heading").innerText();
  await page.getByPlaceholder(/Ask about/).fill("Why this decision?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText(/saved SOL decision was BUY/)).toBeVisible();
  await expect(portfolioCard.getByRole("heading")).toHaveText(cashAfterDecision);
});
