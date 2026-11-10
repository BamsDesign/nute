import Link from "next/link";
import { getProjects } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { PROJECT_CATEGORIES } from "@/lib/taxonomy";
import { getDictionary } from "@/i18n";
import { EmptyState, PageHero } from "@/components/site/ui";
import { ProjectCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const cat = PROJECT_CATEGORIES.find((c) => c.value === categorie);
  return pageMetadata({
    path: "/realisations",
    title: cat ? `Réalisations — ${cat.label}` : "Nos réalisations — projets et interventions documentés",
    description: "Portfolio des projets réalisés par NUTE : maintenance, réseaux, Starlink, vidéosurveillance, développement logiciel, sites web et multimédia.",
  });
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const [all, t] = await Promise.all([getProjects(), getDictionary()]);
  const active = PROJECT_CATEGORIES.some((c) => c.value === categorie) ? categorie : undefined;
  const list = active ? all.filter((p) => p.category === active) : all;
  const counts = new Map<string, number>();
  all.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));

  return (
    <>
      <PageHero
        crumbs={[{ name: "Réalisations", path: "/realisations" }]}
        eyebrow="Portfolio"
        title="Nos réalisations."
        intro="Chaque projet est présenté avec le besoin initial, la solution apportée, les équipements et technologies utilisés et les résultats obtenus."
      />
      <section className="section">
        <div className="container">
          <h2 className="sr-only">Liste des réalisations</h2>
          <nav className="filters" aria-label="Filtrer par catégorie">
            <Link href="/realisations" className="filter" aria-current={!active ? "true" : undefined} scroll={false}>
              Toutes <span className="count">{all.length}</span>
            </Link>
            {PROJECT_CATEGORIES.map((c) => (
              <Link key={c.value} href={`/realisations?categorie=${c.value}`} className="filter" aria-current={active === c.value ? "true" : undefined} scroll={false}>
                {c.label} <span className="count">{counts.get(c.value) ?? 0}</span>
              </Link>
            ))}
          </nav>
          {list.length ? (
            <div className="cards">
              {list.map((p, i) => (
                <ProjectCard key={p.id} p={p} priority={i < 3} />
              ))}
            </div>
          ) : (
            <EmptyState text={active ? "Aucune réalisation n'est encore publiée dans cette catégorie." : t("empty.projects")} />
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
