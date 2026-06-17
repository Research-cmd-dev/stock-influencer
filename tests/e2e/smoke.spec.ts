import { test, expect } from "@playwright/test";

const DISCLAIMER_TEXT = "This is for informational purposes only and is not financial advice.";

test.describe("ExecSignal smoke", () => {
  test("home dashboard renders with disclaimer and exec cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("disclaimer").first()).toContainText(DISCLAIMER_TEXT);
    // At least one tracked executive card links to a timeline.
    await expect(page.getByRole("link", { name: /view timeline/i }).first()).toBeVisible();
    await page.screenshot({ path: "test-results/home.png", fullPage: true });
  });

  test("themes index renders and disclaimer present", async ({ page }) => {
    await page.goto("/themes");
    await expect(page.getByRole("heading", { name: /investment themes/i })).toBeVisible();
    await expect(page.getByTestId("disclaimer").first()).toContainText(DISCLAIMER_TEXT);
  });

  test("executive page renders a timeline with disclaimer", async ({ page }) => {
    await page.goto("/exec/p_jensen_huang");
    await expect(page.getByRole("heading", { name: "Jensen Huang" })).toBeVisible();
    await expect(page.getByText(/statement timeline/i)).toBeVisible();
    await expect(page.getByTestId("disclaimer").first()).toContainText(DISCLAIMER_TEXT);
  });

  test("theme detail renders stocks-to-watch with disclaimer", async ({ page }) => {
    await page.goto("/themes/t_ai_factory_buildout");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/stocks to watch/i)).toBeVisible();
    await expect(page.getByTestId("disclaimer").first()).toContainText(DISCLAIMER_TEXT);
  });

  test("style guide renders the component system", async ({ page }) => {
    await page.goto("/style-guide");
    await expect(page.getByRole("heading", { name: /style guide/i })).toBeVisible();
    await expect(page.getByTestId("stock-chip").first()).toBeVisible();
  });

  test("basic a11y: single h1, lang attribute, nav present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
