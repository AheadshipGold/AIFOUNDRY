import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";

const screens = [
  "home",
  "product",
  "requests",
  "compare",
  "seller",
  "orders",
  "cashbook",
  "close",
] as const;
async function navigate(page: Page, screen: (typeof screens)[number]) {
  const seller = ["seller", "orders", "cashbook", "close"].includes(screen);
  await page
    .locator(`[data-workspace="${seller ? "seller" : "buyer"}"]`)
    .click();
  await page.locator(`[data-screen-target="${screen}"]`).click();
  await expect(page.locator("main")).toHaveAttribute("data-screen", screen);
}
for (const screen of screens) {
  test(`${screen}: FR/EN, light/dark, 360/430/desktop, AA and captures`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/internal/references");
    await navigate(page, screen);
    for (const locale of ["fr", "en"]) {
      await page.locator(".ref-review-bar select").nth(0).selectOption(locale);
      for (const theme of ["light", "dark"]) {
        await page.locator(".ref-review-bar select").nth(1).selectOption(theme);
        await expect(page.locator(".ds-root")).toHaveAttribute(
          "data-theme",
          theme,
        );
        for (const width of [360, 430, 1280]) {
          await page.setViewportSize({ width, height: 900 });
          await expect(page.locator("main h1")).toBeVisible();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          if (locale === "fr" && width !== 430) {
            await page.locator(".ref-photo img").evaluateAll((images) =>
              Promise.all(
                images.map((img) => {
                  const image = img as HTMLImageElement;
                  return image.decode().catch(() => {});
                }),
              ),
            );
            await page.screenshot({
              path: path.resolve(
                __dirname,
                `../../../Docs/UI_IMPLEMENTATION/captures/${screen}-${theme}-${width}.png`,
              ),
              fullPage: true,
            });
          }
        }
        if (locale === "fr") {
          const audit = await new AxeBuilder({ page }).analyze();
          expect(
            audit.violations.map((v) => ({
              id: v.id,
              targets: v.nodes.map((n) => n.target),
            })),
          ).toEqual([]);
        }
      }
    }
    await page.setViewportSize({ width: 360, height: 900 });
    await page.addStyleTag({ content: "html {font-size:200% !important}" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
test("request input survives error and close requires review; offline blocks operations", async ({
  page,
}) => {
  await page.goto("/internal/references");
  await page.locator(".ref-review-bar select").nth(0).selectOption("fr");
  await navigate(page, "requests");
  await page
    .getByLabel("Votre besoin", { exact: true })
    .fill("12 carnets A5 pour une formation");
  await page.locator(".ref-review-bar select").nth(2).selectOption("error");
  await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await expect(page.getByLabel("Votre besoin", { exact: true })).toHaveValue(
    "12 carnets A5 pour une formation",
  );
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Vérifier la demande", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toContainText("n’est pas publiée");
  await page.keyboard.press("Escape");
  await navigate(page, "close");
  const close = page.locator(".ref-close-form").getByRole("button");
  await expect(close).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.locator(".ref-review-bar select").nth(2).selectOption("offline");
  await expect(close).toBeDisabled();
  await page.locator(".ref-review-bar select").nth(2).selectOption("normal");
  await close.click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmer la simulation", exact: true })
    .click();
  await expect(page.locator(".ds-toast")).toContainText(
    "Aucune opération réelle",
  );
});
