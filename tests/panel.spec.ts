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

  // Current dashboard metrics and structured information sections.
  await expect(hero.getByText("Study items", { exact: true })).toBeVisible();
  await expect(hero.getByText("Capabilities", { exact: true })).toBeVisible();
  await expect(hero.getByText("Outcomes", { exact: true })).toBeVisible();

  // Briefing section
  await expect(hero.getByText("Record summary", { exact: true })).toBeVisible();

  // The verified panel uses a portfolio-owned system visual instead of an
  // unverified third-party entity photo. Assert the identity and detail areas.
  await expect(hero.getByText("PORTFOLIO RECORD", { exact: true }).first()).toBeVisible();
  await expect(hero.getByText("Study breakdown", { exact: true })).toBeVisible();
  await expect(hero.getByText("Learning & capability", { exact: true })).toBeVisible();

  console.log("=== ERRORS ===");
  errors.forEach((e) => console.log(e));
  console.log("=== WARNINGS ===");
  warnings.slice(0, 5).forEach((w) => console.log(w));

  await page.screenshot({ path: "test-results/side-panel.png", fullPage: false });
  expect(errors, "unexpected browser console/page errors").toEqual([]);
});
