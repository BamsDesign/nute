import "server-only";
import { db } from "@/lib/db";
import type { Resource } from "./resources";

/** Options des champs relationnels et contenu de la galerie, pour le formulaire. */
export async function loadFormContext(res: Resource, id: string | null) {
  const relationOptions: Record<string, { value: string; label: string }[]> = {};
  for (const f of res.fields) {
    if (f.type !== "relation") continue;
    if (f.relation === "serviceCategory") relationOptions[f.name] = (await db.serviceCategory.findMany({ orderBy: { order: "asc" } })).map((c) => ({ value: c.id, label: c.title }));
    if (f.relation === "intervention") relationOptions[f.name] = (await db.intervention.findMany({ orderBy: { name: "asc" } })).map((i) => ({ value: i.id, label: `${i.name}${i.city ? ` — ${i.city}` : ""}` }));
  }
  const gallery =
    res.galleryOwner && id
      ? (await db.galleryItem.findMany({ where: { ownerType: res.galleryOwner, ownerId: id }, orderBy: { order: "asc" }, include: { media: true } })).map((g) => ({
          mediaId: g.mediaId,
          kind: g.kind,
          caption: g.caption ?? "",
          url: g.media.url,
          thumbUrl: g.media.thumbUrl,
          alt: g.media.alt,
          mimeType: g.media.mimeType,
        }))
      : [];
  // Les champs de configuration sont transmis au client sans fonctions.
  const fields = JSON.parse(JSON.stringify(res.fields));
  return { relationOptions, gallery, fields };
}
