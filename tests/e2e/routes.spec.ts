import { test, expect } from "@playwright/test";

const forbiddenPublicPhrases = [
  "fundacao",
  "fundação",
  "provisorio",
  "provisório",
  "placeholder",
  "runtime",
  "base publica",
  "base pública",
  "entradas publicas",
  "entradas públicas",
  "precisao atual",
  "precisão atual",
  "shell",
  "sem 3d nesta fase",
  "modelo temporal",
  "conteudo secreto",
  "conteúdo secreto",
  "atlaspreviewslot",
  "chronologypreviewslot",
  "heroglobeslot",
];

test("home route exposes the structural shell and primary navigation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Um mundo registrado por mapas, eras e testemunhos.",
    }),
  ).toBeVisible();
  const primaryNav = page.getByRole("navigation", { name: "Navegacao principal" });

  await expect(primaryNav.getByRole("link", { name: "Atlas", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Cronologia", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Figuras", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Eternos", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Magia", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Registros", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Helix" })).toHaveCount(0);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByTestId("public-globe")).toBeVisible();

  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  for (const phrase of forbiddenPublicPhrases) {
    expect(bodyText).not.toContain(phrase);
  }
});

test("home hero uses the promoted public globe without laboratory controls", async ({ page, isMobile }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  const publicGlobe = page.getByTestId("public-globe");
  await expect(publicGlobe).toBeVisible();
  await expect(publicGlobe).toHaveAttribute("data-texture-id", "map-globe-jadelon-v1");
  await expect(publicGlobe).toHaveAttribute(
    "data-texture-url",
    "/assets/jadelon/maps/mapa-globo-jadelon-v1.webp",
  );
  await expect(publicGlobe).toHaveAttribute("data-fallback-asset-id", "map-atlas-jadelon-v1");
  await expect(page.getByText("Controles de laboratorio do globo")).toHaveCount(0);
  await expect(page.getByText("Diagnostico do prototipo")).toHaveCount(0);

  if (isMobile) {
    await expect(publicGlobe).toHaveAttribute("data-globe-state", "ready-2d");
  } else {
    await expect(publicGlobe).toHaveAttribute("data-globe-state", /ready-(2d|3d)/);
  }

  expect(consoleErrors).toEqual([]);
});

test("skip link targets the main content landmark", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Ir para o conteudo principal" });
  await skipLink.focus();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("basic navigation works across the minimum published routes", async ({ page }) => {
  const routes = [
    { href: "/atlas", heading: "Geografia conhecida" },
    { href: "/cronologia", heading: "Cronologia conhecida" },
    { href: "/figuras", heading: "Figuras registradas" },
    { href: "/eternos", heading: "Eternos" },
    { href: "/magia", heading: "Magia e Véu" },
    { href: "/registros", heading: "Registros preservados" },
  ];

  await page.goto("/");

  for (const route of routes) {
    await page.goto(route.href);
    await expect(page).toHaveURL(new RegExp(`${route.href}$`));
    await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
  }
});

test("mobile navigation can be opened and closed", async ({ page, isMobile }) => {
  test.skip(!isMobile);

  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Alternar menu principal" });
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Magia" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await page.locator("#main-content").click({ position: { x: 8, y: 8 } });
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  await page.getByRole("link", { name: "Magia" }).click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
});

test("reduced motion collapses transition duration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const duration = await page.locator(".site-navigation__link").first().evaluate((node) => {
    return window.getComputedStyle(node).transitionDuration;
  });

  expect(["0.01ms", "1e-05s"]).toContain(duration);
  await expect(page.getByTestId("public-globe")).toHaveAttribute("data-auto-rotate", "off");
});

test("home and placeholder pages keep semantic headings", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveCount(1);

  await page.goto("/atlas");
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("all rendered images load with a non-zero natural width", async ({ page }) => {
  await page.goto("/");

  const images = page.locator("img");
  await expect(images).toHaveCount(2);

  const widths = await images.evaluateAll((nodes) =>
    nodes.map((node) => (node instanceof HTMLImageElement ? node.naturalWidth : 0)),
  );

  expect(widths.every((width) => width > 0)).toBe(true);
});

test("approved names of Os Seis are shown without technical placeholders", async ({ page }) => {
  await page.goto("/");

  for (const name of [
    "Abre-Sol",
    "Forja-Véus",
    "Polaris Erte",
    "Consome-Lampejo",
    "Hva Sanden Laget",
    "Deus do Oculto",
  ]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }

  await expect(page.getByText("Manifestacao I")).toHaveCount(0);
  await expect(page.getByText("Manifestacao II")).toHaveCount(0);
});

test("hero title remains responsive without overflow on mobile and desktop", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 1;
  });

  expect(overflow).toBe(false);
});

test("hero CTA takes the visitor directly to the Atlas", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("hero-primary-atlas-cta").click();
  await expect(page).toHaveURL(/\/atlas$/);
  await expect(page.getByRole("heading", { name: "Geografia conhecida" })).toBeVisible();
});

test("review pages run without development overlays", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nextjs-portal")).toHaveCount(0);
  await expect(page.locator("[data-next-badge-root]")).toHaveCount(0);
});

test("prototype globe route stays outside the main navigation and exposes noindex", async ({ page }) => {
  await page.goto("/prototipos/globo");

  await expect(
    page.getByRole("heading", { name: "Globo de Jadelon" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Globo" })).toHaveCount(0);

  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/i);
});

test("prototype globe exposes ready states and keeps 3D diagnostics outside public routes", async ({ page, isMobile }) => {
  await page.goto("/prototipos/globo");

  const globe = page.getByTestId("globe-prototype");
  await expect(globe).toHaveAttribute("data-globe-state", "ready-3d", { timeout: 20000 });
  await expect(globe).toHaveAttribute("data-globe-mode", "3d");
  await expect(page.getByText("Renderer", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Mapa 2D" }).click();
  await expect(globe).toHaveAttribute("data-globe-state", "ready-2d");
  await expect(globe).toHaveAttribute("data-globe-mode", "2d");

  if (isMobile) {
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    expect(overflow).toBe(false);
  }
});
