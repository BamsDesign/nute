import Link from "next/link";
import { getAbout, getCompany } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { Arrow, PageHero, SectionHead } from "@/components/site/ui";
import { CtaBand } from "@/components/site/CtaBand";

export async function generateMetadata() {
  return pageMetadata({
    path: "/a-propos",
    title: "À propos de NUTE — mission, vision et valeurs",
    description: "Découvrez NUTE (NUTESERVICES), entreprise de services technologiques et multimédias en Haïti : mission, vision, valeurs et approche du travail.",
  });
}

function Pending({ children }: { children: React.ReactNode }) {
  return (
    <p className="muted" style={{ fontStyle: "italic" }}>
      {children}
    </p>
  );
}

export default async function AboutPage() {
  const [a, c] = await Promise.all([getAbout(), getCompany()]);
  return (
    <>
      <PageHero crumbs={[{ name: "À propos", path: "/a-propos" }]} eyebrow="Qui sommes-nous" title={<>{c.slogan}</>} intro={a.intro} />

      <section className="section" aria-labelledby="presentation">
        <div className="container split">
          <div className="split__side">
            <p className="eyebrow" data-reveal>
              01 — Présentation
            </p>
          </div>
          <div className="split__main stack" style={{ "--stack": "2rem" } as React.CSSProperties}>
            <h2 id="presentation" className="h3" data-reveal>
              {c.name}, une entreprise de services technologiques et multimédias.
            </h2>
            <p className="lead" data-reveal>
              {a.presentation}
            </p>
          </div>
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="nom">
        <div className="container split">
          <div className="split__side">
            <p className="eyebrow" data-reveal>
              02 — Le nom
            </p>
          </div>
          <div className="split__main stack" style={{ "--stack": "1.5rem" } as React.CSSProperties}>
            <h2 id="nom" className="h3" data-reveal>
              Que signifie NUTE ?
            </h2>
            <div data-reveal>
              {c.acronymMeaning ? <p className="lead">{c.acronymMeaning}</p> : <Pending>La signification officielle du nom NUTE sera publiée prochainement par l&apos;entreprise.</Pending>}
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="histoire">
        <div className="container split">
          <div className="split__side">
            <p className="eyebrow" data-reveal>
              03 — Origine et histoire
            </p>
            {c.foundedYear && (
              <p className="display-2" style={{ marginTop: "1.5rem" }} data-reveal>
                {c.foundedYear}
              </p>
            )}
          </div>
          <div className="split__main stack" style={{ "--stack": "2.5rem" } as React.CSSProperties}>
            <div className="stack" data-reveal>
              <h2 id="histoire" className="h3">
                Notre histoire
              </h2>
              {a.history ? <p className="lead" style={{ whiteSpace: "pre-line" }}>{a.history}</p> : <Pending>Le récit de la fondation et du parcours de NUTE sera publié prochainement.</Pending>}
            </div>
            <div className="stack" data-reveal>
              <h3 className="h4">Pourquoi NUTE a été créé</h3>
              {a.whyCreated ? <p className="lead" style={{ whiteSpace: "pre-line" }}>{a.whyCreated}</p> : <Pending>Les raisons de la création de NUTE seront présentées prochainement.</Pending>}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--night" aria-label="Mission et vision">
        <div className="container grid-12" style={{ rowGap: "4rem" }}>
          <div style={{ gridColumn: "1 / -1" }} className="about-mv">
            <div className="stack" style={{ "--stack": "1.5rem" } as React.CSSProperties} data-reveal>
              <p className="eyebrow">04 — Notre mission</p>
              <p className="quote" style={{ fontSize: "var(--fs-2xl)", lineHeight: 1.1 }}>
                {a.mission}
              </p>
            </div>
            <div className="stack" style={{ "--stack": "1.5rem" } as React.CSSProperties} data-reveal>
              <p className="eyebrow">05 — Notre vision</p>
              <p className="quote" style={{ fontSize: "var(--fs-2xl)", lineHeight: 1.1 }}>
                {a.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="valeurs">
        <div className="container">
          <SectionHead index="06" label="Nos valeurs" title={<span id="valeurs">Ce qui guide chacune de nos interventions.</span>} />
          <ul className="index-list">
            {a.values.map((v, i) => (
              <li key={v.title} data-reveal>
                <div className="index-row">
                  <span className="index-row__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="index-row__title">{v.title}</span>
                  <span className="index-row__text">{v.text}</span>
                  <span />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--paper2" aria-label="Approche et engagement">
        <div className="container grid-12" style={{ rowGap: "3rem" }}>
          <div className="stack about-col" style={{ gridColumn: "1 / span 5" }} data-reveal>
            <p className="eyebrow">07 — Notre approche du travail</p>
            <p className="lead">{a.approach}</p>
          </div>
          <div className="stack about-col" style={{ gridColumn: "7 / span 6" }} data-reveal>
            <p className="eyebrow">08 — Notre engagement envers nos clients</p>
            <p className="lead">{a.commitment}</p>
            <div>
              <Link href="/equipe" className="link-arrow">
                Rencontrer l&apos;équipe <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
