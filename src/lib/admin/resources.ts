// Définition déclarative des contenus gérés dans l'administration.
// Chaque ressource décrit ses champs : le formulaire, la validation serveur
// et la liste sont générés à partir de cette configuration.

import {
  ARTICLE_CATEGORIES,
  EVENT_ROLES,
  EVENT_TYPES,
  HAITI_DEPARTMENTS,
  INTERVENTION_TYPES,
  PROJECT_CATEGORIES,
} from "@/lib/taxonomy";

type Opt = { readonly value: string; readonly label: string };

type Base = { name: string; label: string; hint?: string; required?: boolean; half?: boolean };

export type Field =
  | (Base & { type: "text" | "url"; max?: number; placeholder?: string })
  | (Base & { type: "textarea" | "markdown"; max?: number; rows?: number })
  | (Base & { type: "slug"; from: string })
  | (Base & { type: "number"; min?: number; max?: number; step?: number })
  | (Base & { type: "date"; withTime?: boolean })
  | (Base & { type: "boolean" })
  | (Base & { type: "select"; options: readonly Opt[] })
  | (Base & { type: "relation"; relation: "serviceCategory" | "intervention" })
  | (Base & { type: "image"; altField?: string })
  | (Base & { type: "tags" })
  | (Base & { type: "list"; itemFields: { name: string; label: string; wide?: boolean }[] })
  | { type: "gallery"; name: "__gallery"; label: string; hint?: string; kinds?: boolean; required?: false; half?: false }
  | { type: "section"; name: string; label: string; hint?: string; required?: false; half?: false };

export type Column = { field: string; label: string; kind?: "text" | "date" | "bool" | "option"; options?: readonly Opt[] };

export type Resource = {
  key: string;
  model: "service" | "serviceCategory" | "project" | "intervention" | "event" | "teamMember" | "article" | "testimonial" | "partner" | "seoMeta";
  label: string;
  singular: string;
  description: string;
  titleField: string;
  fields: Field[];
  columns: Column[];
  searchFields: string[];
  orderBy: Record<string, "asc" | "desc">[];
  galleryOwner?: "Project" | "Intervention" | "Event";
  publicPath?: (item: Record<string, unknown>) => string | null;
  /** Rappel affiché en tête du formulaire. */
  notice?: string;
};

const seoFields: Field[] = [
  { type: "section", name: "_seo", label: "Référencement (facultatif)", hint: "Laisser vide pour utiliser le titre et le résumé." },
  { type: "text", name: "seoTitle", label: "Titre SEO", max: 70, half: true },
  { type: "text", name: "seoDescription", label: "Description SEO", max: 170, half: true },
];

const publishFields = (demo = true): Field[] => [
  { type: "section", name: "_pub", label: "Publication" },
  { type: "boolean", name: "published", label: "Publié sur le site", half: true },
  ...(demo
    ? ([{ type: "boolean", name: "isDemo", label: "Contenu d'exemple (badge « Exemple » affiché, exclu du sitemap)", half: true }] as Field[])
    : []),
];

const published = { field: "published", label: "Publié", kind: "bool" } as const;

