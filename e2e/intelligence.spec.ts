import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test("sidebar Territory Intelligence link navigates to /intelligence", async ({ page }) => {
  await page.goto("/");

  await Promise.all([
    page.waitForURL(/\/intelligence/, { timeout: 20_000 }),
    page.getByRole("link", { name: "Territory Intelligence" }).click(),
  ]);

  await expect(page).toHaveURL(/\/intelligence/);
});

test("Territory Intelligence sidebar item is active on /intelligence", async ({ page }) => {
  await page.goto("/intelligence");

  const intLink = page.getByRole("link", { name: "Territory Intelligence" });
  await expect(intLink).toHaveAttribute("aria-current", "page");

  // Other sidebar items are not active
  const profileLink = page.getByRole("link", { name: "Territory Profile" });
  await expect(profileLink).not.toHaveAttribute("aria-current", "page");
});

test("Page 1 marker click → /intelligence carries Berastagi active profile", async ({ page }) => {
  await page.goto("/");

  // Activate Berastagi via map marker
  await page.getByRole("button", { name: "Buka Quick Scan untuk Kec. Berastagi" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Harga & Window")).toBeVisible();

  // Navigate to Territory Intelligence via sidebar
  await Promise.all([
    page.waitForURL(/\/intelligence/, { timeout: 20_000 }),
    page.getByRole("link", { name: "Territory Intelligence" }).click(),
  ]);

  await expect(page).toHaveURL(/\/intelligence/);

  // Page header must reflect Berastagi
  await expect(page.getByRole("heading", { name: "Kec. Berastagi" })).toBeVisible();
  await expect(page.getByText("Kab. Karo, Sumatera Utara")).toBeVisible();
});

test("/intelligence?profile=berastagi renders all four A.5–A.8 sections", async ({ page }) => {
  await page.goto("/intelligence?profile=berastagi");

  // Wait for A.5 section to render Berastagi tren
  await expect(page.getByText("Tren Kondisi Wilayah")).toBeVisible({ timeout: 20_000 });

  // All four sections visible
  await expect(page.getByText("Demand dan Serapan Pasar")).toBeVisible();
  await expect(page.getByText("Dinamika Nilai Lahan")).toBeVisible();
  await expect(page.getByText("Proyeksi Pertumbuhan")).toBeVisible();
});

test("/intelligence?profile=berastagi shows Berastagi A.5 canonical values", async ({
  page,
}) => {
  await page.goto("/intelligence?profile=berastagi");

  // A.5 tren label + score
  await expect(page.getByText("Membaik")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("76")).toBeVisible();

  // Scenario probabilities
  await expect(page.getByText("65%")).toBeVisible();
  await expect(page.getByText("25%")).toBeVisible();
  await expect(page.getByText("10%")).toBeVisible();
});

test("/intelligence?profile=berastagi shows A.6 Agro Stroberi gap +560", async ({ page }) => {
  await page.goto("/intelligence?profile=berastagi");

  await expect(page.getByText("+560 ton/bln")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Stroberi")).toBeVisible();
});

test("/intelligence?profile=berastagi shows A.7 canonical land value", async ({ page }) => {
  await page.goto("/intelligence?profile=berastagi");

  await expect(page.getByText("Rp 420rb/m²").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("+15.4%").first()).toBeVisible();
  await expect(page.getByText("1.4x")).toBeVisible();
});

test("/intelligence?profile=berastagi shows A.8 growth score 81 and cost of delay", async ({
  page,
}) => {
  await page.goto("/intelligence?profile=berastagi");

  // A.8 gauge aria-label contains score 81
  await expect(
    page.getByRole("img", { name: /Growth Projection Score 81/i }),
  ).toBeVisible({ timeout: 20_000 });

  // Cost of delay card
  await expect(page.getByText("Rp 18,5jt")).toBeVisible();

  // Critical milestones
  await expect(page.getByText("2026-Q3")).toBeVisible();
  await expect(page.getByText("2027-Q1")).toBeVisible();
  await expect(page.getByText("2027-Q4")).toBeVisible();
});

test("/intelligence?section=A8 scrolls to and highlights A.8 section", async ({ page }) => {
  await page.goto("/intelligence?profile=berastagi&section=A8");

  // A.8 section must be in the DOM
  const section = page.locator("#A8");
  await expect(section).toBeVisible({ timeout: 20_000 });

  // During highlight window the outline class is applied
  await expect(section).toHaveClass(/outline-talis-green-700/, { timeout: 2_000 });
});

test("/intelligence?section=NOPE renders normally without error", async ({ page }) => {
  await page.goto("/intelligence?section=NOPE");

  // All sections render
  await expect(page.getByText("Tren Kondisi Wilayah")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Proyeksi Pertumbuhan")).toBeVisible();

  // No JS errors: absence of error boundary text
  await expect(page.getByText("Something went wrong")).toHaveCount(0);
});

test("Territory Profile → sidebar → Territory Intelligence carries active profile", async ({
  page,
}) => {
  await page.goto("/profile?profile=berastagi");

  await expect(
    page.getByRole("heading", { name: "Kec. Berastagi" }),
  ).toBeVisible({ timeout: 20_000 });

  await Promise.all([
    page.waitForURL(/\/intelligence/, { timeout: 20_000 }),
    page.getByRole("link", { name: "Territory Intelligence" }).click(),
  ]);

  await expect(page).toHaveURL(/\/intelligence/);
  await expect(page.getByRole("heading", { name: "Kec. Berastagi" })).toBeVisible();
});
