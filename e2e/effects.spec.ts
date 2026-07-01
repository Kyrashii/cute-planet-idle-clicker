import { test, expect, type Page } from "@playwright/test";

async function boot(page: Page, query = "") {
  await page.goto(`/${query}`);
  await expect(page.locator("#planet-container")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /Loslegen/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test.describe("gpu effects layer", () => {
  test("mounts a rendering canvas with the WebGL2 fallback", async ({ page }) => {
    await boot(page, "?fx=webgl2");
    const sky = page.getByTestId("fx-sky");
    await expect(sky).toBeAttached();
    await expect(sky).toHaveAttribute("data-fx-renderer", "webgl2");
    // The particle canvas sits above the game surface but never eats input.
    const fx = page.getByTestId("fx-particles");
    await expect(fx).toHaveCSS("pointer-events", "none");
  });

  test("fx=off leaves the game on the CSS-only path", async ({ page }) => {
    await boot(page, "?fx=off");
    await expect(page.getByTestId("fx-sky")).toHaveCount(0);
    // Game still fully playable.
    await page.locator("#planet-container").click();
    await expect(page.locator("#planet-container")).toBeVisible();
  });

  test("frozen deterministic mode renders a stable frame", async ({ page }) => {
    await boot(page, "?fx=frozen&fxseed=1");
    const sky = page.getByTestId("fx-sky");
    await expect(sky).toBeAttached();
    await page.waitForTimeout(400);
    const snapshot = () =>
      page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="fx-sky"]');
        return canvas?.toDataURL() ?? "";
      });
    const first = await snapshot();
    await page.waitForTimeout(300);
    const second = await snapshot();
    expect(first.length).toBeGreaterThan(1000); // actually rendered pixels
    expect(first).toBe(second);
  });
});
