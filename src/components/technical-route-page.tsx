import Link from "next/link";

type RouteLink = {
  href: string;
  label: string;
};

type TechnicalRoutePageProps = {
  route: string;
  title: string;
  description: string;
  links: RouteLink[];
};

export function TechnicalRoutePage({
  route,
  title,
  description,
  links,
}: TechnicalRoutePageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
          Fundacao tecnica
        </p>
        <h1 className="mt-4 text-4xl text-balance">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          {description}
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--surface-border)] bg-white/70 p-8">
        <h2 className="text-lg font-semibold">Rota</h2>
        <p className="mt-2 text-[var(--muted)]">{route}</p>
      </section>

      <section className="rounded-2xl border border-[var(--surface-border)] bg-white/70 p-8">
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="mt-2 leading-8 text-[var(--muted)]">
          Esta pagina existe apenas para validar a fundacao do App Router, o
          encadeamento minimo entre rotas e a separacao entre runtime e conteudo
          editorial.
        </p>
      </section>

      <nav className="rounded-2xl border border-[var(--surface-border)] bg-white/70 p-8">
        <h2 className="text-lg font-semibold">Navegacao tecnica</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex rounded-full border border-[var(--surface-border)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}

