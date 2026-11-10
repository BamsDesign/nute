import Link from "next/link";
import { getEvents, getServiceCatalogue } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { LEARNING_EVENT_TYPES } from "@/lib/taxonomy";
import { Arrow, EmptyState, PageHero, SectionHead } from "@/components/site/ui";
import { EventCard } from "@/components/site/cards";
import { Timeline } from "@/components/site/Timeline";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata({
    path: "/formations",
    title: "Formations et séminaires informatiques en Haïti",
    description: "Formations informatiques, ateliers pratiques, séminaires et initiation aux outils numériques pour les particuliers, écoles, entreprises et institutions.",
  });
}

export default async function TrainingPage() {
  const [events, catalogue] = await Promise.all([getEvents({ types: LEARNING_EVENT_TYPES }), getServiceCatalogue()]);
  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now).reverse();
  const past = events.filter((e) => e.date < now);
  const offer = catalogue.find((c) => c.slug === "formation-et-accompagnement");
  const topics = [...new Set(past.flatMap((e) => e.topics))].slice(0, 24);

  return (
    <>
      <PageHero
        crumbs={[{ name: "Formations", path: "/formations" }]}
        eyebrow="Formations et séminaires"
        title="Partager le savoir technologique."
        intro="Formations, ateliers pratiques et séminaires pour rendre la technologie accessible, compréhensible et utile — aux individus comme aux organisations."
        aside={
          <Link href="/contact?service=formations-informatiques" className="btn">
            Demander une formation <Arrow />
          </Link>
        }
      />

      {offer && (
        <section className="section section--surface" aria-labelledby="offre">
          <div className="container">
            <SectionHead index="01" label="Notre offre" title={<span id="offre">Des formats adaptés à chaque public.</span>} aside={offer.summary} />
            <ul className="index-list">
              {offer.services.map((s, i) => (
                <li key={s.id} data-reveal>
                  <Link href={`/services/${s.slug}`} className="index-row">
                    <span className="index-row__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="index-row__title">{s.title}</span>
                    <span className="index-row__text">{s.summary}</span>
                    <span className="index-row__arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="section" aria-labelledby="prochaines">
          <div className="container">
            <SectionHead index="02" label="Prochaines sessions" title={<span id="prochaines">Opportunités de formation à venir.</span>} />
            <div className="cards">
              {upcoming.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="realisees">
        <div className="container">
          <SectionHead index={upcoming.length ? "03" : "02"} label="Formations et séminaires réalisés" title={<span id="realisees">Ce que nous avons déjà transmis.</span>} />
          {topics.length > 0 && (
            <div style={{ marginBottom: "3rem" }} data-reveal>
              <p className="mono muted" style={{ marginBottom: "0.75rem", textTransform: "uppercase" }}>Thèmes abordés</p>
              <ul className="tags">
                {topics.map((t) => (
                  <li key={t} className="badge">{t}</li>
                ))}
              </ul>
            </div>
          )}
          {past.length ? <Timeline events={past} /> : <EmptyState text="Les formations, ateliers et séminaires déjà réalisés par NUTE seront présentés ici avec leurs thèmes, lieux et photographies." />}
        </div>
      </section>

      <CtaBand title="Former votre équipe ou votre communauté ?" text="Écoles, entreprises, institutions, organisations ou particuliers : indiquez-nous votre public, vos objectifs et vos contraintes, nous construisons une formation adaptée." />
    </>
  );
}
