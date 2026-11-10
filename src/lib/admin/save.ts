import "server-only";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import type { Field, Resource } from "./resources";

export type FieldErrors = Record<string, string>;
type Data = Record<string, unknown>;

// Accès dynamique aux délégués Prisma à partir du nom de modèle de la ressource.
type Delegate = {
  findMany: (args?: unknown) => Promise<Data[]>;
  findUnique: (args: unknown) => Promise<Data | null>;
  findFirst: (args: unknown) => Promise<Data | null>;
  count: (args?: unknown) => Promise<number>;
  create: (args: unknown) => Promise<Data>;
  update: (args: unknown) => Promise<Data>;
  delete: (args: unknown) => Promise<Data>;
};
export function delegate(model: Resource["model"]): Delegate {
  return (db as unknown as Record<string, Delegate>)[model];
}

const isSafeUrl = (v: string) => /^https?:\/\/[^\s<>"]+$/i.test(v) || /^\/[\w\-/.#?=&%]*$/.test(v);

export type GalleryInput = { mediaId: string; kind: "GALLERY" | "BEFORE" | "AFTER"; caption: string | null }[];

/** Valide et convertit les valeurs du formulaire selon la configuration des champs. */
export async function parseResourceForm(res: Resource, form: FormData, id: string | null) {
  const data: Data = {};
  const errors: FieldErrors = {};
  let gallery: GalleryInput | null = null;
  const str = (name: string) => String(form.get(name) ?? "").trim();

  for (const f of res.fields) {
    if (f.type === "section") continue;
    const v = f.type === "gallery" ? "" : str(f.name);
    const req = "required" in f && f.required;
    const fail = (msg: string) => (errors[f.name] = msg);

    switch (f.type) {
      case "text":
      case "textarea":
      case "markdown":
      case "url": {
        if (!v) {
          if (req) fail("Champ obligatoire.");
          data[f.name] = req ? "" : null;
          break;
        }
        if (f.max && v.length > f.max) fail(`${f.max} caractères maximum.`);
        if (f.type === "url" && !isSafeUrl(v)) fail("Adresse invalide (https://… ou chemin /…).");
        data[f.name] = v;
        break;
      }
      case "slug": {
        const s = slugify(v || str(f.from));
        if (!s) {
          fail("Adresse impossible à générer : renseignez le titre.");
          break;
        }
        data[f.name] = s;
        break;
      }
      case "number": {
        if (!v) {
          if (req) fail("Champ obligatoire.");
          data[f.name] = null;
          break;
        }
        const n = Number(v.replace(",", "."));
        if (!Number.isFinite(n)) fail("Nombre invalide.");
        else if ((f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) fail(`Valeur attendue entre ${f.min} et ${f.max}.`);
        // Champs entiers du schéma.
        data[f.name] = ["order", "participantsCount"].includes(f.name) ? Math.round(n) : n;
        if (f.name === "order" && !v) data[f.name] = 0;
        break;
      }
      case "date": {
        if (!v) {
          if (req) fail("Champ obligatoire.");
          data[f.name] = null;
          break;
        }
        const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00Z`) : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? new Date(`${v}:00Z`) : null;
        if (!d || isNaN(d.getTime())) fail("Date invalide.");
        else data[f.name] = d;
        break;
      }
      case "boolean":
        data[f.name] = form.get(f.name) === "on";
        break;
      case "select": {
        if (!v) {
          if (req) fail("Sélection obligatoire.");
          data[f.name] = null;
          break;
        }
        if (!f.options.some((o) => o.value === v)) fail("Valeur non autorisée.");
        data[f.name] = v;
        break;
      }
      case "relation": {
        if (!v) {
          if (req) fail("Sélection obligatoire.");
          data[f.name] = null;
          break;
        }
        const exists = await delegate(f.relation).count({ where: { id: v } });
        if (!exists) fail("Élément introuvable.");
        data[f.name] = v;
        break;
      }
      case "image": {
        if (v && (!isSafeUrl(v) || v.length > 500)) fail("Image invalide.");
        data[f.name] = v || null;
        if (f.altField) {
          const alt = str(f.altField);
          if (alt.length > 300) errors[f.altField] = "300 caractères maximum.";
          data[f.altField] = alt || null;
          if (v && !alt) errors[f.altField] = "Décrivez l'image (texte alternatif) pour l'accessibilité et le référencement.";
        }
        break;
      }
      case "tags": {
        const items = [...new Set(v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean))];
        if (items.length > 60) fail("60 éléments maximum.");
        if (items.some((x) => x.length > 160)) fail("Chaque élément doit faire moins de 160 caractères.");
        data[f.name] = items;
        break;
      }
      case "list": {
        try {
          const arr = JSON.parse(v || "[]");
          if (!Array.isArray(arr) || arr.length > 40) throw new Error();
          const keys = f.itemFields.map((i) => i.name);
          data[f.name] = arr
            .map((row: Record<string, unknown>) => Object.fromEntries(keys.map((k) => [k, String(row?.[k] ?? "").trim().slice(0, 1000)])))
            .filter((row: Record<string, string>) => Object.values(row).some(Boolean));
        } catch {
          fail("Liste invalide.");
        }
        break;
      }
      case "gallery": {
        try {
          const arr = JSON.parse(String(form.get("__gallery") ?? "[]"));
          if (!Array.isArray(arr) || arr.length > 200) throw new Error();
          gallery = arr.map((g: Record<string, unknown>) => ({
            mediaId: String(g.mediaId),
            kind: (["GALLERY", "BEFORE", "AFTER"].includes(String(g.kind)) ? g.kind : "GALLERY") as "GALLERY" | "BEFORE" | "AFTER",
            caption: g.caption ? String(g.caption).trim().slice(0, 300) : null,
          }));
          const ids = gallery!.map((g) => g.mediaId);
          const found = await db.media.count({ where: { id: { in: ids } } });
          if (found !== new Set(ids).size) throw new Error();
        } catch {
          errors.__gallery = "Galerie invalide.";
        }
        break;
      }
    }
  }

  // Unicité des adresses (slug) et des chemins SEO.
  const uniqueField = res.fields.find((f) => f.type === "slug")?.name ?? (res.model === "seoMeta" ? "path" : null);
  if (uniqueField && data[uniqueField] && !errors[uniqueField]) {
    if (res.model === "seoMeta") {
      const p = String(data.path);
      if (!/^\/[\w\-/]*$/.test(p)) errors.path = "Chemin invalide (doit commencer par /).";
      const clash = await delegate(res.model).findFirst({ where: { path: p, ...(id ? { NOT: { id } } : {}) } });
      if (clash) errors.path = "Une règle existe déjà pour cette page.";
    } else {
      const base = String(data[uniqueField]);
      let candidate = base;
      for (let n = 2; n < 50; n++) {
        const clash = await delegate(res.model).findFirst({ where: { [uniqueField]: candidate, ...(id ? { NOT: { id } } : {}) } });
        if (!clash) break;
        candidate = `${base}-${n}`;
      }
      data[uniqueField] = candidate;
    }
  }

  return { data, errors, gallery: gallery as GalleryInput | null };
}

export async function saveGallery(ownerType: string, ownerId: string, items: GalleryInput) {
  await db.$transaction([
    db.galleryItem.deleteMany({ where: { ownerType, ownerId } }),
    db.galleryItem.createMany({ data: items.map((g, i) => ({ ownerType, ownerId, mediaId: g.mediaId, kind: g.kind, caption: g.caption, order: i })) }),
  ]);
}

/** Valeurs d'un enregistrement converties pour pré-remplir le formulaire. */
export function toFormValues(fields: Field[], item: Data | null): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  if (!item) return out;
  for (const f of fields) {
    if (f.type === "section" || f.type === "gallery") continue;
    const v = item[f.name];
    if (f.type === "boolean") out[f.name] = Boolean(v);
    else if (f.type === "date") out[f.name] = v instanceof Date ? (f.withTime ? v.toISOString().slice(0, 16) : v.toISOString().slice(0, 10)) : "";
    else if (f.type === "tags") out[f.name] = Array.isArray(v) ? v.join("\n") : "";
    else if (f.type === "list") out[f.name] = JSON.stringify(Array.isArray(v) ? v : []);
    else out[f.name] = v === null || v === undefined ? "" : String(v);
    if (f.type === "image" && f.altField) out[f.altField] = item[f.altField] ? String(item[f.altField]) : "";
  }
  return out;
}
