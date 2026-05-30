import { defineConfig, devices } from "@playwright/test";

/**
 * Local PeerJS broker used for deterministic, offline P2P tests. The dev server
 * is started with NEXT_PUBLIC_PEER_* pointing here so the app's PeerJS client
 * connects to it instead of the public cloud broker.
 */
const PEER_PORT = 9000;

const peerEnv = {
  NEXT_PUBLIC_PEER_HOST: "localhost",
  NEXT_PUBLIC_PEER_PORT: String(PEER_PORT),
  NEXT_PUBLIC_PEER_PATH: "/",
};

const useExistingServer = process.env.USE_EXISTING_SERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "html",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(useExistingServer
    ? {}
    : {
        webServer: [
          {
            command: `npx peerjs --port ${PEER_PORT} --path / --cors "http://localhost:3000"`,
            port: PEER_PORT,
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
            stdout: "pipe",
            stderr: "pipe",
          },
          {
            command: "npm run dev",
            url: "http://localhost:3000",
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
            env: peerEnv,
            stdout: "pipe",
            stderr: "pipe",
          },
        ],
      }),
});
