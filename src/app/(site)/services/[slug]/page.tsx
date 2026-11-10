import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getProjects, getService } from "@/lib/queries";
import { absoluteUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { getCompany, whatsappLink } from "@/lib/settings";
import { Arrow, Facts, JsonLd, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    return (await db.service.findMany({ where: { published: true }, select: { slug: true } })).map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = await getService((await params).slug);
  if (!s) return {};
  return pageMetadata({ path: `/services/${s.slug}`, title: s.seoTitle || `${s.title} en Haïti`, description: s.seoDescription || s.summary, image: s.coverUrl });
}

// Rapprochement service → catégorie de réalisations pour afficher des projets pertinents.
const PROJECT_CAT_BY_SERVICE_CAT: Record<string, string[]> = {
  "informatique-et-maintenance": ["maintenance"],
  "installation-et-infrastructure": ["installation", "reseaux", "cameras", "starlink"],
  "developpement-et-solutions-numeriques": ["logiciel", "web-apps"],
  multimedia: ["multimedia"],
};

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await getService((await params).slug);
  if (!s) notFound();
  const [c, allProjects] = await Promise.all([getCompany(), getProjects()]);
  const cats = PROJECT_CAT_BY_SERVICE_CAT[s.category.slug] ?? [];
  const related = allProjects.filter((p) => cats.includes(p.category)).slice(0, 3);
  const wa = whatsappLink(c.whatsapp, `Bonjour NUTE, je souhaite des informations sur : ${s.title}.`);
  const siblings = s.category.services.filter((x) => x.id !== s.id);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Services", path: "/services" },
          { name: s.category.title, path: `/services#${s.category.slug}` },
          { name: s.title, path: `/services/${s.slug}` },
        ]}
        eyebrow={s.category.title}
        title={s.title}
        intro={s.summary}
      />

      <section className="section">
        <div className="container split">
          <div className="split__side split__side--sticky stack" style={{ "--stack": "1.5rem" } as React.CSSProperties}>
            <Facts
              items={[
                ["Domaine", s.category.title],
                ["Pour qui", s.audience],
              ]}
            />
            <div className="stack" style={{ "--stack": "0.75rem" } as React.CSSProperties}>
              <Link href={`/contact?service=${encodeURIComponent(s.slug)}`} className="btn">
                Demander un devis <Arrow />
              </Link>
              {wa && (
                <a href={wa} className="btn btn--outline" target="_blank" rel="noopener noreferrer">
                  Écrire sur WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="split__main stack" style={{ "--stack": "3rem" } as React.CSSProperties}>
            <div data-reveal>
              <MediaFrame src={s.coverUrl} alt={s.coverAlt ?? s.title} ratio="16 / 10" label={s.title} priority />
            </div>
            <div className="stack" data-reveal>
              <h2 className="h4">Le service</h2>
              <p className="lead" style={{ whiteSpace: "pre-line" }}>
                {s.description}
              </p>
            </div>
            {s.problem && (
              <div className="stack" data-reveal>
                <h2 className="h4">Le problème que nous résolvons</h2>
                <p className="lead">{s.problem}</p>
              </div>
            )}
            {s.audience && (
              <div className="stack" data-reveal>
                <h2 className="h4">À qui s&apos;adresse ce service</h2>
                <p className="lead">{s.audience}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--surface">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "2.5rem" }}>
              Réalisations associées
            </p>
            <div className="cards">
              {related.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="section">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "2rem" }}>
              Dans le même domaine — {s.category.title}
            </p>
            <ul className="index-list">
              {siblings.map((x) => (
                <li key={x.id}>
                  <Link href={`/services/${x.slug}`} className="index-row" style={{ gridTemplateColumns: "minmax(0, 4fr) minmax(0, 5fr) auto" }}>
                    <span className="index-row__title" style={{ fontSize: "1.1rem" }}>
                      {x.title}
                    </span>
                    <span className="index-row__text">{x.summary}</span>
                    <span className="index-row__arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.description,
          serviceType: s.category.title,
          url: absoluteUrl(`/services/${s.slug}`),
          areaServed: { "@type": "Country", name: "Haïti" },
          provider: { "@id": `${SITE_URL}/#organization` },
          ...(s.audience ? { audience: { "@type": "Audience", audienceType: s.audience } } : {}),
        }}
      />
      <CtaBand title={`Besoin de ce service ?`} text={`Décrivez votre besoin en ${s.title.toLowerCase()} : nous revenons vers vous avec une proposition adaptée.`} />
    </>
  );
}
