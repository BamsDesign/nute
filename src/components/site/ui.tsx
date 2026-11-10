import Link from "next/link";
import type { ReactNode } from "react";
import { absoluteUrl } from "@/lib/site-url";

export function Arrow({ dir = "right" }: { dir?: "right" | "left" | "up-right" }) {
  const glyph = dir === "left" ? "←" : dir === "up-right" ? "↗" : "→";
  return (
    <span className="arrow" aria-hidden="true">
      {glyph}
    </span>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  // Échappement de « < » pour empêcher toute injection dans la balise script.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Accueil", path: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Fil d'Ariane">
        <ol>
          {all.map((it, i) => (
            <li key={it.path}>
              {i < all.length - 1 ? <Link href={it.path}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
        }}
      />
    </>
  );
}

export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  aside,
}: {
  crumbs: { name: string; path: string }[];
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="page-hero">
      <div className="container">
        <Breadcrumbs items={crumbs} />
        <div className="page-hero__grid">
          <div className="page-hero__title">
            {eyebrow && (
              <p className="eyebrow" data-reveal>
                {eyebrow}
              </p>
            )}
            <h1 className="display-2" style={{ marginTop: eyebrow ? "1.25rem" : 0 }} data-reveal>
              {title}
            </h1>
          </div>
          {intro && (
            <div className="page-hero__intro lead" data-reveal>
              {intro}
            </div>
          )}
          {aside && <div className="page-hero__aside">{aside}</div>}
        </div>
      </div>
    </header>
  );
}

export function SectionHead({
  index,
  label,
  title,
  aside,
  action,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  aside?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <p className="section-head__label eyebrow" data-reveal>
        {index ? `${index} — ${label}` : label}
      </p>
      <h2 className="section-head__title h2" data-reveal>
        {title}
      </h2>
      {(aside || action) && (
        <div className="section-head__aside" data-reveal>
          {aside && <div className="muted">{aside}</div>}
          {action}
        </div>
      )}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="badge badge--demo" title="Contenu de démonstration, à remplacer par un contenu vérifié">
      Exemple
    </span>
  );
}

export function DemoNote() {
  return (
    <p className="demo-note" role="note">
      <strong>Exemple.</strong> Ce contenu est une démonstration de mise en page. Il ne décrit pas une réalisation réelle de NUTE et sera remplacé par un contenu documenté.
    </p>
  );
}

export function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="empty" data-reveal>
      <span className="mono muted">En préparation</span>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Facts({ items }: { items: [string, ReactNode | null | undefined][] }) {
  const rows = items.filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!rows.length) return null;
  return (
    <dl className="facts">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
