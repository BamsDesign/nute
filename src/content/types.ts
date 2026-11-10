// Types des contenus du site. Les dates s'écrivent "AAAA-MM-JJ" (ex. "2026-03-14").
// Les images se placent dans public/images/… et s'indiquent par leur chemin "/images/…".

export type Photo = {
  /** Chemin de l'image, ex. "/images/realisations/reseau-ecole-1.jpg" */
  src: string;
  /** Description de ce que montre la photo (obligatoire : accessibilité et référencement). */
  alt: string;
  caption?: string;
  /** Pour les réalisations : photo prise avant ou après l'intervention. */
  kind?: "BEFORE" | "AFTER";
};

type Seo = { seoTitle?: string; seoDescription?: string };

export type ServiceInput = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  problem?: string;
  audience?: string;
  coverUrl?: string;
  coverAlt?: string;
} & Seo;

export type ServiceCategoryInput = {
  slug: string;
  title: string;
  summary: string;
  coverUrl?: string;
  coverAlt?: string;
  services: ServiceInput[];
};

export type ProjectInput = {
  slug: string;
  title: string;
  /** maintenance | installation | reseaux | cameras | starlink | logiciel | web-apps | multimedia | autres */
  category: string;
  summary: string;
  /** Nom du client : affiché seulement si clientAuthorized vaut true. */
  client?: string;
  clientAuthorized?: boolean;
  location?: string;
  date?: string;
  problem?: string;
  solution?: string;
  technologies?: string[];
  results?: string;
  coverUrl?: string;
  coverAlt?: string;
  photos?: Photo[];
  /** Lien YouTube / Vimeo, ou fichier vidéo dans public/videos/ */
  videoUrl?: string;
  /** Afficher sur la page d'accueil. */
  featured?: boolean;
  /** Slug de l'intervention (lieu) associée. */
  intervention?: string;
} & Seo;

export type InterventionInput = {
  slug: string;
  name: string;
  /** SCHOOL | UNIVERSITY | COMPANY | INSTITUTION | ORGANIZATION | COMMUNITY | OTHER */
  type: string;
  city?: string;
  department?: string;
  date?: string;
  purpose: string;
  workPerformed?: string;
  /** Coordonnées GPS pour la carte (Google Maps → clic droit → copier les coordonnées). */
  latitude?: number;
  longitude?: number;
  coverUrl?: string;
  coverAlt?: string;
  photos?: Photo[];
};

export type EventInput = {
  slug: string;
  title: string;
  /** SEMINAR | TRAINING | CONFERENCE | WORKSHOP | DEMO | VISIT | COMMUNITY | PRESENTATION | PROFESSIONAL | OTHER */
  type: string;
  /** ORGANIZER | CO_ORGANIZER | TRAINER | SPEAKER | PARTNER | EXHIBITOR | PARTICIPANT */
  role: string;
  date: string;
  endDate?: string;
  location?: string;
  summary: string;
  /** Texte détaillé (Markdown : ## titre, **gras**, - liste). */
  description?: string;
  topics?: string[];
  /** Seulement si le nombre est documenté. */
  participantsCount?: number;
  certificate?: boolean;
  coverUrl?: string;
  coverAlt?: string;
  photos?: Photo[];
  videoUrl?: string;
} & Seo;

export type TeamMemberInput = {
  slug: string;
  name: string;
  position: string;
  department?: string;
  shortBio?: string;
  /** Markdown */
  biography?: string;
  responsibilities?: string[];
  education?: { degree?: string; field?: string; institution?: string; year?: string }[];
  experience?: { role?: string; organization?: string; period?: string; description?: string }[];
  skills?: string[];
  certifications?: string[];
  linkedinUrl?: string;
  portfolioUrl?: string;
  photoUrl?: string;
  photoAlt?: string;
};

export type ArticleInput = {
  slug: string;
  title: string;
  /** annonces | services | projets | technologie | evenements | formations | produits | conseils | jalons */
  category: string;
  excerpt: string;
  /** Markdown */
  content: string;
  authorName: string;
  publishedAt: string;
  coverUrl?: string;
  coverAlt?: string;
  featured?: boolean;
} & Seo;

/** Uniquement des témoignages réels, avec l'accord écrit de leur auteur. */
export type TestimonialInput = { author: string; role?: string; organization?: string; quote: string };

/** Uniquement des partenaires ayant autorisé la mention de leur nom. */
export type PartnerInput = { name: string; logoUrl?: string; websiteUrl?: string };

// ─── Formes normalisées utilisées par les pages ───────────────────────

export type Service = Required<Pick<ServiceInput, "slug" | "title" | "summary" | "description">> & {
  id: string;
  problem: string | null;
  audience: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};
export type ServiceCategory = { id: string; slug: string; title: string; summary: string; coverUrl: string | null; coverAlt: string | null; services: Service[] };

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  client: string | null;
  clientAuthorized: boolean;
  location: string | null;
  date: Date | null;
  problem: string | null;
  solution: string | null;
  technologies: string[];
  results: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  photos: Photo[];
  videoUrl: string | null;
  featured: boolean;
  isDemo: boolean;
  interventionSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type Intervention = {
  id: string;
  slug: string;
  name: string;
  type: string;
  city: string | null;
  department: string | null;
  date: Date | null;
  purpose: string;
  workPerformed: string | null;
  latitude: number | null;
  longitude: number | null;
  coverUrl: string | null;
  coverAlt: string | null;
  photos: Photo[];
  isDemo: boolean;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  type: string;
  role: string;
  date: Date;
  endDate: Date | null;
  location: string | null;
  summary: string;
  description: string | null;
  topics: string[];
  participantsCount: number | null;
  certificate: boolean;
  coverUrl: string | null;
  coverAlt: string | null;
  photos: Photo[];
  videoUrl: string | null;
  isDemo: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type TeamMember = {
  id: string;
  slug: string;
  name: string;
  position: string;
  department: string | null;
  shortBio: string | null;
  biography: string | null;
  responsibilities: string[];
  education: NonNullable<TeamMemberInput["education"]>;
  experience: NonNullable<TeamMemberInput["experience"]>;
  skills: string[];
  certifications: string[];
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
  isDemo: boolean;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  authorName: string;
  publishedAt: Date;
  coverUrl: string | null;
  coverAlt: string | null;
  featured: boolean;
  isDemo: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};
