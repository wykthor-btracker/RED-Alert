import { test, expect, Browser, Page } from "@playwright/test";

/**
 * End-to-end P2P tests. Each peer runs in its own browser context (isolated
 * localStorage), connecting through the local peerjs-server started by
 * playwright.config.ts. This mirrors a real host + player session.
 */

async function openApp(browser: Browser): Promise<{ page: Page; close: () => Promise<void> }> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");
  return { page, close: () => ctx.close() };
}

/** Click Host and return the generated peer id. */
async function becomeHost(page: Page): Promise<string> {
  await page.getByRole("button", { name: "Host", exact: true }).click();
  const idButton = page.locator("button").filter({ hasText: "ID:" });
  await expect(idButton).toBeVisible({ timeout: 25_000 });
  const id = ((await idButton.textContent()) ?? "").replace(/ID:\s*/i, "").trim();
  expect(id.length).toBeGreaterThan(0);
  return id;
}

/** Connect this page to the given host id as a client and wait until connected. */
async function connectAsClient(page: Page, hostId: string): Promise<void> {
  await page.getByPlaceholder("ID do host").fill(hostId);
  await page.getByRole("button", { name: "Node", exact: true }).click();
  await expect(page.getByRole("button", { name: /Desconectar/i })).toBeVisible({ timeout: 25_000 });
}

test.describe("P2P host <-> client", () => {
  test("client connects and a client chat message reaches the host", async ({ browser }) => {
    const host = await openApp(browser);
    const client = await openApp(browser);
    try {
      const id = await becomeHost(host.page);
      await connectAsClient(client.page, id);

      const msg = `ping-${id.slice(0, 6)}`;
      const chat = client.page.getByPlaceholder("Mensagem...");
      await chat.fill(msg);
      await chat.press("Enter");

      await expect(host.page.getByText(msg)).toBeVisible({ timeout: 15_000 });
    } finally {
      await client.close();
      await host.close();
    }
  });

  test("a combatant the host adds appears on the client", async ({ browser }) => {
    const host = await openApp(browser);
    const client = await openApp(browser);
    try {
      const id = await becomeHost(host.page);
      await connectAsClient(client.page, id);

      // Host: open Iniciativa and add a combatant.
      await host.page.getByRole("tab", { name: /Iniciativa/i }).click();
      await host.page.getByTestId("add-combatant-toggle").click();
      await host.page.locator("#basic_name").fill("Sync Trooper");
      await host.page.locator("#basic_SP").fill("5");
      await host.page.locator("#basic_health").fill("10");
      await host.page.getByRole("button", { name: "Adicionar", exact: true }).click();

      // Host sees it locally (scope to the fighter card, not the activity log).
      await expect(
        host.page.getByTestId("fighter-name").filter({ hasText: "Sync Trooper" })
      ).toBeVisible({ timeout: 10_000 });

      // Client sees it synced in its own Iniciativa tab.
      await client.page.getByRole("tab", { name: /Iniciativa/i }).click();
      await expect(
        client.page.getByTestId("fighter-name").filter({ hasText: "Sync Trooper" })
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await client.close();
      await host.close();
    }
  });
});
