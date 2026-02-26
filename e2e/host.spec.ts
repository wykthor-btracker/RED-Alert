import { test, expect } from "@playwright/test";

test.describe("Host functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("user sees Host and Node options when not connected", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Host/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Node/i })).toBeVisible();
    await expect(page.getByPlaceholder(/input/i).or(page.locator('input'))).toBeVisible();
  });

  test("user can become host and sees connection ID", async ({ page }) => {
    await page.getByRole("button", { name: /Host/i }).click();
    const idButton = page.locator('button').filter({ hasText: 'ID:' });
    await expect(idButton).toBeVisible({ timeout: 25000 });
    const idText = await idButton.textContent();
    expect(idText).toMatch(/ID:\s*.+/);
  });

  test("host can copy ID to clipboard on click", async ({ page, context }) => {
    await page.getByRole("button", { name: /Host/i }).click();
    await expect(page.locator('button').filter({ hasText: 'ID:' })).toBeVisible({ timeout: 20000 });
    await page.locator('button').filter({ hasText: 'ID:' }).click();
    await expect(page.getByText(/copiado|área de transferência/i)).toBeVisible({ timeout: 3000 });
  });

  test("host is shown as connected after starting", async ({ page }) => {
    await page.getByRole("button", { name: /Host/i }).click();
    await expect(page.locator('button').filter({ hasText: 'ID:' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /Host/i })).not.toBeVisible();
  });
});
