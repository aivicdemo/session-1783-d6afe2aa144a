import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/itg-2-*.spec.ts",
  workers: 4,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://dev.dblpbeqrl18h6.amplifyapp.com" },
  reporter: "list",
});
