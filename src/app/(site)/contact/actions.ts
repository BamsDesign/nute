"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/request";
import { sendMail } from "@/lib/mailer";
import { getCompany } from "@/lib/settings";

export type ContactState = { status: "idle" | "success" | "error"; message?: string; errors?: Partial<Record<string, string>>; values?: Record<string, string> };

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom complet.").max(120),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(160),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+\d][\d\s().-]{6,}$/.test(v), "Numéro de téléphone invalide.")
    .optional()
    .default(""),
  company: z.string().trim().max(160).optional().default(""),
  subject: z.string().trim().min(3, "Précisez l'objet de votre message.").max(160),
  service: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(20, "Votre message doit contenir au moins 20 caractères.").max(5000, "Message trop long (5 000 caractères maximum)."),
  consent: z.literal("on", { message: "Votre accord est nécessaire pour traiter votre demande." }),
});

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(["name", "email", "phone", "company", "subject", "service", "message", "consent"].map((k) => [k, String(formData.get(k) ?? "")]));
  const values = { ...raw, consent: "" };

  // Pot de miel anti-robots : champ invisible qui doit rester vide.
  if (String(formData.get("website") ?? "") !== "") return { status: "success" };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Le message n'a pas pu être envoyé. Vérifiez les champs signalés.", errors, values };
  }

  const ip = await getClientIp();
  if (!(await rateLimit(`contact:${ip}`, 5, 3600))) {
    return { status: "error", message: "Trop de messages envoyés depuis votre connexion. Réessayez plus tard ou écrivez-nous par e-mail.", values };
  }

  const d = parsed.data;
  try {
    await db.contactRequest.create({
      data: { name: d.name, email: d.email, phone: d.phone || null, company: d.company || null, subject: d.subject, service: d.service || null, message: d.message, ip, userAgent: await getUserAgent() },
    });
  } catch (e) {
    console.error("[contact] enregistrement impossible", e);
    const c = await getCompany();
    return { status: "error", message: `Une erreur technique est survenue. Écrivez-nous directement à ${c.email}.`, values };
  }

  const to = process.env.CONTACT_NOTIFY_TO || (await getCompany()).email;
  await sendMail({
    to,
    replyTo: d.email,
    subject: `[Site NUTE] ${d.subject}`,
    text: `Nouvelle demande depuis le site\n\nNom : ${d.name}\nE-mail : ${d.email}\nTéléphone : ${d.phone || "—"}\nEntreprise / institution : ${d.company || "—"}\nService : ${d.service || "—"}\nObjet : ${d.subject}\n\n${d.message}`,
  });

  return { status: "success", message: "Merci. Votre message a bien été envoyé. Notre équipe vous répondra dans les meilleurs délais." };
}
