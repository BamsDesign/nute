import { notFound } from "next/navigation";
import { getIntervention } from "@/lib/queries";
import { loadGallery } from "@/lib/gallery";
import { pageMetadata } from "@/lib/seo";
import { INTERVENTION_TYPES, labelOf } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { DemoNote, Facts, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { Gallery } from "@/components/site/Gallery";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const i = await getIntervention((await params).slug);
  if (!i) return {};
  return pageMetadata({ path: `/interventions/${i.slug}`, title: `Intervention — ${i.name}`, description: i.purpose, image: i.coverUrl, noindex: i.isDemo });
}

export default async function InterventionPage({ params }: { params: Promise<{ slug: string }> }) {
  const i = await getIntervention((await params).slug);
  if (!i) notFound();
  const { gallery } = await loadGallery("Intervention", i.id);
  const type = labelOf(INTERVENTION_TYPES, i.type);
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Interventions", path: "/interventions" },
          { name: i.name, path: `/interventions/${i.slug}` },
        ]}
        eyebrow={`${type}${i.city ? ` · ${i.city}` : ""}`}
        title={i.name}
        intro={i.purpose}
      />
      <section className="section">
        <div className="container split">
          <div className="split__side split__side--sticky">
            <Facts
              items={[
                ["Type de lieu", type],
                ["Ville", i.city],
                ["Département", i.department],
                ["Date", i.date ? formatDate(i.date) : null],
              ]}
            />
          </div>
          <div className="split__main stack" style={{ "--stack": "2.5rem" } as React.CSSProperties}>
            {i.isDemo && <DemoNote />}
            <div data-reveal>
              <MediaFrame src={i.coverUrl} alt={i.coverAlt ?? i.name} ratio="16 / 10" label={type} priority />
            </div>
            <div className="stack" data-reveal>
              <h2 className="h4">Objet de la visite</h2>
              <p className="lead">{i.purpose}</p>
            </div>
            {i.workPerformed && (
              <div className="stack" data-reveal>
                <h2 className="h4">Travail réalisé</h2>
                <p className="lead" style={{ whiteSpace: "pre-line" }}>{i.workPerformed}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      {gallery.length > 0 && (
        <section className="section section--surface" aria-label="Photographies">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "2rem" }}>Photographies</p>
            <Gallery images={gallery} label={i.name} />
          </div>
        </section>
      )}
      {i.projects.length > 0 && (
        <section className="section">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "2.5rem" }}>Projets associés</p>
            <div className="cards">
              {i.projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
