import { getProjects } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";
import { PageHero } from "@/components/site/ui";
import { ProjectsBrowser } from "@/components/site/browsers";
import { CtaBand } from "@/components/site/CtaBand";

export async function generateMetadata() {
  return pageMetadata({
    path: "/realisations",
    title: "Nos réalisations — projets et interventions documentés",
    description: "Portfolio des projets réalisés par NUTE : maintenance, réseaux, Starlink, vidéosurveillance, développement logiciel, sites web et multimédia.",
  });
}

export default async function ProjectsPage() {
  const [projects, t] = await Promise.all([getProjects(), getDictionary()]);
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
          <ProjectsBrowser projects={projects} emptyText={t("empty.projects")} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
