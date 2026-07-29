import fs from "node:fs";
import path from "node:path";

import { expect, test, type Locator, type Page } from "@playwright/test";

const projectionMeta = {
  p55: {
    checksum: "4d706a9d61adb1bbcba882fe84aaceb1",
    id: "mapa-globo-projection-p55",
    url: "/assets/jadelon/maps/candidates/mapa-globo-projection-p55.webp",
  },
  p60: {
    checksum: "26df3428b8bf1b1ebcd8251b687b6e5a",
    id: "mapa-globo-projection-p60",
    url: "/assets/jadelon/maps/candidates/mapa-globo-projection-p60.webp",
  },
  p65: {
    checksum: "61ee4cd620dbb255be86d7bccd9d4e1c",
    id: "mapa-globo-projection-p65",
    url: "/assets/jadelon/maps/candidates/mapa-globo-projection-p65.webp",
  },
} as const;

type ProjectionKey = keyof typeof projectionMeta;

function reviewPath(name: string) {
  return `artifacts/review/${name}`;
}

async function expectImageLoaded(page: Page, testId: string) {
  const image = page.getByTestId(testId);
  await expect(image).toBeVisible();
  const width = await image.evaluate((node) =>
    node instanceof HTMLImageElement ? node.naturalWidth : 0,
  );
  expect(width).toBeGreaterThan(0);
}

async function waitForProjectionState(
  panel: Locator,
  projection: ProjectionKey,
  state: "ready-3d",
) {
  const globe = panel.getByTestId("globe-prototype");

  await expect(globe).toHaveAttribute("data-projection", projection);
  await expect(globe).toHaveAttribute("data-texture-id", projectionMeta[projection].id);
  await expect(globe).toHaveAttribute("data-texture-url", projectionMeta[projection].url);
  await expect(globe).toHaveAttribute(
    "data-texture-checksum",
    projectionMeta[projection].checksum,
  );
  await expect(globe).toHaveAttribute("data-globe-state", state, {
    timeout: 20000,
  });

  await expect(globe).toHaveAttribute(
    "data-loaded-texture-id",
    projectionMeta[projection].id,
  );
  await expect(globe).toHaveAttribute(
    "data-loaded-texture-url",
    new RegExp(`^${projectionMeta[projection].url.replace(/\./g, "\\.")}\\?v=`),
  );
}

async function pauseAutoRotate(panel: Locator) {
  const controls = panel.getByRole("region", {
    name: "Controles de laboratorio do globo",
  });
  const rotationToggle = controls.getByTestId("globe-rotation-toggle");

  await expect(rotationToggle).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(rotationToggle).toBeVisible();
  await expect(rotationToggle).toBeEnabled();
  await rotationToggle.scrollIntoViewIfNeeded();
  const rotationState = await rotationToggle.getAttribute("data-rotation-state");

  if (rotationState === "running") {
    await rotationToggle.click({ trial: true });
    await rotationToggle.click();
  }

  await expect(rotationToggle).toHaveAttribute("data-rotation-state", "paused");
}

async function setView(panel: Locator, label: "Frente" | "Norte" | "Sul" | "Esquerda" | "Direita" | "Traseira") {
  await panel.getByRole("button", { name: label }).first().click();
  await panel.page().waitForTimeout(900);
}

async function switchProjection(
  page: Page,
  panel: Locator,
  projection: ProjectionKey,
) {
  const globe = panel.getByTestId("globe-prototype");
  const previousTextureId = await globe.getAttribute("data-loaded-texture-id");
  const previousTextureUrl = await globe.getAttribute("data-loaded-texture-url");

  await page.getByTestId(`projection-switch-${projection}`).click();
  await waitForProjectionState(panel, projection, "ready-3d");
  await expect(globe).not.toHaveAttribute("data-loaded-texture-id", previousTextureId ?? "");
  await expect(globe).not.toHaveAttribute("data-loaded-texture-url", previousTextureUrl ?? "");
  await expect(panel.locator("canvas")).toBeVisible();
}

function createRuntimeErrorTracker(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  return {
    assertClean() {
      expect(consoleErrors, "Unexpected browser console errors").toEqual([]);
      expect(pageErrors, "Unexpected page errors").toEqual([]);
    },
  };
}

