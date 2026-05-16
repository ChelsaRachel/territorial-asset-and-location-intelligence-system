import { expect, test } from "@playwright/test";

test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test("golden path uses sidebar navigation from Command Center through Page 6", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Buka Quick Scan untuk Kec. Berastagi" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /Quick Scan Kec\. Berastagi/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lihat Detail Page 2" })).toHaveCount(0);

  await Promise.all([
    page.waitForURL(/\/profile/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Territory Profile" }).click(),
  ]);
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByRole("heading", { name: "Kec. Berastagi" })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/intelligence/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Territory Intelligence" }).click(),
  ]);
  await expect(page).toHaveURL(/\/intelligence/);
  await expect(page.getByText("Proyeksi Pertumbuhan")).toBeVisible({ timeout: 20_000 });

  await Promise.all([
    page.waitForURL(/\/assessment/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Opportunity & Risk" }).click(),
  ]);
  await expect(page).toHaveURL(/\/assessment/);
  await expect(page.getByText("C.1 — Location Scoring Card")).toBeVisible({ timeout: 20_000 });

  await Promise.all([
    page.waitForURL(/\/decision/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Investment Decision" }).click(),
  ]);
  await expect(page).toHaveURL(/\/decision/);
  await expect(page.getByText("Perbandingan Kandidat")).toBeVisible({ timeout: 20_000 });

  await Promise.all([
    page.waitForURL(/\/monitoring/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Monitoring & Governance" }).click(),
  ]);
  await expect(page).toHaveURL(/\/monitoring/);
  await expect(page.getByText("Catatan Kebijakan & Akuntabilitas")).toBeVisible({ timeout: 25_000 });
});

test("Quick Scan follows the Page 4 active sektor persisted in sessionStorage", async ({ page }) => {
  await page.goto("/assessment?profile=berastagi");
  await expect(page.getByTestId("score-badge").first()).toContainText("78", { timeout: 20_000 });

  await page.getByRole("button", { name: "Hospitality" }).click();
  await expect(page.getByTestId("score-badge").first()).toContainText("62", { timeout: 10_000 });

  await Promise.all([
    page.waitForURL(/\/\?profile=berastagi/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Command Center" }).click(),
  ]);
  await page.getByRole("button", { name: "Buka Quick Scan untuk Kec. Berastagi" }).focus();
  await page.keyboard.press("Enter");

  const quickScan = page.getByRole("dialog", { name: /Quick Scan Kec\. Berastagi/ });
  await expect(quickScan.getByText("Sektor aktif", { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(quickScan.getByText("hospitality", { exact: true })).toBeVisible();
  await expect(quickScan).toContainText("Hospitality Suitability");
});

test("export modals open from comparison, shortlist, and accountability surfaces", async ({ page }) => {
  await page.goto("/decision?profile=berastagi");
  await expect(page.getByText("Perbandingan Kandidat")).toBeVisible({ timeout: 20_000 });

  const compareExport = page.getByRole("button", { name: "Ekspor" }).first();
  await expect(compareExport).toBeEnabled({ timeout: 20_000 });
  await compareExport.click();
  await expect(page.getByText("Ekspor Perbandingan Kandidat")).toBeVisible();
  await expect(page.getByRole("button", { name: "PPT" })).toBeVisible();
  await page.getByRole("button", { name: "Batal" }).click();

  const saveButton = page.getByRole("button", { name: "+ Simpan Wilayah Ini" });
  if (await saveButton.isVisible()) {
    await saveButton.click();
  }
  await page.getByRole("button", { name: "Ekspor Semua" }).click();
  await expect(page.getByText("Ekspor Semua Shortlist")).toBeVisible();
  await expect(page.getByRole("button", { name: "PPT" })).toBeDisabled();
  await page.getByRole("button", { name: "Batal" }).click();

  await page.goto("/monitoring?profile=berastagi");
  await expect(page.getByText("Catatan Kebijakan & Akuntabilitas")).toBeVisible({ timeout: 25_000 });
  await page
    .locator("section")
    .filter({ hasText: "Catatan Kebijakan & Akuntabilitas" })
    .getByRole("button", { name: "Ekspor" })
    .click();
  await expect(page.getByText("Ekspor Catatan Kebijakan & Akuntabilitas")).toBeVisible();
  await expect(page.getByRole("button", { name: "XLSX" })).toBeDisabled();
});
