import Link from "next/link";
import { getArticles } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { ARTICLE_CATEGORIES, labelOf } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/i18n";
import { DemoBadge, EmptyState, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { ArticleCard } from "@/components/site/cards";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata({ path: "/actualites", title: "Actualités — annonces, projets, conseils techniques", description: "Annonces, nouveaux services, projets réalisés, événements, formations et conseils techniques publiés par NUTE." });
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const [all, t] = await Promise.all([getArticles(), getDictionary()]);
  const active = ARTICLE_CATEGORIES.some((c) => c.value === categorie) ? categorie : undefined;
  const list = active ? all.filter((a) => a.category === active) : all;
  const featured = !active ? (list.find((a) => a.featured) ?? list[0]) : undefined;
  const rest = list.filter((a) => a.id !== featured?.id);
  const present = ARTICLE_CATEGORIES.filter((c) => all.some((a) => a.category === c.value));

  return (
    <>
      <PageHero crumbs={[{ name: "Actualités", path: "/actualites" }]} eyebrow="Actualités" title="Nouvelles de NUTE." intro="Annonces, nouveaux services, projets réalisés, événements, formations et conseils techniques." />
      <section className="section">
        <div className="container">
          {present.length > 1 && (
            <nav className="filters" aria-label="Catégories d'articles">
              <Link href="/actualites" className="filter" aria-current={!active ? "true" : undefined} scroll={false}>
                Tout
              </Link>
              {present.map((c) => (
                <Link key={c.value} href={`/actualites?categorie=${c.value}`} className="filter" aria-current={active === c.value ? "true" : undefined} scroll={false}>
                  {c.label}
                </Link>
              ))}
            </nav>
          )}
          {featured && (
            <Link href={`/actualites/${featured.slug}`} className="grid-12 card" style={{ marginBottom: "clamp(3rem, 2rem + 3vw, 5rem)", alignItems: "end" }} data-reveal>
              <div style={{ gridColumn: "1 / span 7" }} className="project-lead">
                <MediaFrame src={featured.coverUrl} alt={featured.coverAlt ?? featured.title} ratio="16 / 10" priority corner={featured.isDemo ? <DemoBadge /> : undefined} label={labelOf(ARTICLE_CATEGORIES, featured.category)} />
              </div>
              <div style={{ gridColumn: "9 / span 4" }} className="stack project-rest">
                <span className="mono muted">
                  {labelOf(ARTICLE_CATEGORIES, featured.category)} · {formatDate(featured.publishedAt)}
                </span>
                <h2 className="h3 card__title" style={{ fontSize: "var(--fs-xl)" }}>{featured.title}</h2>
                <p className="muted">{featured.excerpt}</p>
              </div>
            </Link>
          )}
          {rest.length > 0 && (
            <div className="cards">
              {rest.map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
            </div>
          )}
          {list.length === 0 && <EmptyState text={t("empty.news")} />}
        </div>
      </section>
    </>
  );
}
