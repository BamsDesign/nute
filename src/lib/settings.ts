import "server-only";
import { cache } from "react";
import { db } from "./db";

/**
 * Paramètres éditoriaux modifiables depuis l'administration.
 * Les valeurs `null` correspondent à des informations non encore confirmées
 * par NUTE : elles ne sont jamais affichées comme des faits.
 */
export type CompanySettings = {
  name: string;
  legalName: string;
  slogan: string;
  description: string;
  email: string;
  phone: string | null;
  whatsapp: string | null; // format international, ex. +509XXXXXXXX
  address: string | null;
  city: string | null;
  department: string | null;
  hours: string | null;
  mapEmbedUrl: string | null;
  foundedYear: number | null;
  acronymMeaning: string | null; // signification officielle de « NUTE », une fois confirmée
  logoUrl: string | null;
  socials: { facebook: string | null; instagram: string | null; linkedin: string | null; youtube: string | null; tiktok: string | null; x: string | null };
};

export type Figure = { value: string; label: string; verified: boolean };

export type HomeSettings = {
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  expertiseIntro: string;
  figures: Figure[];
  whyTitle: string;
  whyItems: { title: string; text: string }[];
  ctaTitle: string;
  ctaText: string;
};

export type AboutSettings = {
  intro: string;
  presentation: string;
  history: string | null;
  whyCreated: string | null;
  mission: string;
  vision: string;
  values: { title: string; text: string }[];
  approach: string;
  commitment: string;
};

export const DEFAULT_COMPANY: CompanySettings = {
  name: "NUTE",
  legalName: "NUTESERVICES",
  slogan: "La technologie, votre mission, notre solution.",
  description:
    "NUTE accompagne les particuliers, entreprises et institutions avec des solutions technologiques, informatiques et multimédias adaptées à leurs besoins.",
  email: "nuteservices@gmail.com",
  phone: null,
  whatsapp: null,
  address: null,
  city: null,
  department: null,
  hours: null,
  mapEmbedUrl: null,
  foundedYear: null,
  acronymMeaning: null,
  logoUrl: null,
  socials: { facebook: null, instagram: null, linkedin: null, youtube: null, tiktok: null, x: null },
};

export const DEFAULT_HOME: HomeSettings = {
  heroEyebrow: "Technologie · Informatique · Multimédia",
  heroTitle: "Nous transformons vos défis technologiques en solutions concrètes.",
  heroText:
    "NUTE accompagne les particuliers, entreprises et institutions avec des solutions technologiques, informatiques et multimédias adaptées à leurs besoins.",
  heroImageUrl: null,
  heroImageAlt: null,
  expertiseIntro:
    "De la maintenance d'un poste de travail au déploiement d'un réseau, du développement d'une application à la couverture photo d'un événement : une seule équipe, plusieurs domaines d'expertise.",
  figures: [],
  whyTitle: "Pourquoi choisir NUTE ?",
  whyItems: [
    {
      title: "Une expertise transversale",
      text: "Informatique, infrastructure, développement, multimédia et formation : un interlocuteur unique pour des besoins qui se croisent.",
    },
    {
      title: "Un diagnostic avant toute solution",
      text: "Chaque intervention commence par la compréhension du besoin réel, pour proposer une réponse proportionnée et durable.",
    },
    {
      title: "Un travail documenté",
      text: "Nous rendons compte de ce que nous faisons : diagnostic, solution apportée, équipements utilisés et résultat obtenu.",
    },
    {
      title: "La transmission des savoirs",
      text: "Formations, ateliers et séminaires : nous aidons nos clients à mieux comprendre et maîtriser leurs outils.",
    },
  ],
  ctaTitle: "Parlons de votre projet.",
  ctaText:
    "Un équipement à réparer, un réseau à installer, une solution numérique à concevoir ou une formation à organiser : décrivez-nous votre besoin.",
};

export const DEFAULT_ABOUT: AboutSettings = {
  intro: "Une entreprise de services technologiques et multimédias au service des particuliers, des organisations et des institutions.",
  presentation:
    "NUTE (NUTESERVICES) est une entreprise de services technologiques et multimédias. Elle intervient auprès des particuliers, des professionnels, des entreprises et des institutions dans plusieurs domaines complémentaires : maintenance et dépannage informatique, installation d'équipements et de réseaux, solutions Internet dont Starlink, vidéosurveillance, développement logiciel, sites web et applications, vente d'équipements informatiques, photographiques et audiovisuels, services multimédias, ainsi que formations, ateliers et séminaires.",
  history: null,
  whyCreated: null,
  mission:
    "Fournir des solutions technologiques et multimédias accessibles, fiables et innovantes qui aident les particuliers et les organisations à atteindre leurs objectifs.",
  vision:
    "Devenir une référence de confiance en Haïti dans les domaines de la technologie, des services numériques et des solutions multimédias.",
  values: [
    { title: "Innovation", text: "Rechercher les solutions les plus pertinentes et rester à jour des évolutions technologiques." },
    { title: "Professionnalisme", text: "Respecter les engagements, les délais et les standards de qualité de chaque intervention." },
    { title: "Responsabilité", text: "Assumer nos choix techniques et rendre compte du travail réalisé." },
    { title: "Excellence", text: "Viser un travail soigné, durable et vérifiable, jusque dans les détails." },
    { title: "Collaboration", text: "Travailler avec nos clients et partenaires, pas seulement pour eux." },
    { title: "Satisfaction client", text: "Mesurer notre réussite à la résolution effective du besoin de nos clients." },
    { title: "Accessibilité technologique", text: "Rendre la technologie compréhensible et utile au plus grand nombre." },
  ],
  approach:
    "Écouter, diagnostiquer, proposer, réaliser, documenter. Chaque mission suit une démarche claire : comprendre le besoin, identifier la cause des problèmes, proposer une solution adaptée au budget et au contexte, la mettre en œuvre avec soin, puis transmettre au client les informations utiles pour en tirer le meilleur parti.",
  commitment:
    "Nous nous engageons à communiquer clairement, à expliquer nos recommandations, à respecter la confidentialité des données et des équipements qui nous sont confiés, et à accompagner nos clients au-delà de l'intervention.",
};

async function readSetting<T extends object>(key: string, defaults: T): Promise<T> {
  try {
    const row = await db.setting.findUnique({ where: { key } });
    if (!row || typeof row.value !== "object" || row.value === null) return defaults;
    return { ...defaults, ...(row.value as Partial<T>) };
  } catch {
    return defaults;
  }
}

export const getCompany = cache(async () => {
  const c = await readSetting("company", DEFAULT_COMPANY);
  return { ...c, socials: { ...DEFAULT_COMPANY.socials, ...(c.socials ?? {}) } };
});
export const getHome = cache(() => readSetting("home", DEFAULT_HOME));
export const getAbout = cache(() => readSetting("about", DEFAULT_ABOUT));

export function whatsappLink(number: string | null, text?: string): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
