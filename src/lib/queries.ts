// Lecture des contenus du site (fichiers de src/content/), normalisés pour les pages.
import { catalogue } from "@/content/services";
import { realisations } from "@/content/realisations";
import { interventions as interventionsData } from "@/content/interventions";
import { activites } from "@/content/activites";
import { equipe } from "@/content/equipe";
import { actualites } from "@/content/actualites";
import { temoignages } from "@/content/temoignages";
import { partenaires } from "@/content/partenaires";
import type { Article, Event, Intervention, Project, ServiceCategory, TeamMember } from "@/content/types";

const d = (v?: string | null) => (v ? new Date(`${v}T12:00:00Z`) : null);
const n = <T,>(v: T | undefined | null) => (v === undefined || v === "" ? null : v) as T | null;
const byDateDesc = (a: Date | null, b: Date | null) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0);

const CATALOGUE: ServiceCategory[] = catalogue.map((c) => ({
  id: c.slug,
  slug: c.slug,
  title: c.title,
  summary: c.summary,
  coverUrl: n(c.coverUrl),
  coverAlt: n(c.coverAlt),
  services: c.services.map((s) => ({
    id: s.slug,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    description: s.description,
    problem: n(s.problem),
    audience: n(s.audience),
    coverUrl: n(s.coverUrl),
    coverAlt: n(s.coverAlt),
    seoTitle: n(s.seoTitle),
    seoDescription: n(s.seoDescription),
  })),
}));

const INTERVENTIONS: Intervention[] = interventionsData
  .map((i) => ({
    id: i.slug,
    slug: i.slug,
    name: i.name,
    type: i.type,
    city: n(i.city),
    department: n(i.department),
    date: d(i.date),
    purpose: i.purpose,
    workPerformed: n(i.workPerformed),
    latitude: n(i.latitude),
    longitude: n(i.longitude),
    coverUrl: n(i.coverUrl),
    coverAlt: n(i.coverAlt),
    photos: i.photos ?? [],
    isDemo: false,
  }))
  .sort((a, b) => byDateDesc(a.date, b.date));

const PROJECTS: Project[] = realisations
  .map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    category: p.category,
    summary: p.summary,
    client: n(p.client),
    clientAuthorized: Boolean(p.clientAuthorized),
    location: n(p.location),
    date: d(p.date),
    problem: n(p.problem),
    solution: n(p.solution),
    technologies: p.technologies ?? [],
    results: n(p.results),
    coverUrl: n(p.coverUrl),
    coverAlt: n(p.coverAlt),
    photos: p.photos ?? [],
    videoUrl: n(p.videoUrl),
    featured: Boolean(p.featured),
    isDemo: false,
    interventionSlug: n(p.intervention),
    seoTitle: n(p.seoTitle),
    seoDescription: n(p.seoDescription),
  }))
  .sort((a, b) => Number(b.featured) - Number(a.featured) || byDateDesc(a.date, b.date));

const EVENTS: Event[] = activites
  .map((e) => ({
    id: e.slug,
    slug: e.slug,
    title: e.title,
    type: e.type,
    role: e.role,
    date: d(e.date)!,
    endDate: d(e.endDate),
    location: n(e.location),
    summary: e.summary,
    description: n(e.description),
    topics: e.topics ?? [],
    participantsCount: n(e.participantsCount),
    certificate: Boolean(e.certificate),
    coverUrl: n(e.coverUrl),
    coverAlt: n(e.coverAlt),
    photos: e.photos ?? [],
    videoUrl: n(e.videoUrl),
    isDemo: false,
    seoTitle: n(e.seoTitle),
    seoDescription: n(e.seoDescription),
  }))
  .sort((a, b) => byDateDesc(a.date, b.date));

