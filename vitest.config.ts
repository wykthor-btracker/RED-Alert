import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    // Unit/component tests live under src/. The e2e/ specs are Playwright tests
    // and must not be collected by Vitest.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "e2e", "out"],
  },
});
