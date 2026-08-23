import { test, expect } from "@playwright/test";

test("globe renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  const consoleMsgs: string[] = [];
  page.on("console", (msg) => {
    consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`PAGEERROR: ${err.message}`));

  await page.goto("http://localhost:5100/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check the globe canvas exists
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveCount(1, { timeout: 5000 });

  // Check dashboard chrome rendered
  await expect(page.getByText("AROSHA")).toBeVisible({ timeout: 5000 });

  // Check timeline rendered
  await expect(page.getByText("TIMELINE")).toBeVisible({ timeout: 5000 });

  console.log("=== CONSOLE OUTPUT ===");
  consoleMsgs.forEach((m) => console.log(m));
  console.log("=== ERRORS ===");
  errors.forEach((e) => console.log(e));

  // Screenshot for visual check
  await page.screenshot({ path: "test-screenshot.png", fullPage: false });

  expect(errors, "unexpected browser console/page errors").toEqual([]);
});
