"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { AtlasLabel, TextLink } from "@/components/site/primitives";

const navigationItems = [
  { href: "/atlas", label: "Atlas" },
  { href: "/cronologia", label: "Cronologia" },
  { href: "/figuras", label: "Figuras" },
  { href: "/eternos", label: "Eternos" },
  { href: "/magia", label: "Magia" },
  { href: "/registros", label: "Registros" },
];

export function SiteNavigation({
  mobileOpen,
  onNavigate,
}: {
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacao principal"
      className="site-navigation"
      data-mobile-open={mobileOpen}
    >
      <ul>
        {navigationItems.map((item) => {
          const active = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className="site-navigation__link"
                href={item.href}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SiteHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!panel || !toggle) {
      return;
    }

    const getFocusable = () =>
      [toggle, ...Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))];

    const focusable = getFocusable();
    focusable[1]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggle?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const nodes = getFocusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (headerRef.current?.contains(target)) {
        return;
      }

      setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <div className="site-brand">
          <AtlasLabel>Mapas, eras e testemunhos</AtlasLabel>
          <Link className="site-brand__link" href="/">
            Jadelon
          </Link>
        </div>

        <button
          aria-controls={panelId}
          aria-expanded={mobileOpen}
          aria-label="Alternar menu principal"
          className="site-header__toggle"
          onClick={() => setMobileOpen((open) => !open)}
          ref={toggleRef}
          type="button"
        >
          Menu
        </button>
      </div>

      <div id={panelId} ref={panelRef}>
        <SiteNavigation
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <AtlasLabel>Jadelon</AtlasLabel>
          <p>
            Um mundo registrado por mapas, eras e testemunhos.
          </p>
        </div>
        <div>
          <AtlasLabel>Navegacao</AtlasLabel>
          <p>
            <TextLink href="/atlas">Atlas</TextLink>
            {" · "}
            <TextLink href="/cronologia">Cronologia</TextLink>
            {" · "}
            <TextLink href="/registros">Registros</TextLink>
          </p>
        </div>
        <div>
          <AtlasLabel>Leitura</AtlasLabel>
          <p>
            Certos trechos permanecem incompletos, mas o mapa conhecido ja
            pode ser percorrido.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="site-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
