import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test("Page 1 marker click → sidebar navigation → Territory Profile renders Berastagi A.2/A.3/A.4", async ({
  page,
}) => {
  await page.goto("/");

  // Select Berastagi via marker keyboard fallback (sets active profile)
  await page.getByRole("button", { name: "Buka Quick Scan untuk Kec. Berastagi" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Harga & Window")).toBeVisible();

  // Navigate to Territory Profile via the global left sidebar
  await Promise.all([
    page.waitForURL(/\/profile/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Territory Profile" }).click(),
  ]);

  await expect(page).toHaveURL(/\/profile/);

  // Page header
  await expect(page.getByRole("heading", { name: "Kec. Berastagi" })).toBeVisible();
  await expect(page.getByText("Kab. Karo, Sumatera Utara")).toBeVisible();
});

test("Territory Profile /profile shows A.2 Berastagi canonical values", async ({ page }) => {
  // Navigate directly with profile param (bypasses marker interaction)
  await page.goto("/profile?profile=berastagi");

  // A.2 — luas, penduduk, infra index
  await expect(page.getByText(/30[.,]5\s*km²/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/43[.,]?214/)).toBeVisible();
  // Infrastructure index 75.6 / "75,6" depending on locale
  await expect(page.getByText(/75[.,]6/)).toBeVisible();
});

test("Territory Profile /profile shows A.3 Berastagi canonical values", async ({ page }) => {
  await page.goto("/profile?profile=berastagi");

  // A.3 — compliance score 84, BEBAS_INVESTASI flag, 488 ha conflict area
  await expect(page.getByText(/zoning compliance/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("84").first()).toBeVisible();
  await expect(page.getByText("Bebas Investasi")).toBeVisible();
  await expect(page.getByText(/488/).first()).toBeVisible();
});

test("Territory Profile /profile shows A.4 Berastagi canonical values", async ({ page }) => {
  await page.goto("/profile?profile=berastagi");

  // A.4 — market access score 64, canonical destinations
  await expect(page.getByTestId("market-access-table")).toBeVisible({ timeout: 25_000 });
  const maTable = page.getByTestId("market-access-table");
  await expect(maTable.getByText("Belawan, Medan")).toBeVisible();
  await expect(maTable.getByText("Kualanamu")).toBeVisible();
  await expect(maTable.getByText("Pusat Pasar Medan")).toBeVisible();
  await expect(page.getByText("84 km")).toBeVisible();
  await expect(page.getByText("96 km")).toBeVisible();
  await expect(page.getByText("Rp 800rb/ton")).toBeVisible();
});

test("Territory Profile A.4 destinations table sorts by Jarak ASC", async ({ page }) => {
  await page.goto("/profile?profile=berastagi");

  await expect(page.getByTestId("market-access-table")).toBeVisible({ timeout: 25_000 });

  // Click Jarak column header to sort ASC
  await page.getByRole("columnheader", { name: /jarak/i }).click();

  // After ASC sort, 0 km row (jalan_nasional junction) should appear first
  const rows = page.getByTestId("market-access-table").getByRole("row");
  // header row + 5 data rows; index 1 = first data row
  await expect(rows.nth(1)).toContainText("0 km");
});

test("Territory Profile A.4 radar chart renders Market Access Score panel", async ({ page }) => {
  await page.goto("/profile?profile=berastagi");

  await expect(page.getByTestId("market-access-radar")).toBeVisible({ timeout: 25_000 });
  await expect(page.getByTestId("bottleneck-analysis-card")).toBeVisible();
  await expect(page.getByText(/Berastagi.{0,20}Medan/i)).toBeVisible();
});

test("Territory Profile sidebar active state is set on /profile", async ({ page }) => {
  await page.goto("/profile?profile=berastagi");

  const territoryLink = page.getByRole("link", { name: "Territory Profile" });
  await expect(territoryLink).toHaveAttribute("aria-current", "page");

  const commandLink = page.getByRole("link", { name: "Command Center" });
  await expect(commandLink).not.toHaveAttribute("aria-current", "page");
});
