import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamMember } from "@/lib/queries";
import { absoluteUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { Arrow, DemoNote, JsonLd, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { Markdown } from "@/components/site/Markdown";

export const revalidate = 300;

type Edu = { institution?: string; degree?: string; field?: string; year?: string };
type Exp = { organization?: string; role?: string; period?: string; description?: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const m = await getTeamMember((await params).slug);
  if (!m) return {};
  return pageMetadata({ path: `/equipe/${m.slug}`, title: `${m.name} — ${m.position}`, description: m.shortBio || `${m.name}, ${m.position} chez NUTE.`, image: m.photoUrl, type: "profile", noindex: m.isDemo });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="stack" style={{ "--stack": "1.25rem", borderTop: "1px solid var(--ink)", paddingTop: "1.25rem" } as React.CSSProperties} data-reveal>
      <h2 className="eyebrow eyebrow--plain">{title}</h2>
      {children}
    </section>
  );
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = await getTeamMember((await params).slug);
  if (!m) notFound();
  const education = (Array.isArray(m.education) ? m.education : []) as Edu[];
  const experience = (Array.isArray(m.experience) ? m.experience : []) as Exp[];

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Équipe", path: "/equipe" },
          { name: m.name, path: `/equipe/${m.slug}` },
        ]}
        eyebrow={[m.position, m.department].filter(Boolean).join(" · ")}
        title={m.name}
        intro={m.shortBio}
      />
      <section className="section">
        <div className="container split">
          <div className="split__side split__side--sticky stack" style={{ "--stack": "1.25rem" } as React.CSSProperties}>
            <MediaFrame src={m.photoUrl} alt={m.photoAlt ?? `Portrait de ${m.name}`} ratio="4 / 5" label="Portrait" priority sizes="(max-width: 900px) 100vw, 33vw" />
            {(m.linkedinUrl || m.portfolioUrl) && (
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {m.linkedinUrl && (
                  <a href={m.linkedinUrl} className="link-arrow" target="_blank" rel="noopener noreferrer">
                    LinkedIn <Arrow dir="up-right" />
                  </a>
                )}
                {m.portfolioUrl && (
                  <a href={m.portfolioUrl} className="link-arrow" target="_blank" rel="noopener noreferrer">
                    Portfolio <Arrow dir="up-right" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="split__main stack" style={{ "--stack": "3rem" } as React.CSSProperties}>
            {m.isDemo && <DemoNote />}
            {m.biography && (
              <Section title="Biographie professionnelle">
                <Markdown>{m.biography}</Markdown>
              </Section>
            )}
            {m.responsibilities.length > 0 && (
              <Section title="Responsabilités chez NUTE">
                <ul className="prose">
                  {m.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </Section>
            )}
            {education.length > 0 && (
              <Section title="Formation académique">
                <dl className="facts" style={{ borderTop: 0 }}>
                  {education.map((e, i) => (
                    <div key={i}>
                      <dt>{e.year || "—"}</dt>
                      <dd>
                        <strong>{[e.degree, e.field].filter(Boolean).join(" — ")}</strong>
                        {e.institution && <span className="muted" style={{ display: "block" }}>{e.institution}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}
            {experience.length > 0 && (
              <Section title="Expérience professionnelle">
                <dl className="facts" style={{ borderTop: 0 }}>
                  {experience.map((e, i) => (
                    <div key={i}>
                      <dt>{e.period || "—"}</dt>
                      <dd>
                        <strong>{e.role}</strong>
                        {e.organization && <span className="muted"> · {e.organization}</span>}
                        {e.description && <p className="muted" style={{ marginTop: "0.35rem" }}>{e.description}</p>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}
            {m.skills.length > 0 && (
              <Section title="Compétences techniques">
                <ul className="tags">
                  {m.skills.map((s) => (
                    <li key={s} className="badge">{s}</li>
                  ))}
                </ul>
              </Section>
            )}
            {m.certifications.length > 0 && (
              <Section title="Certifications">
                <ul className="prose">
                  {m.certifications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Section>
            )}
            <div>
              <Link href="/equipe" className="link-arrow">
                <Arrow dir="left" /> Toute l&apos;équipe
              </Link>
            </div>
          </div>
        </div>
      </section>
      {!m.isDemo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: m.name,
            jobTitle: m.position,
            url: absoluteUrl(`/equipe/${m.slug}`),
            worksFor: { "@id": `${SITE_URL}/#organization` },
            ...(m.photoUrl ? { image: absoluteUrl(m.photoUrl) } : {}),
            ...(m.skills.length ? { knowsAbout: m.skills } : {}),
            ...(education.length ? { alumniOf: education.filter((e) => e.institution).map((e) => ({ "@type": "EducationalOrganization", name: e.institution })) } : {}),
            ...([m.linkedinUrl, m.portfolioUrl].filter(Boolean).length ? { sameAs: [m.linkedinUrl, m.portfolioUrl].filter(Boolean) } : {}),
          }}
        />
      )}
    </>
  );
}
