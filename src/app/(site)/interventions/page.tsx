import Link from "next/link";
import { getInterventions } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { INTERVENTION_TYPES, labelOf } from "@/lib/taxonomy";
import { formatMonth } from "@/lib/format";
import { getDictionary } from "@/i18n";
import { DemoBadge, EmptyState, PageHero } from "@/components/site/ui";
import { HaitiMap, type MapPoint } from "@/components/site/HaitiMap";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata({
    path: "/interventions",
    title: "Nos interventions — là où NUTE a travaillé en Haïti",
    description: "Écoles, universités, entreprises, institutions et communautés : les lieux où NUTE est intervenu, présentés avec le travail réalisé.",
  });
}

export default async function InterventionsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const [all, t] = await Promise.all([getInterventions(), getDictionary()]);
  const active = INTERVENTION_TYPES.some((x) => x.value === type) ? type : undefined;
  const list = active ? all.filter((i) => i.type === active) : all;
  const points: MapPoint[] = all
    .filter((i) => i.latitude != null && i.longitude != null)
    .map((i) => ({
      id: i.id,
      slug: i.slug,
      name: i.name,
      city: i.city,
      department: i.department,
      typeLabel: labelOf(INTERVENTION_TYPES, i.type),
      dateLabel: formatMonth(i.date),
      lat: i.latitude!,
      lng: i.longitude!,
      isDemo: i.isDemo,
    }));
  const departments = new Set(all.map((i) => i.department).filter(Boolean));
  const presentTypes = INTERVENTION_TYPES.filter((x) => all.some((i) => i.type === x.value));

  return (
    <>
      <PageHero
        crumbs={[{ name: "Interventions", path: "/interventions" }]}
        eyebrow="Expérience de terrain"
        title="Là où nous avons travaillé."
        intro="Écoles, universités, entreprises, institutions, organisations et communautés : chaque lieu présenté ici correspond à une intervention documentée de NUTE."
        aside={
          all.length > 0 && (
            <dl className="stack" style={{ "--stack": "0.25rem" } as React.CSSProperties}>
              <dt className="mono muted">Lieux documentés</dt>
              <dd className="display-2" style={{ margin: 0 }}>
                {all.length}
              </dd>
              {departments.size > 0 && (
                <dd className="muted" style={{ margin: 0 }}>
                  dans {departments.size} département{departments.size > 1 ? "s" : ""}
                </dd>
              )}
            </dl>
          )
        }
      />

      <section className="section section--surface" aria-label="Carte des interventions">
        <div className="container">
          <HaitiMap points={points} />
        </div>
      </section>

      <section className="section" aria-labelledby="liste">
        <div className="container">
          <h2 id="liste" className="sr-only">
            Liste des interventions
          </h2>
          {presentTypes.length > 1 && (
            <nav className="filters" aria-label="Filtrer par type de lieu">
              <Link href="/interventions" className="filter" aria-current={!active ? "true" : undefined} scroll={false}>
                Tous
              </Link>
              {presentTypes.map((x) => (
                <Link key={x.value} href={`/interventions?type=${x.value}`} className="filter" aria-current={active === x.value ? "true" : undefined} scroll={false}>
                  {x.label}
                </Link>
              ))}
            </nav>
          )}
          {list.length ? (
            <ul className="index-list">
              {list.map((i) => (
                <li key={i.id} data-reveal>
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
          ) : (
            <EmptyState text={t("empty.interventions")} />
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
