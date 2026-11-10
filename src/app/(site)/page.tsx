import Link from "next/link";
import type { Metadata } from "next";
import { getAbout, getCompany, getHome } from "@/lib/settings";
import { getEvents, getPartners, getProjects, getServiceCatalogue, getTeam, getTestimonials } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";
import { Arrow, EmptyState, SectionHead } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { EventCard, ProjectCard, TeamCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompany();
  return pageMetadata({
    path: "/",
    title: "NUTE — Services technologiques, informatiques et multimédias en Haïti",
    description: c.description,
  });
}

/** Découpe un titre en ~3 lignes équilibrées pour l'animation ligne par ligne. */
function toLines(title: string, parts = 3): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return [title];
  const target = Math.ceil(title.length / parts);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > target && lines.length < parts - 1) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

export default async function HomePage() {
  const [home, company, about, t, catalogue, featured, events, team, testimonials, partners] = await Promise.all([
    getHome(),
    getCompany(),
    getAbout(),
    getDictionary(),
    getServiceCatalogue(),
    getProjects({ take: 4 }),
    getEvents({ take: 3 }),
    getTeam(4),
    getTestimonials(),
    getPartners(),
  ]);
  const figures = home.figures.filter((f) => f.verified && f.value && f.label);
  const [lead, ...rest] = featured;

  return (
    <>
      {/* ─── Héros ─────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero__grid">
            <p className="eyebrow" style={{ gridColumn: "1 / -1", marginBottom: "2rem" }} data-reveal>
              {home.heroEyebrow}
            </p>
            <h1 id="hero-title" className="hero__title display-1" data-lines>
              {toLines(home.heroTitle).map((l, i) => (
                <span className="line" key={i}>
                  <span>{l}</span>
                </span>
              ))}
            </h1>
            <div className="hero__meta" data-reveal>
              <p className="lead">{home.heroText}</p>
              <div className="hero__actions">
                <Link href="/services" className="btn">
                  {t("cta.discoverServices")} <Arrow />
                </Link>
                <Link href="/contact" className="btn btn--outline">
                  {t("cta.contactUs")}
                </Link>
              </div>
            </div>
            <div className="hero__slogan" data-reveal>
              <span className="mono muted">Notre signature</span>
              <p>{company.slogan}</p>
            </div>
          </div>

          {home.heroImageUrl && (
            <div className="hero__visual" data-reveal>
              <MediaFrame src={home.heroImageUrl} alt={home.heroImageAlt ?? ""} ratio="21 / 9" priority sizes="100vw" />
            </div>
          )}

          <nav className="domain-strip" aria-label="Domaines d'expertise" style={{ marginTop: home.heroImageUrl ? "0" : "clamp(3.5rem, 2rem + 5vw, 6.5rem)" }}>
            {catalogue.map((cat, i) => (
              <Link key={cat.id} href={`/services#${cat.slug}`} data-reveal>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <strong>{cat.title}</strong>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* ─── Présentation de l'expertise ───────────────────────── */}
      <section className="section" aria-labelledby="expertise-title">
        <div className="container">
          <div className="split">
            <div className="split__side">
              <p className="eyebrow" data-reveal>
                01 — Qui nous sommes
              </p>
            </div>
            <div className="split__main stack" style={{ "--stack": "2rem" } as React.CSSProperties}>
              <h2 id="expertise-title" className="h2" data-reveal>
                {about.intro}
              </h2>
              <p className="lead" data-reveal>
                {home.expertiseIntro}
              </p>
              <div data-reveal>
                <Link href="/a-propos" className="link-arrow">
                  Découvrir NUTE <Arrow />
                </Link>
              </div>
            </div>
          </div>

          {figures.length > 0 && (
            <div className="figures" style={{ marginTop: "clamp(3rem, 2rem + 3vw, 5rem)" }}>
              {figures.map((f) => (
                <div className="figure" key={f.label} data-reveal>
                  <strong>{f.value}</strong>
                  <span className="muted">{f.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Activités / services ──────────────────────────────── */}
      <section className="section section--surface" aria-labelledby="services-title">
        <div className="container">
          <SectionHead
            index="02"
            label="Nos activités"
            title={<span id="services-title">Six domaines d&apos;expertise, une même exigence.</span>}
            aside="Chaque domaine regroupe des services précis, présentés avec leur objectif, leur public et la manière dont nous les réalisons."
            action={
              <Link href="/services" className="link-arrow">
                Tous les services <Arrow />
              </Link>
            }
          />
          <ul className="index-list">
            {catalogue.map((cat, i) => (
              <li key={cat.id} data-reveal>
                <Link href={`/services#${cat.slug}`} className="index-row">
                  <span className="index-row__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="index-row__title">{cat.title}</span>
                  <span className="index-row__text">{cat.summary}</span>
                  <span className="index-row__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Réalisations ──────────────────────────────────────── */}
      <section className="section" aria-labelledby="projects-title">
        <div className="container">
          <SectionHead
            index="03"
            label="Réalisations"
            title={<span id="projects-title">Le travail accompli, documenté.</span>}
            aside="Problème initial, solution apportée, équipements utilisés et résultats : chaque réalisation est présentée telle qu'elle a été menée."
            action={
              featured.length > 0 && (
                <Link href="/realisations" className="link-arrow">
                  Toutes les réalisations <Arrow />
                </Link>
              )
            }
          />
          {lead ? (
            <div className="grid-12" style={{ rowGap: "3rem" }}>
              <div style={{ gridColumn: rest.length ? "1 / span 7" : "1 / -1" }} className="project-lead">
                <ProjectCard p={lead} ratio="4 / 3" />
              </div>
              {rest.length > 0 && (
                <div style={{ gridColumn: "9 / span 4", display: "grid", gap: "3rem", alignContent: "start" }} className="project-rest">
                  {rest.slice(0, 2).map((p) => (
                    <ProjectCard key={p.id} p={p} ratio="3 / 2" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState text={t("empty.projects")} />
          )}
        </div>
      </section>

      {/* ─── Activités et événements récents ───────────────────── */}
      <section className="section section--paper2" aria-labelledby="events-title">
        <div className="container">
          <SectionHead
            index="04"
            label="Activités et événements"
            title={<span id="events-title">Sur le terrain, en salle, devant le public.</span>}
            aside="Séminaires, formations, ateliers, démonstrations et visites institutionnelles."
            action={
              <Link href="/activites" className="link-arrow">
                Toutes les activités <Arrow />
              </Link>
            }
          />
          {events.length ? (
            <div className="cards" style={{ "--cols": 3 } as React.CSSProperties}>
              {events.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <EmptyState text={t("empty.events")} />
          )}
        </div>
      </section>

      {/* ─── Équipe ────────────────────────────────────────────── */}
      <section className="section" aria-labelledby="team-title">
        <div className="container">
          <SectionHead
            index="05"
            label="L'équipe"
            title={<span id="team-title">Les personnes derrière NUTE.</span>}
            aside="Leur parcours, leurs compétences et leur rôle dans le développement de l'entreprise."
            action={
              <Link href="/equipe" className="link-arrow">
                Rencontrer l&apos;équipe <Arrow />
              </Link>
            }
          />
          {team.length ? (
            <div className="cards" style={{ "--cols": 4 } as React.CSSProperties}>
              {team.map((m) => (
                <TeamCard key={m.id} m={m} />
              ))}
            </div>
          ) : (
            <EmptyState text={t("empty.team")} />
          )}
        </div>
      </section>

      {/* ─── Pourquoi NUTE ─────────────────────────────────────── */}
      <section className="section section--night" aria-labelledby="why-title">
        <div className="container">
          <SectionHead index="06" label="Notre différence" title={<span id="why-title">{home.whyTitle}</span>} />
          <ol className="cards" style={{ "--cols": 4, listStyle: "none" } as React.CSSProperties}>
            {home.whyItems.map((w, i) => (
              <li key={w.title} className="card" style={{ borderTop: "1px solid var(--night-line)", paddingTop: "1.5rem" }} data-reveal>
                <span className="mono" style={{ color: "var(--night-muted)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="h4">{w.title}</h3>
                <p className="card__text">{w.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Témoignages (uniquement s'ils sont authentiques) ──── */}
      {testimonials.length > 0 && (
        <section className="section" aria-labelledby="testimonials-title">
          <div className="container">
            <SectionHead index="07" label="Témoignages" title={<span id="testimonials-title">Ils nous ont fait confiance.</span>} />
            <div className="cards" style={{ "--cols": Math.min(testimonials.length, 3) } as React.CSSProperties}>
              {testimonials.slice(0, 3).map((tm) => (
                <figure key={tm.id} className="card" style={{ margin: 0, borderTop: "1px solid var(--ink)", paddingTop: "1.5rem" }} data-reveal>
                  <blockquote className="quote" style={{ margin: 0, fontSize: "var(--fs-lg)" }}>
                    « {tm.quote} »
                  </blockquote>
                  <figcaption className="muted">
                    <strong style={{ color: "var(--ink)" }}>{tm.author}</strong>
                    {[tm.role, tm.organization].filter(Boolean).length ? ` — ${[tm.role, tm.organization].filter(Boolean).join(", ")}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Partenaires (uniquement s'ils sont autorisés) ─────── */}
      {partners.length > 0 && (
        <section className="section section--tight" aria-labelledby="partners-title">
          <div className="container">
            <p id="partners-title" className="eyebrow" style={{ marginBottom: "2rem" }}>
              Partenaires et institutions
            </p>
            <ul className="partners" style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "2.5rem 4rem", alignItems: "center" }}>
              {partners.map((p) => {
                const inner = p.logoUrl ? <img src={p.logoUrl} alt={p.name} style={{ height: 44, width: "auto", filter: "grayscale(1)", opacity: 0.8 }} loading="lazy" /> : <span className="h4">{p.name}</span>;
                return (
                  <li key={p.id}>
                    {p.websiteUrl ? (
                      <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
