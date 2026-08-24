import { test, expect } from "@playwright/test";

test("side panel: entity search + photo + organized UI", async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
    if (msg.type() === "warning") warnings.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`PAGEERROR: ${err.message}`));

  await page.goto("http://localhost:5100/", { waitUntil: "networkidle", timeout: 40000 });
  await page.waitForTimeout(4000); // intro fly-in

  // Use the always-accessible timeline control. Globe HTML labels depend on
  // camera projection and are intentionally culled when behind the globe.
  const colomboTimelineItem = page.locator('button[data-opens-panel="true"][title*="Colombo"]').first();
  await colomboTimelineItem.waitFor({ state: "visible", timeout: 10000 });
  await colomboTimelineItem.click();
  await page.waitForTimeout(4500); // let Places JS API load + search

  // ── Panel assertions ──
  const hero = page.locator("aside.right-4.top-16");
  await expect(hero).toBeVisible({ timeout: 5000 });
  // Scope duplicated labels to the open information panel.
  await expect(hero.getByText("EDUCATION", { exact: true })).toBeVisible();

  // Stats row present (Entity Type / Since)
  await expect(page.getByText("ENTITY TYPE")).toBeVisible();
  await expect(page.getByText("SINCE")).toBeVisible();

  // Briefing section
  await expect(page.getByText("BRIEFING")).toBeVisible();

  // Check photo loaded in hero (img with naturalWidth > 0)
  const heroImg = page.locator("aside.right-4.top-16 img").first();
  const imgCount = await page.locator("aside.right-4.top-16 img").count();
  console.log("IMG COUNT in panel:", imgCount);
  expect(imgCount, "a selected place should resolve a Google or Wikimedia image").toBeGreaterThan(0);
  const natural = await heroImg.evaluate((i: HTMLImageElement) => i.naturalWidth);
  console.log("IMG naturalWidth:", natural);
  expect(natural).toBeGreaterThan(0);
  const src = await heroImg.getAttribute("src");
  console.log("IMG src prefix:", src?.slice(0, 80));

  // Entity intel — check if address row appeared (Places returned data)
  const addrVisible = await page.getByText("ADDR").isVisible().catch(() => false);
  console.log("ADDR row visible:", addrVisible);

  console.log("=== ERRORS ===");
  errors.forEach((e) => console.log(e));
  console.log("=== WARNINGS ===");
  warnings.slice(0, 5).forEach((w) => console.log(w));

  await page.screenshot({ path: "test-results/side-panel.png", fullPage: false });
  expect(errors, "unexpected browser console/page errors").toEqual([]);
});
