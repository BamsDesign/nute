import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => `${SITE_URL}${p}`;
  const now = new Date();
  const statics = ["/", "/a-propos", "/services", "/realisations", "/interventions", "/activites", "/equipe", "/formations", "/actualites", "/contact"].map((p) => ({
    url: u(p),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  try {
    const live = { published: true, isDemo: false };
    const [services, projects, interventions, events, team, articles] = await Promise.all([
      db.service.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      db.project.findMany({ where: live, select: { slug: true, updatedAt: true } }),
      db.intervention.findMany({ where: live, select: { slug: true, updatedAt: true } }),
      db.event.findMany({ where: live, select: { slug: true, updatedAt: true } }),
      db.teamMember.findMany({ where: live, select: { slug: true, updatedAt: true } }),
      db.article.findMany({ where: { ...live, publishedAt: { lte: now } }, select: { slug: true, updatedAt: true } }),
    ]);
    const map = (base: string, rows: { slug: string; updatedAt: Date }[], priority = 0.6) => rows.map((r) => ({ url: u(`${base}/${r.slug}`), lastModified: r.updatedAt, priority }));
    return [
      ...statics,
      ...map("/services", services, 0.7),
      ...map("/realisations", projects, 0.7),
      ...map("/interventions", interventions),
      ...map("/activites", events),
      ...map("/equipe", team, 0.5),
      ...map("/actualites", articles),
      { url: u("/mentions-legales"), priority: 0.1 },
      { url: u("/confidentialite"), priority: 0.1 },
    ];
  } catch {
    return statics;
  }
}
