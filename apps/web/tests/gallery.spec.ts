import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("FR/EN, themes, persistence, controls, overlays and accessibility", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/internal/components");
  await expect(page.locator(".ds-root")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("Langue", { exact: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByLabel("Appearance", { exact: true }).selectOption("light");
  await expect(page.locator(".ds-root")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("en");
  await expect(page.locator(".ds-root")).toHaveAttribute("data-theme", "light");
  await page.locator("#actions input").first().fill("Gallery QA");
  const toggle = page.getByRole("switch");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("button[aria-busy=true]")).toBeDisabled();
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.locator("#overlays button").first().click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.locator("#overlays button").first()).toBeFocused();
  await page.locator("#overlays button").nth(1).click();
  await expect(page.locator("dialog.sheet[open]")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("#overlays button").nth(2).click();
  await expect(page.locator(".ds-toast")).toBeVisible();
  await page.locator(".ds-toast button").click();
  const closeDay = page.locator("#finance").getByRole("button").last();
  await expect(closeDay).toBeDisabled();
  await page.locator("#finance input[type=checkbox]").check();
  await expect(closeDay).toBeEnabled();
  for (const theme of ["light", "dark"]) {
    await page.getByLabel("Appearance", { exact: true }).selectOption(theme);
    const audit = await new AxeBuilder({ page }).analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await page.getByLabel("Appearance", { exact: true }).selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".ds-root")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".ds-root")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

test("360px layout, FR/EN and 200% text do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/internal/components");
  for (const locale of ["fr", "en"]) {
    await page.locator(".gallery-toolbar select").first().selectOption(locale);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `dist/gallery-${locale}-360.png`,
      fullPage: true,
    });
  }
});
