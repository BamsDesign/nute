import { notFound } from "next/navigation";
import { getEvent, staticParams } from "@/lib/queries";
import { splitPhotos } from "@/lib/gallery";
import { absoluteUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { EVENT_ROLES, EVENT_TYPES, labelOf } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { DemoNote, Facts, JsonLd, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { Markdown } from "@/components/site/Markdown";
import { Gallery } from "@/components/site/Gallery";
import { Video } from "@/components/site/Video";
import { CtaBand } from "@/components/site/CtaBand";

export const dynamicParams = false;
export const generateStaticParams = async () => staticParams.events();

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEvent((await params).slug);
  if (!e) return {};
  return pageMetadata({ path: `/activites/${e.slug}`, title: e.seoTitle || e.title, description: e.seoDescription || e.summary, image: e.coverUrl, noindex: e.isDemo });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEvent((await params).slug);
  if (!e) notFound();
  const { gallery } = splitPhotos(e.photos);
  const type = labelOf(EVENT_TYPES, e.type);
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Activités", path: "/activites" },
          { name: e.title, path: `/activites/${e.slug}` },
        ]}
        eyebrow={`${type} · ${formatDate(e.date)}`}
        title={e.title}
        intro={e.summary}
      />
      <section className="section">
        <div className="container split">
          <div className="split__side split__side--sticky stack" style={{ "--stack": "1.5rem" } as React.CSSProperties}>
            <Facts
              items={[
                ["Type", type],
                ["Date", e.endDate ? `${formatDate(e.date)} — ${formatDate(e.endDate)}` : formatDate(e.date)],
                ["Lieu", e.location],
                ["Rôle de NUTE", labelOf(EVENT_ROLES, e.role)],
                ["Participants", e.participantsCount ? String(e.participantsCount) : null],
                ["Attestation", e.certificate ? "Attestation remise aux participants" : null],
              ]}
            />
            {e.topics.length > 0 && (
              <div>
                <p className="mono muted" style={{ marginBottom: "0.75rem", textTransform: "uppercase" }}>
                  Thèmes abordés
                </p>
                <ul className="tags">
                  {e.topics.map((t) => (
                    <li key={t} className="badge">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="split__main stack" style={{ "--stack": "2.5rem" } as React.CSSProperties}>
            {e.isDemo && <DemoNote />}
            <div data-reveal>
              <MediaFrame src={e.coverUrl} alt={e.coverAlt ?? e.title} ratio="16 / 10" label={type} priority />
            </div>
            <div data-reveal>{e.description ? <Markdown>{e.description}</Markdown> : <p className="lead">{e.summary}</p>}</div>
            {e.videoUrl && <Video url={e.videoUrl} title={`Vidéo — ${e.title}`} />}
          </div>
        </div>
      </section>
      {gallery.length > 0 && (
        <section className="section section--surface" aria-label="Galerie">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "2rem" }}>Galerie</p>
            <Gallery images={gallery} label={e.title} />
          </div>
        </section>
      )}
      {!e.isDemo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            description: e.summary,
            startDate: e.date.toISOString(),
            ...(e.endDate ? { endDate: e.endDate.toISOString() } : {}),
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            ...(e.location ? { location: { "@type": "Place", name: e.location, address: { "@type": "PostalAddress", addressCountry: "HT", addressLocality: e.location } } } : {}),
            ...(e.coverUrl ? { image: absoluteUrl(e.coverUrl) } : {}),
            url: absoluteUrl(`/activites/${e.slug}`),
            ...(["ORGANIZER", "CO_ORGANIZER"].includes(e.role) ? { organizer: { "@id": `${SITE_URL}/#organization` } } : {}),
          }}
        />
      )}
      <CtaBand />
    </>
  );
}
