import { getInterventions } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { INTERVENTION_TYPES, labelOf } from "@/lib/taxonomy";
import { formatMonth } from "@/lib/format";
import { InterventionsBrowser } from "@/components/site/browsers";
import { getDictionary } from "@/i18n";
import { PageHero } from "@/components/site/ui";
import { HaitiMap, type MapPoint } from "@/components/site/HaitiMap";
import { CtaBand } from "@/components/site/CtaBand";

export async function generateMetadata() {
  return pageMetadata({
    path: "/interventions",
    title: "Nos interventions — là où NUTE a travaillé en Haïti",
    description: "Écoles, universités, entreprises, institutions et communautés : les lieux où NUTE est intervenu, présentés avec le travail réalisé.",
  });
}

export default async function InterventionsPage() {
  const [all, t] = await Promise.all([getInterventions(), getDictionary()]);
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
          <InterventionsBrowser items={all} emptyText={t("empty.interventions")} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
