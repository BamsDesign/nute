import { about, company, home } from "@/content/entreprise";

export type { AboutSettings, CompanySettings, HomeSettings } from "@/content/entreprise";

// Les contenus sont lus depuis src/content/entreprise.ts (site statique).
export const getCompany = async () => company;
export const getHome = async () => home;
export const getAbout = async () => about;

export function whatsappLink(number: string | null, text?: string): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
