import fr, { type DictKey } from "./fr";

/**
 * Architecture multilingue : le français est la langue de référence.
 * Pour traduire l'interface, ajoutez ht.ts (créole haïtien) ou en.ts (anglais)
 * sur le modèle de fr.ts ; les clés absentes reprennent le français.
 */
export const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "ht", label: "Kreyòl ayisyen" },
  { code: "en", label: "English" },
] as const;
export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "fr";

export async function getDictionary(overrides: Partial<Record<DictKey, string>> = {}) {
  const dict: Record<string, string> = { ...fr, ...overrides };
  return (key: DictKey) => dict[key] ?? key;
}
