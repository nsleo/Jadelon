import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const reviewDir = path.resolve(process.cwd(), "artifacts/review");

async function waitForReady3D(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("globe-prototype")).toHaveAttribute(
    "data-globe-state",
    "ready-3d",
    { timeout: 15000 },
  );
}

async function waitForReady2D(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("globe-prototype")).toHaveAttribute(
    "data-globe-state",
    "ready-2d",
    { timeout: 15000 },
  );

  await expect(page.getByTestId("globe-fallback-image")).toBeVisible();

  const naturalWidth = await page.getByTestId("globe-fallback-image").evaluate((node) => {
    return node instanceof HTMLImageElement ? node.naturalWidth : 0;
  });

  expect(naturalWidth).toBeGreaterThan(0);
}

test.beforeAll(() => {
  fs.mkdirSync(reviewDir, { recursive: true });
});

test("generate requested review screenshots", async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop-chromium") {
    await page.goto("/prototipos/globo");
    await expect(page.getByTestId("globe-prototype")).toBeVisible();
    await waitForReady3D(page);
    await page.locator(".globe-shell").screenshot({
      path: path.join(reviewDir, "globe-3d-desktop-final.png"),
    });

    await page.getByRole("button", { name: "Bergskrona", exact: true }).click();
    await waitForReady3D(page);
    await page.locator(".globe-shell").screenshot({
      path: path.join(reviewDir, "globe-3d-label-bounded.png"),
    });

    await page.getByRole("button", { name: "Girar 90 deg" }).click();
    await waitForReady3D(page);
    await page.locator(".globe-shell").screenshot({
      path: path.join(reviewDir, "globe-3d-rotated-back-v2.png"),
    });

    await page.getByRole("button", { name: "Mapa 2D" }).click();
    await waitForReady2D(page);
    await expect(page.getByTestId("globe-fallback")).toBeVisible();
    await page.locator(".globe-shell").screenshot({
      path: path.join(reviewDir, "globe-2d-fallback-final.png"),
    });
  }

  if (testInfo.project.name === "mobile-chromium") {
    await page.goto("/prototipos/globo");
    await expect(page.getByTestId("globe-prototype")).toBeVisible();
    await waitForReady3D(page);
    await page.locator(".globe-shell").screenshot({
      path: path.join(reviewDir, "globe-3d-mobile-final.png"),
    });
  }
});

test("record globe interaction demo video", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");

  const context = await browser.newContext({
    recordVideo: {
      dir: reviewDir,
      size: { width: 1440, height: 1080 },
    },
    viewport: { width: 1440, height: 1080 },
  });
  const page = await context.newPage();

  await page.goto("/prototipos/globo");
  await waitForReady3D(page);
  await page.waitForTimeout(1200);

  await page.locator(".globe-scene canvas").dragTo(page.locator(".globe-scene canvas"), {
    sourcePosition: { x: 660, y: 280 },
    targetPosition: { x: 360, y: 310 },
  });
  await page.mouse.wheel(0, 480);
  await page.waitForTimeout(700);

  await page.getByRole("button", { name: "Cathizar", exact: true }).click();
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Girar 90 deg" }).click();
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "Mapa 2D" }).click();
  await waitForReady2D(page);
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Globo 3D" }).click();
  await waitForReady3D(page);
  await page.waitForTimeout(1200);

  const video = page.video();
  await page.close();
  await context.close();

  if (video) {
    fs.copyFileSync(await video.path(), path.join(reviewDir, "globe-interaction-demo-final.webm"));
  }
});
