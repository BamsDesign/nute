import { getArticles } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";
import { PageHero } from "@/components/site/ui";
import { ArticlesBrowser } from "@/components/site/browsers";

export async function generateMetadata() {
  return pageMetadata({ path: "/actualites", title: "Actualités — annonces, projets, conseils techniques", description: "Annonces, nouveaux services, projets réalisés, événements, formations et conseils techniques publiés par NUTE." });
}

export default async function NewsPage() {
  const [all, t] = await Promise.all([getArticles(), getDictionary()]);
  return (
    <>
      <PageHero crumbs={[{ name: "Actualités", path: "/actualites" }]} eyebrow="Actualités" title="Nouvelles de NUTE." intro="Annonces, nouveaux services, projets réalisés, événements, formations et conseils techniques." />
      <section className="section">
        <div className="container">
          <ArticlesBrowser articles={all} emptyText={t("empty.news")} />
        </div>
      </section>
    </>
  );
}
