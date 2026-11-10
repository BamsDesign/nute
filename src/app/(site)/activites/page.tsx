import { getEvents } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";
import { PageHero } from "@/components/site/ui";
import { EventCard } from "@/components/site/cards";
import { EventsBrowser } from "@/components/site/browsers";
import { CtaBand } from "@/components/site/CtaBand";

export async function generateMetadata() {
  return pageMetadata({
    path: "/activites",
    title: "Activités et événements — séminaires, formations, conférences",
    description: "Séminaires, formations, conférences, ateliers, démonstrations technologiques et visites institutionnelles : la chronologie des activités de NUTE.",
  });
}

export default async function EventsPage() {
  const [all, t] = await Promise.all([getEvents(), getDictionary()]);
  const now = new Date();
  const upcoming = all.filter((e) => e.date >= now).reverse();
  const past = all.filter((e) => e.date < now);

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
          <EventsBrowser events={past} emptyText={t("empty.events")} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
