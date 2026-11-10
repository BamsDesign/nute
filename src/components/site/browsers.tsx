"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Article, Event, Intervention, Project } from "@/content/types";
import { ARTICLE_CATEGORIES, EVENT_TYPES, INTERVENTION_TYPES, PROJECT_CATEGORIES, labelOf } from "@/lib/taxonomy";
import { formatDate, formatMonth } from "@/lib/format";
import { ArticleCard, ProjectCard } from "./cards";
import { MediaFrame } from "./MediaFrame";
import { Timeline } from "./Timeline";
import { DemoBadge, EmptyState } from "./ui";

type Opt = { readonly value: string; readonly label: string };

/** Filtre côté navigateur, synchronisé avec le paramètre d'URL (lien partageable). */
function useFilter(param: string, options: readonly Opt[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get(param);
    if (v && options.some((o) => o.value === v)) setActive(v);
  }, [param, options]);
  const select = (v: string | null) => {
    setActive(v);
    const url = new URL(window.location.href);
    if (v) url.searchParams.set(param, v);
    else url.searchParams.delete(param);
    window.history.replaceState(null, "", url);
  };
  return [active, select] as const;
}

function FilterBar({ label, allLabel, options, active, onSelect, counts }: { label: string; allLabel: string; options: readonly Opt[]; active: string | null; onSelect: (v: string | null) => void; counts?: Map<string, number> }) {
  const total = counts ? [...counts.values()].reduce((a, b) => a + b, 0) : undefined;
  return (
    <div className="filters" role="group" aria-label={label}>
      <button type="button" className="filter" aria-pressed={!active} onClick={() => onSelect(null)}>
        {allLabel} {total !== undefined && <span className="count">{total}</span>}
      </button>
      {options.map((o) => (
        <button key={o.value} type="button" className="filter" aria-pressed={active === o.value} onClick={() => onSelect(o.value)}>
          {o.label} {counts && <span className="count">{counts.get(o.value) ?? 0}</span>}
        </button>
      ))}
    </div>
  );
}

const countBy = <T,>(items: T[], key: (t: T) => string) => {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1));
  return m;
};

export function ProjectsBrowser({ projects, emptyText }: { projects: Project[]; emptyText: string }) {
  const [active, select] = useFilter("categorie", PROJECT_CATEGORIES);
  const list = active ? projects.filter((p) => p.category === active) : projects;
  return (
    <>
      <FilterBar label="Filtrer par catégorie" allLabel="Toutes" options={PROJECT_CATEGORIES} active={active} onSelect={select} counts={countBy(projects, (p) => p.category)} />
      {list.length ? (
        <div className="cards">
          {list.map((p, i) => (
            <ProjectCard key={p.id} p={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <EmptyState text={active ? "Aucune réalisation n'est encore publiée dans cette catégorie." : emptyText} />
      )}
    </>
  );
}

export function InterventionsBrowser({ items, emptyText }: { items: Intervention[]; emptyText: string }) {
  const present = INTERVENTION_TYPES.filter((x) => items.some((i) => i.type === x.value));
  const [active, select] = useFilter("type", present);
  const list = active ? items.filter((i) => i.type === active) : items;
  if (!items.length) return <EmptyState text={emptyText} />;
  return (
    <>
      {present.length > 1 && <FilterBar label="Filtrer par type de lieu" allLabel="Tous" options={present} active={active} onSelect={select} />}
      <ul className="index-list">
        {list.map((i) => (
          <li key={i.id}>
            <Link href={`/interventions/${i.slug}`} className="index-row" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,4fr) minmax(0,4fr) auto" }}>
              <span className="index-row__num">{formatMonth(i.date) || "—"}</span>
              <span className="index-row__title">
                {i.name} {i.isDemo && <DemoBadge />}
                <span className="mono muted" style={{ display: "block", marginTop: "0.35rem", fontFamily: "var(--font-mono)" }}>
                  {labelOf(INTERVENTION_TYPES, i.type)} · {[i.city, i.department].filter(Boolean).join(", ")}
                </span>
              </span>
              <span className="index-row__text">{i.purpose}</span>
              <span className="index-row__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function EventsBrowser({ events, emptyText }: { events: Event[]; emptyText: string }) {
  const present = EVENT_TYPES.filter((x) => events.some((e) => e.type === x.value));
  const [active, select] = useFilter("type", present);
  const list = active ? events.filter((e) => e.type === active) : events;
  if (!events.length) return <EmptyState text={emptyText} />;
  return (
    <>
      {present.length > 1 && <FilterBar label="Filtrer par type d'activité" allLabel="Toutes" options={present} active={active} onSelect={select} />}
      <Timeline events={list} />
    </>
  );
}

export function ArticlesBrowser({ articles, emptyText }: { articles: Article[]; emptyText: string }) {
  const present = ARTICLE_CATEGORIES.filter((c) => articles.some((a) => a.category === c.value));
  const [active, select] = useFilter("categorie", present);
  const list = active ? articles.filter((a) => a.category === active) : articles;
  const featured = !active ? (list.find((a) => a.featured) ?? list[0]) : undefined;
  const rest = list.filter((a) => a.id !== featured?.id);
  if (!articles.length) return <EmptyState text={emptyText} />;
  return (
    <>
      {present.length > 1 && <FilterBar label="Catégories d'articles" allLabel="Tout" options={present} active={active} onSelect={select} />}
      {featured && (
        <Link href={`/actualites/${featured.slug}`} className="grid-12 card" style={{ marginBottom: "clamp(3rem, 2rem + 3vw, 5rem)", alignItems: "end" }}>
          <div style={{ gridColumn: "1 / span 7" }} className="project-lead">
            <MediaFrame src={featured.coverUrl} alt={featured.coverAlt ?? featured.title} ratio="16 / 10" priority label={labelOf(ARTICLE_CATEGORIES, featured.category)} />
          </div>
          <div style={{ gridColumn: "9 / span 4" }} className="stack project-rest">
            <span className="mono muted">
              {labelOf(ARTICLE_CATEGORIES, featured.category)} · {formatDate(featured.publishedAt)}
            </span>
            <h2 className="h3 card__title" style={{ fontSize: "var(--fs-xl)" }}>
              {featured.title}
            </h2>
            <p className="muted">{featured.excerpt}</p>
          </div>
        </Link>
      )}
      {rest.length > 0 && (
        <div className="cards">
          {rest.map((a) => (
            <ArticleCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </>
  );
}
