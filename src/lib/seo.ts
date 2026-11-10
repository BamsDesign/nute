import "server-only";
import type { Metadata } from "next";
import { db } from "./db";
import { getCompany } from "./settings";

import { SITE_URL, absoluteUrl } from "./site-url";
export { SITE_URL, absoluteUrl };

type PageMetaInput = {
  path: string;
  title: string;
  description: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  noindex?: boolean;
};

/** Métadonnées d'une page, surchargées par l'entrée SEO éditée dans l'administration. */
export async function pageMetadata(input: PageMetaInput): Promise<Metadata> {
  const [override, company] = await Promise.all([
    db.seoMeta.findUnique({ where: { path: input.path } }).catch(() => null),
    getCompany(),
  ]);
  const title = override?.title || input.title;
  const description = override?.description || input.description;
  const image = override?.ogImage || input.image || "/opengraph-image";
  const url = absoluteUrl(input.path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: override?.noindex || input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      url,
      title,
      description,
      siteName: company.name,
      locale: "fr_HT",
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(image)] },
  };
}

export async function organizationJsonLd() {
  const c = await getCompany();
  const sameAs = Object.values(c.socials).filter(Boolean);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: c.name,
    legalName: c.legalName,
    alternateName: c.legalName,
    slogan: c.slogan,
    description: c.description,
    url: SITE_URL,
    email: c.email,
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.logoUrl ? { logo: absoluteUrl(c.logoUrl) } : {}),
    ...(c.foundedYear ? { foundingDate: String(c.foundedYear) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: { "@type": "Country", name: "Haïti" },
    knowsAbout: [
      "Maintenance informatique",
      "Réseaux informatiques",
      "Installation Starlink",
      "Vidéosurveillance",
      "Développement logiciel",
      "Création de sites web",
      "Multimédia",
      "Formation informatique",
    ],
  };
  // LocalBusiness uniquement lorsque l'adresse physique est confirmée.
  if (c.address && c.city) {
    base["@type"] = ["Organization", "LocalBusiness"];
    base.address = {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressLocality: c.city,
      ...(c.department ? { addressRegion: c.department } : {}),
      addressCountry: "HT",
    };
    if (c.hours) base.openingHours = c.hours;
  }
  return base;
}

export function websiteJsonLd(name: string) {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name, inLanguage: "fr", publisher: { "@id": `${SITE_URL}/#organization` } };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}
