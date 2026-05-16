import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
});

test("sidebar Opportunity & Risk link navigates to /assessment", async ({ page }) => {
  await page.goto("/");

  await Promise.all([
    page.waitForURL(/\/assessment/, { timeout: 20_000 }),
    page.getByRole("link", { name: "Opportunity & Risk" }).click(),
  ]);

  await expect(page).toHaveURL(/\/assessment/);
});

test("Opportunity & Risk sidebar item is active on /assessment", async ({ page }) => {
  await page.goto("/assessment");

  const assessmentLink = page.getByRole("link", { name: "Opportunity & Risk" });
  await expect(assessmentLink).toHaveAttribute("aria-current", "page");

  const profileLink = page.getByRole("link", { name: "Territory Profile" });
  await expect(profileLink).not.toHaveAttribute("aria-current", "page");
});

test("/assessment?profile=berastagi renders five sections", async ({ page }) => {
  await page.goto("/assessment?profile=berastagi");

  await expect(page.getByText("C.1 — Location Scoring Card")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("C.3 — Risk Profile")).toBeVisible();
  await expect(page.getByText("C.4 — Feasibility Snapshot")).toBeVisible();
  await expect(page.getByText("C.6 — Financial Viability")).toBeVisible();
  await expect(page.getByText("Investment Summary")).toBeVisible();
});

test("/assessment?profile=berastagi renders Location Score 78 for Agribisnis", async ({ page }) => {
  await page.goto("/assessment?profile=berastagi");

  await expect(page.getByText("C.1 — Location Scoring Card")).toBeVisible({ timeout: 20_000 });

  // Wait for data to load — score badge shows 78
  await expect(page.getByTestId("score-badge").first()).toContainText("78", { timeout: 10_000 });
});

test("/assessment?profile=berastagi sektor switch Agribisnis → Hospitality recomputes to 62", async ({
  page,
}) => {
  await page.goto("/assessment?profile=berastagi");

  // Wait for initial load
  await expect(page.getByTestId("score-badge").first()).toContainText("78", { timeout: 20_000 });

  // Click Hospitality sektor tab
  await page.getByRole("button", { name: "Hospitality" }).click();

  // Score should recompute to 62
  await expect(page.getByTestId("score-badge").first()).toContainText("62", { timeout: 5_000 });
});

test("/assessment?profile=berastagi Investment Summary shows LAYAK verdict", async ({ page }) => {
  await page.goto("/assessment?profile=berastagi");

  await expect(page.getByText("Investment Summary")).toBeVisible({ timeout: 20_000 });

  await expect(page.getByText("Verdict Final")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/LAYAK/)).toBeVisible();
});

test("/assessment?profile=berastagi CTA navigates to /decision", async ({ page }) => {
  await page.goto("/assessment?profile=berastagi");

  await expect(page.getByText("Lanjut ke Page 5 Komparasi →")).toBeVisible({ timeout: 20_000 });

  await Promise.all([
    page.waitForURL(/\/decision/, { timeout: 20_000 }),
    page.getByText("Lanjut ke Page 5 Komparasi →").click(),
  ]);

  await expect(page).toHaveURL(/\/decision/);
});

test("/assessment/gap-analysis renders gap analysis table with Berastagi", async ({ page }) => {
  await page.goto("/assessment/gap-analysis?profile=berastagi");

  await expect(page.getByText("Multi-Wilayah Gap Analysis")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Kec. Berastagi")).toBeVisible({ timeout: 10_000 });
});

test("/assessment/gap-analysis row expand shows sub-component gap", async ({ page }) => {
  await page.goto("/assessment/gap-analysis?profile=berastagi");

  await expect(page.getByText("Kec. Berastagi")).toBeVisible({ timeout: 20_000 });

  // Click expand on the first row
  await page.getByRole("button", { name: /Lihat/ }).first().click();

  await expect(page.getByText("Sub-Komponen Gap")).toBeVisible({ timeout: 5_000 });
});

test("Page 1 marker click → /assessment carries Berastagi active profile", async ({ page }) => {
  await page.goto("/");

  // Activate Berastagi via map marker
  await page.getByRole("button", { name: "Buka Quick Scan untuk Kec. Berastagi" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Harga & Window")).toBeVisible();

  // Navigate to Assessment via sidebar
  await Promise.all([
    page.waitForURL(/\/assessment/, { timeout: 20_000 }),
    page.getByRole("link", { name: "Opportunity & Risk" }).click(),
  ]);

  await expect(page).toHaveURL(/\/assessment/);
  await expect(page.getByRole("heading", { name: "Kec. Berastagi" })).toBeVisible();
});
