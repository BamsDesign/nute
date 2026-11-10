// Taxonomies éditoriales partagées entre le site public et l'administration.

export const PROJECT_CATEGORIES = [
  { value: "maintenance", label: "Maintenance et réparation" },
  { value: "installation", label: "Installation" },
  { value: "reseaux", label: "Réseaux informatiques" },
  { value: "cameras", label: "Caméras de surveillance" },
  { value: "starlink", label: "Starlink" },
  { value: "logiciel", label: "Développement logiciel" },
  { value: "web-apps", label: "Sites web et applications" },
  { value: "multimedia", label: "Photographie et multimédia" },
  { value: "autres", label: "Autres interventions" },
] as const;

export const INTERVENTION_TYPES = [
  { value: "SCHOOL", label: "École" },
  { value: "UNIVERSITY", label: "Université" },
  { value: "COMPANY", label: "Entreprise" },
  { value: "INSTITUTION", label: "Institution" },
  { value: "ORGANIZATION", label: "Organisation" },
  { value: "COMMUNITY", label: "Communauté" },
  { value: "OTHER", label: "Autre lieu" },
] as const;

export const EVENT_TYPES = [
  { value: "SEMINAR", label: "Séminaire" },
  { value: "TRAINING", label: "Formation" },
  { value: "CONFERENCE", label: "Conférence" },
  { value: "WORKSHOP", label: "Atelier" },
  { value: "DEMO", label: "Démonstration technologique" },
  { value: "VISIT", label: "Visite institutionnelle" },
  { value: "COMMUNITY", label: "Activité communautaire" },
  { value: "PRESENTATION", label: "Présentation publique" },
  { value: "PROFESSIONAL", label: "Événement professionnel" },
  { value: "OTHER", label: "Autre activité" },
] as const;

/** Types d'activités présentés dans « Formations et séminaires ». */
export const LEARNING_EVENT_TYPES = ["SEMINAR", "TRAINING", "WORKSHOP", "CONFERENCE"];

export const EVENT_ROLES = [
  { value: "ORGANIZER", label: "Organisateur" },
  { value: "CO_ORGANIZER", label: "Co-organisateur" },
  { value: "TRAINER", label: "Formateur" },
  { value: "SPEAKER", label: "Intervenant" },
  { value: "PARTNER", label: "Partenaire" },
  { value: "EXHIBITOR", label: "Exposant" },
  { value: "PARTICIPANT", label: "Participant" },
] as const;

export const ARTICLE_CATEGORIES = [
  { value: "annonces", label: "Annonces" },
  { value: "services", label: "Nouveaux services" },
  { value: "projets", label: "Projets réalisés" },
  { value: "technologie", label: "Actualité technologique" },
  { value: "evenements", label: "Événements" },
  { value: "formations", label: "Formations" },
  { value: "produits", label: "Produits" },
  { value: "conseils", label: "Conseils techniques" },
  { value: "jalons", label: "Étapes de l'entreprise" },
] as const;

export const HAITI_DEPARTMENTS = [
  "Artibonite",
  "Centre",
  "Grand'Anse",
  "Nippes",
  "Nord",
  "Nord-Est",
  "Nord-Ouest",
  "Ouest",
  "Sud",
  "Sud-Est",
] as const;

export const MEDIA_CATEGORIES = [
  { value: "BRAND", label: "Logo et identité" },
  { value: "TEAM", label: "Portraits de l'équipe" },
  { value: "PROJECTS", label: "Projets réalisés" },
  { value: "INTERVENTIONS", label: "Interventions techniques" },
  { value: "TRAINING", label: "Sessions de formation" },
  { value: "SEMINARS", label: "Séminaires" },
  { value: "EVENTS", label: "Événements" },
  { value: "PRODUCTS", label: "Équipements et produits" },
  { value: "VIDEOS", label: "Vidéos" },
  { value: "OTHER", label: "Autres" },
] as const;

export const CONTACT_STATUSES = [
  { value: "NEW", label: "Nouvelle" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "DONE", label: "Traitée" },
  { value: "ARCHIVED", label: "Archivée" },
] as const;

type Opt = { readonly value: string; readonly label: string };
export function labelOf(list: readonly Opt[], value: string | null | undefined): string {
  return list.find((o) => o.value === value)?.label ?? value ?? "";
}