test("cartography route exposes noindex and isolates candidate assets from navigation", async ({
  page,
  isMobile,
}) => {
  await page.goto("/prototipos/cartografia");

  await expect(page.getByRole("heading", { name: "Calibracao cartografica" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cartografia" })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  if (isMobile) {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    expect(overflow).toBe(false);
  }
});

test("cartography route loads clean-source imagery, masks and seam previews", async ({ page }) => {
  await page.goto("/prototipos/cartografia");

  await expectImageLoaded(page, "cartography-active-image");
  await expectImageLoaded(page, "cartography-mask-image");

  await page.getByRole("button", { name: "Atlas limpo" }).click();
  await page.getByTestId("cartography-stage").screenshot({
    path: reviewPath("atlas-clean-source.png"),
  });

  await page.getByTestId("cartography-masks-all").screenshot({
    path: reviewPath("new-continent-masks.png"),
  });

  await page.getByTestId("cartography-seam-preview").screenshot({
    path: reviewPath("projection-clean-seams-final.png"),
  });
});

test("cartography route proves real projection texture identities and captures clean projection screenshots", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180000);
  test.skip(isMobile);

  await page.goto("/prototipos/cartografia");
  const runtimeErrors = createRuntimeErrorTracker(page);

  const verifier = page.getByTestId("cartography-projection-live");
  await waitForProjectionState(verifier, "p55", "ready-3d");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Frente");
  await verifier.screenshot({ path: reviewPath("projection-p55-front-clean-final.png") });
  await setView(verifier, "Norte");
  await verifier.screenshot({ path: reviewPath("projection-p55-north-clean-final.png") });
  await setView(verifier, "Sul");
  await verifier.screenshot({ path: reviewPath("projection-p55-south-clean-final.png") });

  await switchProjection(page, verifier, "p60");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Frente");
  await verifier.screenshot({ path: reviewPath("projection-p60-front-clean-final.png") });
  await setView(verifier, "Norte");
  await verifier.screenshot({ path: reviewPath("projection-p60-north-clean-final.png") });
  await setView(verifier, "Sul");
  await verifier.screenshot({ path: reviewPath("projection-p60-south-clean-final.png") });

  await switchProjection(page, verifier, "p65");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Frente");
  await verifier.screenshot({ path: reviewPath("projection-p65-front-clean-final.png") });
  await setView(verifier, "Norte");
  await verifier.screenshot({ path: reviewPath("projection-p65-north-clean-final.png") });
  await setView(verifier, "Sul");
  await verifier.screenshot({ path: reviewPath("projection-p65-south-clean-final.png") });

  await switchProjection(page, verifier, "p55");
  await waitForProjectionState(verifier, "p55", "ready-3d");

  await page.getByTestId("cartography-projection-identities").screenshot({
    path: reviewPath("projection-texture-identities-final.png"),
  });
  runtimeErrors.assertClean();
});

test("cartography route captures side-by-side and backside comparison using the clean projections", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(120000);
  test.skip(isMobile);

  await page.goto("/prototipos/cartografia");

  const p55 = page.getByTestId("cartography-globe-p55");
  const p60 = page.getByTestId("cartography-globe-p60");
  const p65 = page.getByTestId("cartography-globe-p65");

  for (const [panel, projection] of [
    [p55, "p55"],
    [p60, "p60"],
    [p65, "p65"],
  ] as const) {
    await waitForProjectionState(panel, projection, "ready-3d");
    await pauseAutoRotate(panel);
    await setView(panel, "Frente");
  }

  await page.getByTestId("cartography-projection-identities").screenshot({
    path: reviewPath("projection-clean-side-by-side-final.png"),
  });

  for (const panel of [p55, p60, p65]) {
    await setView(panel, "Traseira");
  }

  await page.getByTestId("cartography-projection-identities").screenshot({
    path: reviewPath("projection-clean-backside-final.png"),
  });
});

test("cartography route records a clean comparison video with real projection reloads", async ({
  browser,
}, testInfo) => {
  test.setTimeout(120000);
  test.skip(testInfo.project.name !== "desktop-chromium");

  const reviewDir = path.resolve(process.cwd(), "artifacts/review");
  fs.mkdirSync(reviewDir, { recursive: true });

  const context = await browser.newContext({
    recordVideo: {
      dir: reviewDir,
      size: { width: 1440, height: 1080 },
    },
    viewport: { width: 1440, height: 1080 },
  });
  const page = await context.newPage();
  const runtimeErrors = createRuntimeErrorTracker(page);

  await page.goto("/prototipos/cartografia");

  const verifier = page.getByTestId("cartography-projection-live");
  await waitForProjectionState(verifier, "p55", "ready-3d");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Norte");
  await setView(verifier, "Sul");

  await switchProjection(page, verifier, "p60");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Norte");
  await setView(verifier, "Sul");

  await switchProjection(page, verifier, "p65");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Norte");
  await setView(verifier, "Sul");
  await setView(verifier, "Traseira");
  await setView(verifier, "Frente");
  await switchProjection(page, verifier, "p55");
  await pauseAutoRotate(verifier);
  await setView(verifier, "Frente");
  await page.waitForTimeout(1200);
  runtimeErrors.assertClean();

  const video = page.video();
  await page.close();
  await context.close();

  if (video) {
    fs.copyFileSync(
      await video.path(),
      path.join(reviewDir, "projection-p55-p60-p65-comparison-final.webm"),
    );
  }
});

test("cartography route keeps mobile calibration readable without overflow", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile);

  await page.goto("/prototipos/cartografia");
  await page.screenshot({
    path: reviewPath("cartography-mobile-calibration.png"),
    fullPage: true,
  });
});
