import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test("marker click opens Quick Scan and sidebar navigation sends Berastagi to Territory Profile", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Buka Quick Scan untuk Kec. Berastagi" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText("Harga & Window")).toBeVisible();
  await expect(page.getByLabel(/Quick Scan/).getByText("Kec. Berastagi")).toBeVisible();

  await page.getByLabel("Zoom in").click();
  await page.getByLabel("Zoom out").click();
  await page.mouse.move(520, 360);
  await page.mouse.down();
  await page.mouse.move(590, 390);
  await page.mouse.up();

  const quickScan = page.getByRole("dialog", { name: /Quick Scan Kec\. Berastagi/ });
  await expect(quickScan).toBeVisible();
  await expect(quickScan.getByText("Peluang Konkret")).toBeVisible();
  await expect(quickScan.getByText("Sinyal Kunci")).toBeVisible();
  await expect(quickScan.getByText("Harga & Window")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lihat Detail Page 2" })).toHaveCount(0);
  await expect(page.getByText(/Page 2 tersedia/)).toHaveCount(0);

  await Promise.all([
    page.waitForURL(/\/profile/, { timeout: 45_000 }),
    page.getByRole("link", { name: "Territory Profile" }).click(),
  ]);

  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByText("Kec. Berastagi")).toBeVisible();
  await expect(page.getByText(/id: 1206090/)).toBeVisible();
});

test("Mode 1 autocomplete selects Berastagi and opens Quick Scan", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Cari wilayah...").fill("berastagi");
  await page.getByRole("option", { name: /Kec\. Berastagi/ }).click();

  const dialog = page.getByRole("dialog", { name: /Quick Scan Kec\. Berastagi/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Kab. Karo · Sumatera Utara")).toBeVisible();
});

test("canonical Mode 3 query ranks Berastagi first", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Opportunity" }).click();
  const commandSearch = page.getByLabel("Command Center search");
  await expect(commandSearch.getByRole("tablist", { name: "Search mode" })).toBeVisible();
  await expect(commandSearch.getByText("Sektor target")).toBeVisible();
  await expect(
    page.getByText("Atur filter lalu klik Apply untuk melihat wilayah prioritas.")
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Apply" }).click();

  const firstResult = page
    .getByRole("button")
    .filter({ hasText: "76,4" })
    .first();

  await expect(firstResult).toBeVisible();
  await expect(firstResult).toContainText("Kec. Berastagi");
  await expect(firstResult).toContainText("76,4");
});

test("criteria mode shows filters in the unified search card and tooltips stay above the map", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Criteria" }).click();

  const commandSearch = page.getByLabel("Command Center search");
  await expect(commandSearch.getByRole("tablist", { name: "Search mode" })).toBeVisible();
  await expect(commandSearch.getByText("Sektor")).toBeVisible();
  await expect(commandSearch.getByText("Skor min")).toBeVisible();
  await expect(
    page.getByText("Atur filter lalu klik Apply untuk melihat wilayah prioritas.")
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Ciwidey", exact: true }).hover();
  await expect(page.getByText(/Kec\. Ciwidey .* AGRO_DOMINANT/)).toBeVisible();
});
