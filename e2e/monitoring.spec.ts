import { expect, test } from "@playwright/test";

test("simulated alert toast navigates to monitoring and surfaces the alert", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /simulate new alert/i }).click({ force: true });

  const toast = page.getByText(/Peringatan baru:/i).first();
  await expect(toast).toBeVisible({ timeout: 3_000 });
  await page.getByRole("link", { name: "Buka peringatan baru di Monitoring" }).click();

  await expect(page).toHaveURL(/\/monitoring.*#alert-alert-sim-berastagi-/, { timeout: 30_000 });
  await expect(page.getByText(/Konversi lahan ilegal terdeteksi ulang/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Verifikasi lapangan oleh Dinas PUPR Karo/i)).toBeVisible();
});
