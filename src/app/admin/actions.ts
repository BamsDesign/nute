"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { adminHref } from "@/lib/admin-path";
import { createSession, destroySession, hashPassword, passwordPolicyError, requireUser, verifyPassword } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { getResource } from "@/lib/admin/resources";
import { delegate, parseResourceForm, saveGallery, type FieldErrors } from "@/lib/admin/save";
import { deleteStored } from "@/lib/uploads";
import { mediaUsage } from "@/lib/admin/media";
import { DEFAULT_ABOUT, DEFAULT_COMPANY, DEFAULT_HOME } from "@/lib/settings";
import { MEDIA_CATEGORIES } from "@/lib/taxonomy";
import { DICT_KEYS, LOCALES } from "@/i18n";

export type FormState = { ok?: boolean; message?: string; errors?: FieldErrors };

const refreshSite = () => revalidatePath("/", "layout");

// ─── Authentification ──────────────────────────────────────────────────

const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(form.get("password") ?? "").slice(0, 200);
  const generic = { message: "Identifiants incorrects ou compte temporairement bloqué." };
  if (!email || !password) return { message: "Saisissez votre e-mail et votre mot de passe." };

  const ip = await getClientIp();
  if (!(await rateLimit(`login-ip:${ip}`, 20, 900)) || !(await rateLimit(`login-email:${email}`, 8, 900))) {
    await audit("auth.rate_limited", { details: { email } });
    return { message: "Trop de tentatives. Patientez 15 minutes avant de réessayer." };
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash);

  if (!user || !user.active || (user.lockedUntil && user.lockedUntil > new Date())) {
    await audit("auth.login_failed", { userId: user?.id, details: { email, reason: !user ? "unknown" : !user.active ? "inactive" : "locked" } });
    return generic;
  }
  if (!valid) {
    const failed = user.failedLogins + 1;
    await db.user.update({
      where: { id: user.id },
      data: { failedLogins: failed, lockedUntil: failed >= LOCK_AFTER ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
    });
    await audit("auth.login_failed", { userId: user.id, details: { email, reason: "password", attempts: failed } });
    return generic;
  }

  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await db.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);
  await resetRateLimit(`login-email:${email}`);
  await audit("auth.login", { userId: user.id });
  redirect(adminHref());
}

export async function logout() {
  const user = await requireUser();
  await destroySession();
  await audit("auth.logout", { userId: user.id });
  redirect(adminHref("connexion"));
}

// ─── Contenus génériques ───────────────────────────────────────────────

export async function saveResource(key: string, id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const res = getResource(key);
  if (!res) return { message: "Type de contenu inconnu." };
  if (id && !(await delegate(res.model).count({ where: { id } }))) return { message: "Élément introuvable." };

  const { data, errors, gallery } = await parseResourceForm(res, form, id);
  if (Object.keys(errors).length) return { errors, message: "Certains champs sont à corriger." };

  let saved: Record<string, unknown>;
  try {
    saved = id ? await delegate(res.model).update({ where: { id }, data }) : await delegate(res.model).create({ data });
  } catch (e) {
    console.error("[admin] enregistrement", e);
    return { message: "Enregistrement impossible. Vérifiez les données saisies." };
  }
  if (res.galleryOwner && gallery) await saveGallery(res.galleryOwner, String(saved.id), gallery);

  await audit(id ? "content.update" : "content.create", { userId: user.id, entity: res.model, entityId: String(saved.id), details: { title: String(saved[res.titleField] ?? "") } });
  refreshSite();
  if (!id) redirect(adminHref(`${res.key}/${saved.id}?cree=1`));
  return { ok: true, message: "Modifications enregistrées." };
}

export async function deleteResource(key: string, id: string) {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const res = getResource(key);
  if (!res) return;
  if (res.model === "serviceCategory" && (await db.service.count({ where: { categoryId: id } }))) {
    redirect(adminHref(`${key}/${id}?erreur=categorie-non-vide`));
  }
  const item = await delegate(res.model).findUnique({ where: { id } });
  if (!item) redirect(adminHref(key));
  await delegate(res.model).delete({ where: { id } });
  if (res.galleryOwner) await db.galleryItem.deleteMany({ where: { ownerType: res.galleryOwner, ownerId: id } });
  await audit("content.delete", { userId: user.id, entity: res.model, entityId: id, details: { title: String(item[res.titleField] ?? "") } });
  refreshSite();
  redirect(adminHref(`${key}?supprime=1`));
}

// ─── Demandes de contact ───────────────────────────────────────────────

