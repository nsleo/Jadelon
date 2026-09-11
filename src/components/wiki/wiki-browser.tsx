"use client";

import { useMemo, useState } from "react";

import { wikiCategories, wikiEntries, type WikiCategory } from "@/content/wiki/entries";

const categoryLabels = new Map(wikiCategories.map((category) => [category.id, category.label]));

export function WikiBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WikiCategory | "all">("all");
  const [privateVisible, setPrivateVisible] = useState(true);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return wikiEntries.filter((entry) => {
      if (!privateVisible && entry.access === "private") return false;
      if (category !== "all" && entry.category !== category) return false;
      if (!normalizedQuery) return true;

      return [entry.name, entry.summary, entry.body, ...entry.tags]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery);
    });
  }, [category, privateVisible, query]);

  return (
    <div className="wiki-browser">
      <aside className="wiki-browser__index" aria-label="Índice da wiki">
        <div className="wiki-browser__index-heading">
          <p className="atlas-label">Índice do arquivo</p>
          <strong>{wikiEntries.length} verbetes</strong>
        </div>
        <button
          className={`wiki-browser__category${category === "all" ? " is-active" : ""}`}
          onClick={() => setCategory("all")}
          type="button"
        >
          Todos os verbetes
        </button>
        {wikiCategories.map((item) => (
          <button
            className={`wiki-browser__category${category === item.id ? " is-active" : ""}`}
            key={item.id}
            onClick={() => setCategory(item.id)}
            type="button"
          >
            <span>{item.label}</span>
            <small>{wikiEntries.filter((entry) => entry.category === item.id).length}</small>
          </button>
        ))}
      </aside>

      <section className="wiki-browser__results" aria-live="polite">
        <div className="wiki-browser__toolbar">
          <label className="wiki-browser__search">
            <span>Buscar na wiki</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome, lugar, casa, Eterno..."
              type="search"
              value={query}
            />
          </label>
          <label className="wiki-browser__toggle">
            <input
              checked={privateVisible}
              onChange={(event) => setPrivateVisible(event.target.checked)}
              type="checkbox"
            />
            <span>Mostrar lore privada</span>
          </label>
        </div>

        <p className="wiki-browser__count">
          {filteredEntries.length} resultado{filteredEntries.length === 1 ? "" : "s"}
          {category !== "all" ? ` em ${categoryLabels.get(category)}` : ""}
        </p>

        <div className="wiki-browser__list">
          {filteredEntries.map((entry) => (
            <article className="wiki-entry" id={entry.slug} key={entry.id}>
              <div className="wiki-entry__meta">
                <span className="wiki-entry__category">{categoryLabels.get(entry.category)}</span>
                <span className={`wiki-entry__status wiki-entry__status--${entry.access}`}>
                  {entry.access === "private" ? "Privado" : "Público"}
                </span>
              </div>
              <h2>{entry.name}</h2>
              <p className="wiki-entry__summary">{entry.summary}</p>
              <p className="wiki-entry__body">{entry.body}</p>
              <footer className="wiki-entry__footer">
                <span>{entry.status === "canon" ? "Canon confirmado" : entry.status === "private-review" ? "Em revisão privada" : "Definido para a V1"}</span>
                <span>{entry.sourceDocs.join(" · ")}</span>
              </footer>
            </article>
          ))}
          {!filteredEntries.length ? <p className="wiki-browser__empty">Nenhum verbete corresponde à busca atual.</p> : null}
        </div>
      </section>
    </div>
  );
}
