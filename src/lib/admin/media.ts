import "server-only";
import { db } from "@/lib/db";

/** Recherche les contenus qui utilisent une URL de média (images principales, logos…). */
export async function mediaUsage(url: string) {
  const where = (fields: string[]) => ({ OR: fields.map((f) => ({ [f]: url })) });
  const [p, i, e, t, a, sc, sv, pa, seo, settings] = await Promise.all([
    db.project.count({ where: where(["coverUrl", "videoUrl"]) }),
    db.intervention.count({ where: where(["coverUrl"]) }),
    db.event.count({ where: where(["coverUrl", "videoUrl"]) }),
    db.teamMember.count({ where: where(["photoUrl"]) }),
    db.article.count({ where: { OR: [{ coverUrl: url }, { content: { contains: url } }] } }),
    db.serviceCategory.count({ where: where(["coverUrl"]) }),
    db.service.count({ where: where(["coverUrl"]) }),
    db.partner.count({ where: where(["logoUrl"]) }),
    db.seoMeta.count({ where: where(["ogImage"]) }),
    db.setting.findMany(),
  ]);
  const inSettings = settings.filter((st) => JSON.stringify(st.value).includes(url)).length;
  return p + i + e + t + a + sc + sv + pa + seo + inSettings;
}

