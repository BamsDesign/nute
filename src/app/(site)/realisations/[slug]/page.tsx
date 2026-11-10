import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getProject, getProjects } from "@/lib/queries";
import { loadGallery } from "@/lib/gallery";
import { absoluteUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { PROJECT_CATEGORIES, labelOf } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { Arrow, DemoNote, Facts, JsonLd, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { Gallery } from "@/components/site/Gallery";
import { Video } from "@/components/site/Video";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    return (await db.project.findMany({ where: { published: true }, select: { slug: true } })).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return pageMetadata({ path: `/realisations/${p.slug}`, title: p.seoTitle || p.title, description: p.seoDescription || p.summary, image: p.coverUrl, noindex: p.isDemo });
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="stack" data-reveal>
      <h2 className="h4">{title}</h2>
      {children}
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  const [{ gallery, before, after }, others] = await Promise.all([loadGallery("Project", p.id), getProjects()]);
  const cat = labelOf(PROJECT_CATEGORIES, p.category);
  const more = others.filter((o) => o.id !== p.id && o.category === p.category).slice(0, 3);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Réalisations", path: "/realisations" },
          { name: p.title, path: `/realisations/${p.slug}` },
        ]}
        eyebrow={cat}
        title={p.title}
        intro={p.summary}
      />
      <section className="section section--tight">
        <div className="container stack" style={{ "--stack": "1.5rem" } as React.CSSProperties}>
          {p.isDemo && <DemoNote />}
          <div data-reveal>
            <MediaFrame src={p.coverUrl} alt={p.coverAlt ?? p.title} ratio="21 / 9" label={cat} priority sizes="100vw" />
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container split">
          <div className="split__side split__side--sticky">
            <Facts
              items={[
                ["Catégorie", <Link key="c" className="text-link" href={`/realisations?categorie=${p.category}`}>{cat}</Link>],
                ["Client", p.client && p.clientAuthorized ? p.client : null],
                ["Lieu", p.location],
                ["Date", p.date ? formatDate(p.date) : null],
                ["Intervention", p.intervention?.published ? <Link key="i" className="text-link" href={`/interventions/${p.intervention.slug}`}>{p.intervention.name}</Link> : null],
              ]}
            />
            {p.technologies.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <p className="mono muted" style={{ marginBottom: "0.75rem", textTransform: "uppercase" }}>
                  Équipements et technologies
                </p>
                <ul className="tags">
                  {p.technologies.map((t) => (
                    <li key={t} className="badge">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="split__main stack" style={{ "--stack": "3rem" } as React.CSSProperties}>
            {p.problem && (
              <Block title="Le besoin initial">
                <p className="lead" style={{ whiteSpace: "pre-line" }}>{p.problem}</p>
              </Block>
            )}
            {p.solution && (
              <Block title="La solution apportée par NUTE">
                <p className="lead" style={{ whiteSpace: "pre-line" }}>{p.solution}</p>
              </Block>
            )}
            {p.results && (
              <Block title="Résultats">
                <p className="lead" style={{ whiteSpace: "pre-line" }}>{p.results}</p>
              </Block>
            )}
            {(before.length > 0 || after.length > 0) && (
              <Block title="Avant / après">
                <div className="before-after">
                  <figure style={{ margin: 0 }}>
                    <MediaFrame src={before[0]?.url} thumb={before[0]?.thumbUrl} alt={before[0]?.alt || "Avant l'intervention"} label="Avant" />
                    <figcaption className="mono muted" style={{ marginTop: "0.5rem" }}>Avant</figcaption>
                  </figure>
                  <figure style={{ margin: 0 }}>
                    <MediaFrame src={after[0]?.url} thumb={after[0]?.thumbUrl} alt={after[0]?.alt || "Après l'intervention"} label="Après" />
                    <figcaption className="mono muted" style={{ marginTop: "0.5rem" }}>Après</figcaption>
                  </figure>
                </div>
              </Block>
            )}
            {p.videoUrl && (
              <Block title="Vidéo">
                <Video url={p.videoUrl} title={`Vidéo — ${p.title}`} />
              </Block>
            )}
          </div>
        </div>
      </section>
      {gallery.length > 0 && (
        <section className="section section--surface" aria-label="Galerie photographique">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "2rem" }}>Galerie</p>
            <Gallery images={gallery} label={p.title} />
          </div>
        </section>
      )}
      {more.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
              <p className="eyebrow">Autres réalisations — {cat}</p>
              <Link href="/realisations" className="link-arrow">
                Toutes les réalisations <Arrow />
              </Link>
            </div>
            <div className="cards">
              {more.map((o) => (
                <ProjectCard key={o.id} p={o} />
              ))}
            </div>
          </div>
        </section>
      )}
      {!p.isDemo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: p.title,
            abstract: p.summary,
            url: absoluteUrl(`/realisations/${p.slug}`),
            ...(p.date ? { dateCreated: p.date.toISOString().slice(0, 10) } : {}),
            ...(p.coverUrl ? { image: absoluteUrl(p.coverUrl) } : {}),
            creator: { "@id": `${SITE_URL}/#organization` },
            ...(p.location ? { locationCreated: { "@type": "Place", name: p.location } } : {}),
          }}
        />
      )}
      <CtaBand />
    </>
  );
}