export async function updateContact(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const status = String(form.get("status"));
  if (!["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"].includes(status)) return { message: "Statut invalide." };
  const notes = String(form.get("notes") ?? "").trim().slice(0, 5000) || null;
  await db.contactRequest.update({ where: { id }, data: { status: status as "NEW", notes } });
  await audit("contact.update", { userId: user.id, entity: "ContactRequest", entityId: id, details: { status } });
  revalidatePath(adminHref("demandes"));
  return { ok: true, message: "Demande mise à jour." };
}

export async function deleteContact(id: string) {
  const user = await requireUser(["ADMIN"]);
  await db.contactRequest.delete({ where: { id } }).catch(() => undefined);
  await audit("contact.delete", { userId: user.id, entity: "ContactRequest", entityId: id });
  redirect(adminHref("demandes?supprime=1"));
}

// ─── Paramètres du site ────────────────────────────────────────────────

const s = (max: number) => z.string().trim().max(max);
const opt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));
const optUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v) || /^\/[\w\-/.]*$/.test(v), "Adresse invalide.")
  .transform((v) => (v === "" ? null : v));
const pairs = (a: string, b: string) => z.array(z.object({ [a]: s(200), [b]: s(800) })).max(20);

const companySchema = z.object({
  name: s(60).min(1),
  legalName: s(120).min(1),
  slogan: s(160).min(1),
  description: s(400).min(1),
  email: z.string().trim().email("E-mail invalide."),
  phone: opt(40),
  whatsapp: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^\+?\d[\d\s]{7,}$/.test(v), "Format international attendu, ex. +509 3XXX XXXX.")
    .transform((v) => (v === "" ? null : v)),
  address: opt(200),
  city: opt(120),
  department: opt(60),
  hours: opt(300),
  mapEmbedUrl: z
    .string()
    .trim()
    .max(1500)
    .refine((v) => v === "" || v.startsWith("https://www.google.com/maps/embed?"), "Collez l'URL « src » du code d'intégration Google Maps.")
    .transform((v) => (v === "" ? null : v)),
  foundedYear: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && +v > 1950 && +v <= new Date().getFullYear()), "Année invalide.")
    .transform((v) => (v === "" ? null : Number(v))),
  acronymMeaning: opt(400),
  logoUrl: optUrl,
  socials: z.object({ facebook: optUrl, instagram: optUrl, linkedin: optUrl, youtube: optUrl, tiktok: optUrl, x: optUrl }),
});

const homeSchema = z.object({
  heroEyebrow: s(120),
  heroTitle: s(160).min(1),
  heroText: s(400).min(1),
  heroImageUrl: optUrl,
  heroImageAlt: opt(300),
  expertiseIntro: s(600),
  figures: z.array(z.object({ value: s(20), label: s(120), verified: z.boolean() })).max(8),
  whyTitle: s(120),
  whyItems: pairs("title", "text"),
  ctaTitle: s(120),
  ctaText: s(400),
});

const aboutSchema = z.object({
  intro: s(400),
  presentation: s(3000),
  history: opt(10000),
  whyCreated: opt(5000),
  mission: s(800),
  vision: s(800),
  values: pairs("title", "text"),
  approach: s(3000),
  commitment: s(3000),
});

function formToObject(form: FormData, defaults: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, def] of Object.entries(defaults)) {
    if (Array.isArray(def)) {
      try {
        const arr = JSON.parse(String(form.get(k) ?? "[]"));
        out[k] = Array.isArray(arr)
          ? arr.map((row) => (k === "figures" ? { value: String(row.value ?? ""), label: String(row.label ?? ""), verified: row.verified === true || row.verified === "true" } : row)).filter((row) => Object.values(row).some((v) => v !== "" && v !== false))
          : [];
      } catch {
        out[k] = [];
      }
    } else if (def && typeof def === "object") {
      out[k] = Object.fromEntries(Object.keys(def).map((sub) => [sub, String(form.get(`${k}.${sub}`) ?? "")]));
    } else out[k] = String(form.get(k) ?? "");
  }
  return out;
}

export async function saveSettings(key: "company" | "home" | "about", _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN"]);
  const conf = { company: [companySchema, DEFAULT_COMPANY], home: [homeSchema, DEFAULT_HOME], about: [aboutSchema, DEFAULT_ABOUT] } as const;
  const [schema, defaults] = conf[key];
  const parsed = schema.safeParse(formToObject(form, defaults as unknown as Record<string, unknown>));
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const i of parsed.error.issues) errors[i.path.join(".")] ??= i.message;
    return { errors, message: "Certains champs sont à corriger." };
  }
  const value = parsed.data as Prisma.InputJsonValue;
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  await audit("settings.update", { userId: user.id, entity: "Setting", entityId: key });
  refreshSite();
  return { ok: true, message: "Paramètres enregistrés." };
}

