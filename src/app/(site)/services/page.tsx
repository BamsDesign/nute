import Link from "next/link";
import { getServiceCatalogue } from "@/lib/queries";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { Arrow, JsonLd, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata({
    path: "/services",
    title: "Nos services — informatique, réseaux, Starlink, développement, multimédia, formation",
    description:
      "Maintenance et réparation informatique, réseaux, installation Starlink, caméras de surveillance, développement de logiciels et sites web, vente d'équipements, multimédia et formation en Haïti.",
  });
}

export default async function ServicesPage() {
  const catalogue = await getServiceCatalogue();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }]}
        eyebrow="Nos services"
        title="Des solutions technologiques, de l'atelier au terrain."
        intro="Six domaines d'expertise complémentaires pour répondre aux besoins des particuliers, des entreprises et des institutions."
        aside={
          <nav aria-label="Catégories de services">
            <ol className="stack" style={{ "--stack": "0.4rem", listStyle: "none" } as React.CSSProperties}>
              {catalogue.map((c, i) => (
                <li key={c.id}>
                  <a href={`#${c.slug}`} className="text-link" style={{ fontSize: "var(--fs-sm)" }}>
                    <span className="mono muted">{String(i + 1).padStart(2, "0")}</span> {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        }
      />

      <section className="section">
        <div className="container">
          {catalogue.map((cat, i) => (
            <article key={cat.id} id={cat.slug} className="service-cat" aria-labelledby={`${cat.slug}-title`}>
              <div className="service-cat__head">
                <span className="mono muted" data-reveal>
                  {String(i + 1).padStart(2, "0")} / {String(catalogue.length).padStart(2, "0")}
                </span>
                <h2 id={`${cat.slug}-title`} className="h3" data-reveal>
                  {cat.title}
                </h2>
                <p className="muted" data-reveal>
                  {cat.summary}
                </p>
                <div data-reveal>
                  <MediaFrame src={cat.coverUrl} alt={cat.coverAlt ?? cat.title} ratio="4 / 3" label={cat.title} />
                </div>
              </div>
              <ul className="service-cat__body index-list">
                {cat.services.map((s) => (
                  <li key={s.id} data-reveal>
                    <Link href={`/services/${s.slug}`} className="index-row" style={{ gridTemplateColumns: "minmax(0, 4fr) minmax(0, 5fr) auto" }}>
                      <span className="index-row__title" style={{ fontSize: "1.15rem" }}>
                        {s.title}
                      </span>
                      <span className="index-row__text">{s.summary}</span>
                      <span className="index-row__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <div style={{ marginTop: "3rem" }}>
            <Link href="/contact" className="btn">
              Demander un devis <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Services de NUTE",
          itemListElement: catalogue.flatMap((c) => c.services).map((s, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/services/${s.slug}`), name: s.title })),
        }}
      />
      <CtaBand />
    </>
  );
}
