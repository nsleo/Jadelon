import Link from "next/link";
import type { ReactNode } from "react";

type SectionFrameProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  level?: "h1" | "h2";
};

type SurfaceProps = {
  className?: string;
  children: ReactNode;
  tone?: "default" | "muted" | "strong";
};

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function SkipLink() {
  return (
    <a className="skip-link" href="#main-content">
      Ir para o conteudo principal
    </a>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link className={joinClasses("text-link", className)} href={href}>
      {children}
    </Link>
  );
}

export function Surface({
  className,
  children,
  tone = "default",
}: SurfaceProps) {
  return (
    <div className={joinClasses("surface", `surface--${tone}`, className)}>
      {children}
    </div>
  );
}

export function SectionFrame({ id, className, children }: SectionFrameProps) {
  return (
    <section className={joinClasses("section-frame", className)} id={id}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  level = "h2",
}: SectionHeadingProps) {
  const HeadingTag = level;

  return (
    <header className={joinClasses("section-heading", `section-heading--${align}`)}>
      {eyebrow ? <p className="atlas-label">{eyebrow}</p> : null}
      <HeadingTag>{title}</HeadingTag>
      {description ? <p className="section-heading__description">{description}</p> : null}
    </header>
  );
}

export function AtlasLabel({ children }: { children: ReactNode }) {
  return <p className="atlas-label">{children}</p>;
}

export function CoordinateLabel({ children }: { children: ReactNode }) {
  return <span className="coordinate-label">{children}</span>;
}

export function DividerRune() {
  return (
    <div aria-hidden="true" className="divider-rune">
      <span />
    </div>
  );
}