const TEAM: TeamMember[] = equipe.map((m) => ({
  id: m.slug,
  slug: m.slug,
  name: m.name,
  position: m.position,
  department: n(m.department),
  shortBio: n(m.shortBio),
  biography: n(m.biography),
  responsibilities: m.responsibilities ?? [],
  education: m.education ?? [],
  experience: m.experience ?? [],
  skills: m.skills ?? [],
  certifications: m.certifications ?? [],
  linkedinUrl: n(m.linkedinUrl),
  portfolioUrl: n(m.portfolioUrl),
  photoUrl: n(m.photoUrl),
  photoAlt: n(m.photoAlt),
  isDemo: false,
}));

const ARTICLES: Article[] = actualites
  .map((a) => ({
    id: a.slug,
    slug: a.slug,
    title: a.title,
    category: a.category,
    excerpt: a.excerpt,
    content: a.content,
    authorName: a.authorName,
    publishedAt: d(a.publishedAt)!,
    coverUrl: n(a.coverUrl),
    coverAlt: n(a.coverAlt),
    featured: Boolean(a.featured),
    isDemo: false,
    seoTitle: n(a.seoTitle),
    seoDescription: n(a.seoDescription),
  }))
  .sort((a, b) => byDateDesc(a.publishedAt, b.publishedAt));

export const getServiceCatalogue = async () => CATALOGUE;
export const allServices = () => CATALOGUE.flatMap((c) => c.services.map((s) => ({ ...s, category: c })));
export const getService = async (slug: string) => allServices().find((s) => s.slug === slug) ?? null;

export const getProjects = async (opts: { take?: number } = {}) => PROJECTS.slice(0, opts.take);
export const getProject = async (slug: string) => {
  const p = PROJECTS.find((x) => x.slug === slug);
  return p ? { ...p, intervention: INTERVENTIONS.find((i) => i.slug === p.interventionSlug) ?? null } : null;
};

export const getInterventions = async () => INTERVENTIONS;
export const getIntervention = async (slug: string) => {
  const i = INTERVENTIONS.find((x) => x.slug === slug);
  return i ? { ...i, projects: PROJECTS.filter((p) => p.interventionSlug === slug) } : null;
};

export const getEvents = async (opts: { types?: string[]; take?: number } = {}) => EVENTS.filter((e) => !opts.types || opts.types.includes(e.type)).slice(0, opts.take);
export const getEvent = async (slug: string) => EVENTS.find((e) => e.slug === slug) ?? null;

export const getTeam = async (take?: number) => TEAM.slice(0, take);
export const getTeamMember = async (slug: string) => TEAM.find((m) => m.slug === slug) ?? null;

export const getArticles = async (opts: { take?: number } = {}) => ARTICLES.slice(0, opts.take);
export const getArticle = async (slug: string) => ARTICLES.find((a) => a.slug === slug) ?? null;

export const getTestimonials = async () => temoignages;
export const getPartners = async () => partenaires;

/** Next.js exige au moins une page par route dynamique : sans contenu, une page vide (404) est générée. */
export const PLACEHOLDER = "__vide";
const orPlaceholder = (rows: { slug: string }[]) => (rows.length ? rows : [{ slug: PLACEHOLDER }]);
export const staticParams = {
  services: () => orPlaceholder(slugs.services()),
  projects: () => orPlaceholder(slugs.projects()),
  interventions: () => orPlaceholder(slugs.interventions()),
  events: () => orPlaceholder(slugs.events()),
  team: () => orPlaceholder(slugs.team()),
  articles: () => orPlaceholder(slugs.articles()),
};

export const slugs = {
  services: () => allServices().map((s) => ({ slug: s.slug })),
  projects: () => PROJECTS.map((p) => ({ slug: p.slug })),
  interventions: () => INTERVENTIONS.map((i) => ({ slug: i.slug })),
  events: () => EVENTS.map((e) => ({ slug: e.slug })),
  team: () => TEAM.map((m) => ({ slug: m.slug })),
  articles: () => ARTICLES.map((a) => ({ slug: a.slug })),
};