// ─── Médiathèque ───────────────────────────────────────────────────────

export async function updateMedia(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300);
  const caption = String(form.get("caption") ?? "").trim().slice(0, 500) || null;
  const category = String(form.get("category"));
  if (!MEDIA_CATEGORIES.some((c) => c.value === category)) return { message: "Catégorie invalide." };
  await db.media.update({ where: { id }, data: { alt, caption, category: category as "OTHER" } });
  await audit("media.update", { userId: user.id, entity: "Media", entityId: id });
  refreshSite();
  return { ok: true, message: "Média mis à jour." };
}

export async function deleteMedia(id: string) {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const m = await db.media.findUnique({ where: { id } });
  if (!m) redirect(adminHref("medias"));
  if ((await mediaUsage(m.url)) > 0) redirect(adminHref(`medias/${id}?erreur=utilise`));
  await db.media.delete({ where: { id } });
  await deleteStored(m.filename, m.thumbUrl);
  await audit("media.delete", { userId: user.id, entity: "Media", entityId: id, details: { name: m.originalName } });
  redirect(adminHref("medias?supprime=1"));
}

// ─── Traductions ───────────────────────────────────────────────────────

export async function saveTranslations(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const ops: Prisma.PrismaPromise<unknown>[] = [];
  for (const { code } of LOCALES) {
    for (const key of DICT_KEYS) {
      const raw = form.get(`${code}::${key}`);
      if (raw === null) continue;
      const value = String(raw).trim().slice(0, 1000);
      ops.push(
        value
          ? db.translation.upsert({ where: { locale_key: { locale: code, key } }, create: { locale: code, key, value }, update: { value } })
          : db.translation.deleteMany({ where: { locale: code, key } }),
      );
    }
  }
  await db.$transaction(ops);
  await audit("translations.update", { userId: user.id, entity: "Translation" });
  refreshSite();
  return { ok: true, message: "Traductions enregistrées." };
}

// ─── Utilisateurs ──────────────────────────────────────────────────────

export async function createUser(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Nom requis.").max(120),
      email: z.string().trim().toLowerCase().email("E-mail invalide."),
      role: z.enum(["ADMIN", "EDITOR"]),
      password: z.string(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { errors };
  }
  const pwErr = passwordPolicyError(parsed.data.password);
  if (pwErr) return { errors: { password: pwErr } };
  if (await db.user.findUnique({ where: { email: parsed.data.email } })) return { errors: { email: "Un compte existe déjà avec cet e-mail." } };
  const u = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash: await hashPassword(parsed.data.password) } });
  await audit("user.create", { userId: admin.id, entity: "User", entityId: u.id, details: { email: u.email, role: u.role } });
  revalidatePath(adminHref("utilisateurs"));
  return { ok: true, message: `Compte créé pour ${u.email}.` };
}

export async function updateUser(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const role = String(form.get("role"));
  const active = form.get("active") === "on";
  const password = String(form.get("password") ?? "");
  if (!["ADMIN", "EDITOR"].includes(role)) return { message: "Rôle invalide." };
  if (id === admin.id && (role !== "ADMIN" || !active)) return { message: "Vous ne pouvez pas retirer vos propres droits d'administrateur." };
  const data: Prisma.UserUpdateInput = { role: role as "ADMIN", active };
  if (password) {
    const err = passwordPolicyError(password);
    if (err) return { errors: { password: err } };
    data.passwordHash = await hashPassword(password);
    data.failedLogins = 0;
    data.lockedUntil = null;
  }
  await db.user.update({ where: { id }, data });
  // Toute modification sensible révoque les sessions existantes de l'utilisateur.
  if (id !== admin.id && (!active || password || role !== "ADMIN")) await db.session.deleteMany({ where: { userId: id } });
  await audit("user.update", { userId: admin.id, entity: "User", entityId: id, details: { role, active, passwordReset: Boolean(password) } });
  revalidatePath(adminHref("utilisateurs"));
  return { ok: true, message: "Compte mis à jour." };
}

export async function changeOwnPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const row = await db.user.findUnique({ where: { id: user.id } });
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { errors: { current: "Mot de passe actuel incorrect." } };
  const err = passwordPolicyError(next);
  if (err) return { errors: { next: err } };
  if (next !== confirm) return { errors: { confirm: "Les deux mots de passe ne correspondent pas." } };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  await audit("user.password_change", { userId: user.id, entity: "User", entityId: user.id });
  return { ok: true, message: "Mot de passe modifié. Vos autres sessions ont été déconnectées." };
}
