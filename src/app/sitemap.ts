import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { slugs } from "@/lib/queries";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE_URL}${p === "/" ? "/" : `${p}/`}`;
  const now = new Date();
  const page = (p: string, priority = 0.8) => ({ url: u(p), lastModified: now, priority });
  const statics = ["/", "/a-propos", "/services", "/realisations", "/interventions", "/activites", "/equipe", "/formations", "/actualites", "/contact"].map((p) => page(p, p === "/" ? 1 : 0.8));
  const map = (base: string, rows: { slug: string }[], priority = 0.6) => rows.map((r) => page(`${base}/${r.slug}`, priority));
  return [
    ...statics,
    ...map("/services", slugs.services(), 0.7),
    ...map("/realisations", slugs.projects(), 0.7),
    ...map("/interventions", slugs.interventions()),
    ...map("/activites", slugs.events()),
    ...map("/equipe", slugs.team(), 0.5),
    ...map("/actualites", slugs.articles()),
    page("/mentions-legales", 0.1),
    page("/confidentialite", 0.1),
  ];
}
