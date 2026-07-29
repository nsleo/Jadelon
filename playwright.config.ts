import { defineConfig, devices } from "@playwright/test";

const playwrightPort = Number(process.env.PW_PORT ?? "3101");
const playwrightBaseUrl = `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["**/._*"],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: playwrightBaseUrl,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run start -- -p ${playwrightPort}`,
    url: playwrightBaseUrl,
    reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
      },
    },
  ],
});
