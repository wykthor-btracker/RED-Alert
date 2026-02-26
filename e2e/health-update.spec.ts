import { test, expect } from "@playwright/test";

/**
 * Verifies that health updates from Iniciativa (and by implication Mapa) actually
 * update the UI: apply damage and assert HP display changes.
 */
test.describe("Health update in Iniciativa", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("host: add combatant, apply damage, HP display updates", async ({ page }) => {
    // Become host
    await page.getByRole("button", { name: /Host/i }).click();
    await expect(page.locator("button").filter({ hasText: "ID:" })).toBeVisible({ timeout: 20000 });

    // Go to Iniciativa tab
    await page.getByRole("tab", { name: /Iniciativa/i }).click();

    // Open "Adicionar novo combatente" form (toggle switch)
    const addToggle = page.getByText("Adicionar novo combatente").locator("..").getByRole("switch");
    await addToggle.click();

    // Fill and submit: Nome, SP, Vida (HP)
    await page.getByRole("textbox", { name: /Nome/i }).fill("Test Fighter");
    await page.getByRole("textbox", { name: /Poder de parada/i }).fill("5");
    await page.getByRole("textbox", { name: /Vida/i }).fill("10");
    await page.getByRole("button", { name: /Adicionar/i }).click();

    // Wait for the fighter to appear and get initial HP progress bar (first fighter's HP)
    const firstFighterHp = page.getByTestId("fighter-hp").first();
    await expect(firstFighterHp).toBeVisible({ timeout: 5000 });

    // Ant Design Progress renders role="progressbar" with aria-valuenow (0-100)
    const hpProgress = firstFighterHp.getByRole("progressbar");
    await expect(hpProgress).toBeVisible();
    const initialValue = await hpProgress.getAttribute("aria-valuenow");
    expect(initialValue).toBeTruthy();
    const initialPercent = Number(initialValue ?? "0");
    expect(initialPercent).toBeGreaterThanOrEqual(95); // 100% or close (10/10)

    // Enter damage amount in the first fighter's input (the one next to "Dano")
    const damageInput = page.getByTestId("fighter-damage-input").first();
    await damageInput.fill("3");

    // Click Dano on the first fighter
    const danoButton = page.getByRole("button", { name: /Dano/i }).first();
    await danoButton.click();

    // Activity log should show damage message
    await expect(page.getByText(/tomou.*3.*dano/i)).toBeVisible({ timeout: 3000 });

    // HP progress bar should now show 70% (7/10)
    await expect(hpProgress).toHaveAttribute("aria-valuenow", "70", { timeout: 3000 });
  });
});