export const RESOURCES: Resource[] = [
  {
    key: "realisations",
    model: "project",
    label: "Réalisations",
    singular: "réalisation",
    description: "Portfolio : projets et interventions documentés.",
    titleField: "title",
    notice: "Ne publiez que des projets réellement réalisés par NUTE. Le nom du client n'est affiché que si son autorisation est cochée.",
    galleryOwner: "Project",
    publicPath: (i) => `/realisations/${i.slug}`,
    fields: [
      { type: "text", name: "title", label: "Titre du projet", required: true, max: 160 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "title", half: true },
      { type: "select", name: "category", label: "Catégorie", options: PROJECT_CATEGORIES, required: true, half: true },
      { type: "textarea", name: "summary", label: "Résumé", required: true, max: 400, rows: 3 },
      { type: "text", name: "client", label: "Client ou institution", max: 160, half: true },
      { type: "boolean", name: "clientAuthorized", label: "Le client a autorisé la mention de son nom", half: true },
      { type: "text", name: "location", label: "Lieu", max: 160, half: true },
      { type: "date", name: "date", label: "Date", half: true },
      { type: "relation", name: "interventionId", label: "Lieu d'intervention associé", relation: "intervention" },
      { type: "section", name: "_story", label: "Étude de cas" },
      { type: "textarea", name: "problem", label: "Problème ou besoin initial", max: 4000, rows: 5 },
      { type: "textarea", name: "solution", label: "Solution apportée par NUTE", max: 4000, rows: 5 },
      { type: "tags", name: "technologies", label: "Équipements ou technologies utilisés", hint: "Un élément par ligne." },
      { type: "textarea", name: "results", label: "Résultats", max: 4000, rows: 4 },
      { type: "section", name: "_media", label: "Médias" },
      { type: "image", name: "coverUrl", altField: "coverAlt", label: "Image principale" },
      { type: "gallery", name: "__gallery", label: "Galerie et photos avant / après", kinds: true },
      { type: "url", name: "videoUrl", label: "Vidéo (YouTube, Vimeo ou fichier de la médiathèque)", max: 400 },
      ...publishFields(),
      { type: "boolean", name: "featured", label: "Mettre en avant sur la page d'accueil", half: true },
      ...seoFields,
    ],
    columns: [
      { field: "title", label: "Titre" },
      { field: "category", label: "Catégorie", kind: "option", options: PROJECT_CATEGORIES },
      { field: "date", label: "Date", kind: "date" },
      published,
      { field: "isDemo", label: "Exemple", kind: "bool" },
    ],
    searchFields: ["title", "client", "location"],
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  },
  {
    key: "interventions",
    model: "intervention",
    label: "Interventions",
    singular: "intervention",
    description: "Lieux où NUTE est intervenu (carte d'Haïti).",
    titleField: "name",
    notice: "N'ajoutez que des lieux où NUTE est réellement intervenu, avec des éléments de preuve (photos, documents). Seules les interventions cochées « vérifiées » et publiées apparaissent.",
    galleryOwner: "Intervention",
    publicPath: (i) => `/interventions/${i.slug}`,
    fields: [
      { type: "text", name: "name", label: "Nom du lieu", required: true, max: 160 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "name", half: true },
      { type: "select", name: "type", label: "Type de lieu", options: INTERVENTION_TYPES, required: true, half: true },
      { type: "text", name: "city", label: "Ville ou commune", max: 120, half: true },
      { type: "select", name: "department", label: "Département", options: HAITI_DEPARTMENTS.map((d) => ({ value: d, label: d })), half: true },
      { type: "date", name: "date", label: "Date de l'intervention", half: true },
      { type: "textarea", name: "purpose", label: "Objet de la visite", required: true, max: 600, rows: 3 },
      { type: "textarea", name: "workPerformed", label: "Travail réalisé", max: 4000, rows: 5 },
      { type: "section", name: "_geo", label: "Position sur la carte", hint: "Coordonnées GPS (clic droit sur Google Maps → copier les coordonnées). Laisser vide pour ne pas afficher de point." },
      { type: "number", name: "latitude", label: "Latitude", min: 17.9, max: 20.2, step: 0.000001, half: true },
      { type: "number", name: "longitude", label: "Longitude", min: -74.6, max: -71.5, step: 0.000001, half: true },
      { type: "section", name: "_media", label: "Médias" },
      { type: "image", name: "coverUrl", altField: "coverAlt", label: "Image principale" },
      { type: "gallery", name: "__gallery", label: "Photographies" },
      ...publishFields(),
      { type: "boolean", name: "verified", label: "Intervention vérifiée (preuves disponibles)", half: true },
    ],
    columns: [
      { field: "name", label: "Lieu" },
      { field: "type", label: "Type", kind: "option", options: INTERVENTION_TYPES },
      { field: "city", label: "Ville" },
      { field: "date", label: "Date", kind: "date" },
      { field: "verified", label: "Vérifiée", kind: "bool" },
      published,
    ],
    searchFields: ["name", "city", "department"],
    orderBy: [{ date: "desc" }],
  },
  {
    key: "activites",
    model: "event",
    label: "Activités et événements",
    singular: "activité",
    description: "Séminaires, formations, conférences, ateliers, visites…",
    titleField: "title",
    galleryOwner: "Event",
    publicPath: (i) => `/activites/${i.slug}`,
    fields: [
      { type: "text", name: "title", label: "Titre", required: true, max: 160 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "title", half: true },
      { type: "select", name: "type", label: "Type d'activité", options: EVENT_TYPES, required: true, half: true },
      { type: "select", name: "role", label: "Rôle de NUTE", options: EVENT_ROLES, required: true, half: true },
      { type: "text", name: "location", label: "Lieu", max: 160, half: true },
      { type: "date", name: "date", label: "Date de début", required: true, half: true },
      { type: "date", name: "endDate", label: "Date de fin", half: true },
      { type: "textarea", name: "summary", label: "Résumé", required: true, max: 400, rows: 3 },
      { type: "markdown", name: "description", label: "Description détaillée", max: 20000, rows: 10 },
      { type: "tags", name: "topics", label: "Thèmes abordés", hint: "Un thème par ligne." },
      { type: "number", name: "participantsCount", label: "Nombre de participants (seulement si documenté)", min: 0, max: 100000, half: true },
      { type: "boolean", name: "certificate", label: "Attestation remise aux participants", half: true },
      { type: "section", name: "_media", label: "Médias" },
      { type: "image", name: "coverUrl", altField: "coverAlt", label: "Image principale" },
      { type: "gallery", name: "__gallery", label: "Galerie photographique" },
      { type: "url", name: "videoUrl", label: "Vidéo (YouTube, Vimeo ou fichier)", max: 400 },
      ...publishFields(),
      ...seoFields,
    ],
    columns: [
      { field: "title", label: "Titre" },
      { field: "type", label: "Type", kind: "option", options: EVENT_TYPES },
      { field: "date", label: "Date", kind: "date" },
      published,
      { field: "isDemo", label: "Exemple", kind: "bool" },
    ],
    searchFields: ["title", "location"],
    orderBy: [{ date: "desc" }],
  },
  {
    key: "equipe",
    model: "teamMember",
    label: "Équipe",
    singular: "membre",
    description: "Profils professionnels des membres de l'équipe.",
    titleField: "name",
    notice: "Ne saisissez que des diplômes, fonctions, expériences et certifications vérifiés et validés par la personne concernée.",
    publicPath: (i) => `/equipe/${i.slug}`,
    fields: [
      { type: "text", name: "name", label: "Nom complet", required: true, max: 120 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "name", half: true },
      { type: "number", name: "order", label: "Ordre d'affichage", min: 0, max: 999, half: true },
      { type: "text", name: "position", label: "Fonction chez NUTE", required: true, max: 120, half: true },
      { type: "text", name: "department", label: "Département", max: 120, half: true },
      { type: "image", name: "photoUrl", altField: "photoAlt", label: "Photographie professionnelle" },
      { type: "textarea", name: "shortBio", label: "Présentation courte", max: 400, rows: 3 },
      { type: "markdown", name: "biography", label: "Biographie professionnelle", max: 10000, rows: 8 },
      { type: "tags", name: "responsibilities", label: "Responsabilités", hint: "Une responsabilité par ligne." },
      {
        type: "list",
        name: "education",
        label: "Formation académique",
        itemFields: [
          { name: "degree", label: "Diplôme" },
          { name: "field", label: "Domaine" },
          { name: "institution", label: "Établissement", wide: true },
          { name: "year", label: "Année" },
        ],
      },
      {
        type: "list",
        name: "experience",
        label: "Expérience professionnelle",
        itemFields: [
          { name: "role", label: "Poste" },
          { name: "organization", label: "Organisation" },
          { name: "period", label: "Période" },
          { name: "description", label: "Description", wide: true },
        ],
      },
      { type: "tags", name: "skills", label: "Compétences techniques", hint: "Une compétence par ligne." },
      { type: "tags", name: "certifications", label: "Certifications vérifiées", hint: "Une certification par ligne." },
      { type: "url", name: "linkedinUrl", label: "LinkedIn", max: 300, half: true },
      { type: "url", name: "portfolioUrl", label: "Portfolio professionnel", max: 300, half: true },
      ...publishFields(),
    ],
    columns: [
      { field: "name", label: "Nom" },
      { field: "position", label: "Fonction" },
      { field: "department", label: "Département" },
      published,
      { field: "isDemo", label: "Exemple", kind: "bool" },
    ],
    searchFields: ["name", "position", "department"],
    orderBy: [{ order: "asc" }, { name: "asc" }],
  },
  {
    key: "actualites",
    model: "article",
    label: "Actualités",
    singular: "article",
    description: "Annonces, projets, conseils techniques, événements…",
    titleField: "title",
    publicPath: (i) => `/actualites/${i.slug}`,
    fields: [
      { type: "text", name: "title", label: "Titre", required: true, max: 180 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "title", half: true },
      { type: "select", name: "category", label: "Catégorie", options: ARTICLE_CATEGORIES, required: true, half: true },
      { type: "text", name: "authorName", label: "Auteur", required: true, max: 120, half: true },
      { type: "date", name: "publishedAt", label: "Date de publication", withTime: true, half: true, hint: "Une date future programme la publication." },
      { type: "textarea", name: "excerpt", label: "Chapô (résumé)", required: true, max: 400, rows: 3 },
      { type: "markdown", name: "content", label: "Contenu", required: true, max: 60000, rows: 18 },
      { type: "image", name: "coverUrl", altField: "coverAlt", label: "Image à la une" },
      ...publishFields(),
      { type: "boolean", name: "featured", label: "Article à la une", half: true },
      ...seoFields,
    ],
    columns: [
      { field: "title", label: "Titre" },
      { field: "category", label: "Catégorie", kind: "option", options: ARTICLE_CATEGORIES },
      { field: "publishedAt", label: "Publication", kind: "date" },
      published,
    ],
    searchFields: ["title", "authorName"],
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  },
  {
    key: "services",
    model: "service",
    label: "Services",
    singular: "service",
    description: "Catalogue des services, avec description, problème résolu et public.",
    titleField: "title",
    publicPath: (i) => `/services/${i.slug}`,
    fields: [
      { type: "text", name: "title", label: "Nom du service", required: true, max: 160 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "title", half: true },
      { type: "relation", name: "categoryId", label: "Catégorie", relation: "serviceCategory", required: true, half: true },
      { type: "textarea", name: "summary", label: "Résumé", required: true, max: 300, rows: 2 },
      { type: "textarea", name: "description", label: "Description", required: true, max: 5000, rows: 6 },
      { type: "textarea", name: "problem", label: "Problème résolu", max: 1000, rows: 3 },
      { type: "textarea", name: "audience", label: "Public concerné", max: 600, rows: 2 },
      { type: "image", name: "coverUrl", altField: "coverAlt", label: "Image (photo réelle d'un projet de préférence)" },
      { type: "number", name: "order", label: "Ordre dans la catégorie", min: 0, max: 999, half: true },
      { type: "boolean", name: "published", label: "Publié sur le site", half: true },
      ...seoFields,
    ],
    columns: [
      { field: "title", label: "Service" },
      { field: "category.title", label: "Catégorie" },
      { field: "order", label: "Ordre" },
      published,
    ],
    searchFields: ["title"],
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
  },
  {
    key: "categories-services",
    model: "serviceCategory",
    label: "Catégories de services",
    singular: "catégorie",
    description: "Les grands domaines d'expertise.",
    titleField: "title",
    publicPath: (i) => `/services#${i.slug}`,
    fields: [
      { type: "text", name: "title", label: "Nom", required: true, max: 120 },
      { type: "slug", name: "slug", label: "Adresse (slug)", from: "title", half: true },
      { type: "number", name: "order", label: "Ordre", min: 0, max: 99, half: true },
      { type: "textarea", name: "summary", label: "Résumé", required: true, max: 400, rows: 3 },
      { type: "image", name: "coverUrl", altField: "coverAlt", label: "Image" },
    ],
    columns: [
      { field: "title", label: "Catégorie" },
      { field: "order", label: "Ordre" },
    ],
    searchFields: ["title"],
    orderBy: [{ order: "asc" }],
  },
  {
    key: "temoignages",
    model: "testimonial",
    label: "Témoignages",
    singular: "témoignage",
    description: "Uniquement des témoignages réels, avec l'accord de leur auteur.",
    titleField: "author",
    notice: "Un témoignage n'est affiché que s'il est publié ET que l'accord de son auteur est coché. N'inventez ni ne reformulez un témoignage sans validation.",
    fields: [
      { type: "text", name: "author", label: "Auteur", required: true, max: 120, half: true },
      { type: "text", name: "role", label: "Fonction", max: 120, half: true },
      { type: "text", name: "organization", label: "Organisation", max: 160 },
      { type: "textarea", name: "quote", label: "Témoignage", required: true, max: 1200, rows: 5 },
      { type: "number", name: "order", label: "Ordre", min: 0, max: 999, half: true },
      { type: "section", name: "_pub", label: "Publication" },
      { type: "boolean", name: "consent", label: "L'auteur a donné son accord écrit", half: true },
      { type: "boolean", name: "published", label: "Publié", half: true },
    ],
    columns: [
      { field: "author", label: "Auteur" },
      { field: "organization", label: "Organisation" },
      { field: "consent", label: "Accord", kind: "bool" },
      published,
    ],
    searchFields: ["author", "organization"],
    orderBy: [{ order: "asc" }],
  },
  {
    key: "partenaires",
    model: "partner",
    label: "Partenaires",
    singular: "partenaire",
    description: "Partenaires et institutions, affichés uniquement avec autorisation.",
    titleField: "name",
    notice: "Un partenaire n'est affiché que s'il est publié ET que l'autorisation de le citer est cochée.",
    fields: [
      { type: "text", name: "name", label: "Nom", required: true, max: 160 },
      { type: "image", name: "logoUrl", label: "Logo (PNG ou WebP)" },
      { type: "url", name: "websiteUrl", label: "Site web", max: 300, half: true },
      { type: "number", name: "order", label: "Ordre", min: 0, max: 999, half: true },
      { type: "section", name: "_pub", label: "Publication" },
      { type: "boolean", name: "authorized", label: "Autorisation de citer obtenue", half: true },
      { type: "boolean", name: "published", label: "Publié", half: true },
    ],
    columns: [
      { field: "name", label: "Nom" },
      { field: "authorized", label: "Autorisé", kind: "bool" },
      published,
    ],
    searchFields: ["name"],
    orderBy: [{ order: "asc" }],
  },
  {
    key: "seo",
    model: "seoMeta",
    label: "Référencement (SEO)",
    singular: "règle SEO",
    description: "Titre, description et image de partage par page.",
    titleField: "path",
    notice: "Saisissez le chemin exact de la page (ex. « / », « /services », « /a-propos »). Ces valeurs remplacent les métadonnées par défaut.",
    publicPath: (i) => String(i.path ?? "/"),
    fields: [
      { type: "text", name: "path", label: "Chemin de la page", required: true, max: 200, placeholder: "/services" },
      { type: "text", name: "title", label: "Titre", max: 70, hint: "50 à 60 caractères recommandés." },
      { type: "textarea", name: "description", label: "Description", max: 170, rows: 3, hint: "140 à 160 caractères recommandés." },
      { type: "image", name: "ogImage", label: "Image de partage (1200 × 630)" },
      { type: "boolean", name: "noindex", label: "Exclure des moteurs de recherche" },
    ],
    columns: [
      { field: "path", label: "Page" },
      { field: "title", label: "Titre" },
      { field: "noindex", label: "Noindex", kind: "bool" },
    ],
    searchFields: ["path", "title"],
    orderBy: [{ path: "asc" }],
  },
];

export function getResource(key: string) {
  return RESOURCES.find((r) => r.key === key) ?? null;
}
