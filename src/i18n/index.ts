import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import fr, { type DictKey } from "./fr";

/**
 * Architecture multilingue : le français est la langue de référence.
 * Le créole haïtien (ht) et l'anglais (en) héritent du français tant qu'une
 * traduction n'a pas été saisie dans l'administration (menu Traductions).
 */
export const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "ht", label: "Kreyòl ayisyen" },
  { code: "en", label: "English" },
] as const;
export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "fr";
export const DICT_KEYS = Object.keys(fr) as DictKey[];
export { fr as baseDictionary };

export const getLocale = cache(async (): Promise<Locale> => {
  const v = (await cookies()).get("locale")?.value;
  return LOCALES.some((l) => l.code === v) ? (v as Locale) : DEFAULT_LOCALE;
});

export const getDictionary = cache(async (locale?: Locale) => {
  const loc = locale ?? (await getLocale());
  const dict: Record<string, string> = { ...fr };
  try {
    const rows = await db.translation.findMany({ where: { locale: { in: loc === "fr" ? ["fr"] : ["fr", loc] } } });
    // Les surcharges françaises d'abord, puis la langue cible.
    for (const r of rows.filter((r) => r.locale === "fr")) dict[r.key] = r.value;
    for (const r of rows.filter((r) => r.locale === loc && loc !== "fr")) dict[r.key] = r.value;
  } catch {
    /* base indisponible : dictionnaire par défaut */
  }
  return (key: DictKey) => dict[key] ?? key;
});
