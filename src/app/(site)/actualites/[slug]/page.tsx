import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/queries";
import { absoluteUrl, pageMetadata, SITE_URL } from "@/lib/seo";
import { getCompany } from "@/lib/settings";
import { ARTICLE_CATEGORIES, labelOf } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { Arrow, DemoNote, JsonLd, PageHero } from "@/components/site/ui";
import { MediaFrame } from "@/components/site/MediaFrame";
import { Markdown } from "@/components/site/Markdown";
import { ArticleCard } from "@/components/site/cards";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return pageMetadata({ path: `/actualites/${a.slug}`, title: a.seoTitle || a.title, description: a.seoDescription || a.excerpt, image: a.coverUrl, type: "article", publishedTime: a.publishedAt?.toISOString(), noindex: a.isDemo });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  const [c, others] = await Promise.all([getCompany(), getArticles({ take: 4 })]);
  const more = others.filter((o) => o.id !== a.id).slice(0, 3);
  const url = absoluteUrl(`/actualites/${a.slug}`);
  const enc = encodeURIComponent;
  const shares = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { name: "X", href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(a.title)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${a.title} ${url}`)}` },
  ];
  const cat = labelOf(ARTICLE_CATEGORIES, a.category);

  return (
    <article>
      <PageHero
        crumbs={[
          { name: "Actualités", path: "/actualites" },
          { name: a.title, path: `/actualites/${a.slug}` },
        ]}
        eyebrow={cat}
        title={a.title}
        intro={a.excerpt}
      />
      <section className="section section--tight">
        <div className="container stack" style={{ "--stack": "1.5rem" } as React.CSSProperties}>
          {a.isDemo && <DemoNote />}
          <MediaFrame src={a.coverUrl} alt={a.coverAlt ?? a.title} ratio="21 / 9" label={cat} priority sizes="100vw" />
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container split">
          <div className="split__side split__side--sticky stack" style={{ "--stack": "1.5rem" } as React.CSSProperties}>
            <dl className="facts">
              <div>
                <dt>Publié le</dt>
                <dd>{a.publishedAt && <time dateTime={a.publishedAt.toISOString()}>{formatDate(a.publishedAt)}</time>}</dd>
              </div>
              <div>
                <dt>Auteur</dt>
                <dd>{a.authorName}</dd>
              </div>
              <div>
                <dt>Catégorie</dt>
                <dd>
                  <Link className="text-link" href={`/actualites?categorie=${a.category}`}>{cat}</Link>
                </dd>
              </div>
            </dl>
            <div>
              <p className="mono muted" style={{ textTransform: "uppercase", marginBottom: "0.75rem" }}>Partager</p>
              <ul className="tags">
                {shares.map((s) => (
                  <li key={s.name}>
                    <a className="badge" href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="split__main">
            <Markdown>{a.content}</Markdown>
          </div>
        </div>
      </section>
      {more.length > 0 && (
        <section className="section section--surface">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
              <p className="eyebrow">À lire aussi</p>
              <Link href="/actualites" className="link-arrow">
                Toutes les actualités <Arrow />
              </Link>
            </div>
            <div className="cards">
              {more.map((o) => (
                <ArticleCard key={o.id} a={o} />
              ))}
            </div>
          </div>
        </section>
      )}
      {!a.isDemo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: a.title,
            description: a.excerpt,
            datePublished: a.publishedAt?.toISOString(),
            dateModified: a.updatedAt.toISOString(),
            author: { "@type": "Person", name: a.authorName },
            publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: c.name, ...(c.logoUrl ? { logo: { "@type": "ImageObject", url: absoluteUrl(c.logoUrl) } } : {}) },
            mainEntityOfPage: url,
            ...(a.coverUrl ? { image: [absoluteUrl(a.coverUrl)] } : {}),
            articleSection: cat,
            inLanguage: "fr",
          }}
        />
      )}
    </article>
  );
}
