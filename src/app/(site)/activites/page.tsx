import Link from "next/link";
import { getEvents } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { EVENT_TYPES } from "@/lib/taxonomy";
import { getDictionary } from "@/i18n";
import { EmptyState, PageHero } from "@/components/site/ui";
import { EventCard } from "@/components/site/cards";
import { Timeline } from "@/components/site/Timeline";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata({
    path: "/activites",
    title: "Activités et événements — séminaires, formations, conférences",
    description: "Séminaires, formations, conférences, ateliers, démonstrations technologiques et visites institutionnelles : la chronologie des activités de NUTE.",
  });
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const [all, t] = await Promise.all([getEvents(), getDictionary()]);
  const now = new Date();
  const active = EVENT_TYPES.some((x) => x.value === type) ? type : undefined;
  const upcoming = all.filter((e) => e.date >= now).reverse();
  const past = all.filter((e) => e.date < now && (!active || e.type === active));
  const presentTypes = EVENT_TYPES.filter((x) => all.some((e) => e.type === x.value));

  return (
    <>
      <PageHero
        crumbs={[{ name: "Activités", path: "/activites" }]}
        eyebrow="Activités et événements"
        title="L'évolution de nos activités."
        intro="Séminaires organisés ou suivis, formations, conférences, ateliers, démonstrations, visites institutionnelles et activités communautaires."
      />
      {upcoming.length > 0 && (
        <section className="section section--surface" aria-labelledby="a-venir">
          <div className="container">
            <h2 id="a-venir" className="eyebrow" style={{ marginBottom: "2.5rem" }}>
              À venir
            </h2>
            <div className="cards">
              {upcoming.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section" aria-labelledby="chronologie">
        <div className="container">
          <h2 id="chronologie" className="eyebrow" style={{ marginBottom: "2.5rem" }}>
            Chronologie
          </h2>
          {presentTypes.length > 1 && (
            <nav className="filters" aria-label="Filtrer par type d'activité">
              <Link href="/activites" className="filter" aria-current={!active ? "true" : undefined} scroll={false}>
                Toutes
              </Link>
              {presentTypes.map((x) => (
                <Link key={x.value} href={`/activites?type=${x.value}`} className="filter" aria-current={active === x.value ? "true" : undefined} scroll={false}>
                  {x.label}
                </Link>
              ))}
            </nav>
          )}
          {past.length ? <Timeline events={past} /> : <EmptyState text={t("empty.events")} />}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
