import { test, expect } from "@playwright/test";

test("home scroll state survives subpage navigation and back-to-top is global", async ({ page }) => {
  await page.goto("http://localhost:5100/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 1450));
  await page.waitForFunction(() => window.scrollY > 1000);
  const savedY = await page.evaluate(() => window.scrollY);

  await page.goto("http://localhost:5100/build", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.getByRole("button", { name: "Back to top" })).toBeVisible();

  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const restoredY = await page.evaluate(() => window.scrollY);
  expect(restoredY).toBeGreaterThan(savedY - 120);
});

test("information panel retains a real staggered cascade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:5100/", { waitUntil: "networkidle" });
  await page.locator('button[data-opens-panel="true"]').first().click();
  const children = page.locator(".panel-cascade > *");
  await expect(children.first()).toBeVisible();
  const firstDelay = await children.nth(0).evaluate((element) => getComputedStyle(element).animationDelay);
  const secondDelay = await children.nth(1).evaluate((element) => getComputedStyle(element).animationDelay);
  const duration = await children.nth(1).evaluate((element) => getComputedStyle(element).animationDuration);
  expect(firstDelay).toBe("0.1s");
  expect(secondDelay).toBe("0.22s");
  expect(duration).toBe("0.72s");
});
