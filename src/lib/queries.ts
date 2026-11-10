import "server-only";
import { cache } from "react";
import { db } from "./db";

// Requêtes publiques : uniquement les contenus publiés.

export const getServiceCatalogue = cache(() =>
  db.serviceCategory.findMany({
    orderBy: { order: "asc" },
    include: { services: { where: { published: true }, orderBy: { order: "asc" } } },
  }),
);

export const getService = cache((slug: string) =>
  db.service.findFirst({ where: { slug, published: true }, include: { category: { include: { services: { where: { published: true }, orderBy: { order: "asc" } } } } } }),
);

export const getProjects = cache((opts: { featured?: boolean; take?: number } = {}) =>
  db.project.findMany({
    where: { published: true, ...(opts.featured ? { featured: true } : {}) },
    orderBy: [{ featured: "desc" }, { date: "desc" }, { createdAt: "desc" }],
    take: opts.take,
  }),
);

export const getProject = cache((slug: string) =>
  db.project.findFirst({ where: { slug, published: true }, include: { intervention: true } }),
);

export const getInterventions = cache(() =>
  db.intervention.findMany({ where: { published: true }, orderBy: [{ date: "desc" }, { name: "asc" }] }),
);

export const getIntervention = cache((slug: string) =>
  db.intervention.findFirst({ where: { slug, published: true }, include: { projects: { where: { published: true } } } }),
);

export const getEvents = cache((opts: { types?: string[]; take?: number } = {}) =>
  db.event.findMany({
    where: { published: true, ...(opts.types ? { type: { in: opts.types } } : {}) },
    orderBy: { date: "desc" },
    take: opts.take,
  }),
);

export const getEvent = cache((slug: string) => db.event.findFirst({ where: { slug, published: true } }));

export const getTeam = cache((take?: number) => db.teamMember.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { name: "asc" }], take }));

export const getTeamMember = cache((slug: string) => db.teamMember.findFirst({ where: { slug, published: true } }));

export const getArticles = cache((opts: { category?: string; take?: number } = {}) =>
  db.article.findMany({
    where: { published: true, publishedAt: { lte: new Date() }, ...(opts.category ? { category: opts.category } : {}) },
    orderBy: [{ publishedAt: "desc" }],
    take: opts.take,
  }),
);

export const getArticle = cache((slug: string) => db.article.findFirst({ where: { slug, published: true, publishedAt: { lte: new Date() } } }));

/** Témoignages : uniquement s'ils sont authentiques (consentement enregistré) et publiés. */
export const getTestimonials = cache(() => db.testimonial.findMany({ where: { published: true, consent: true }, orderBy: { order: "asc" } }));

/** Partenaires : uniquement si l'autorisation de citer est enregistrée. */
export const getPartners = cache(() => db.partner.findMany({ where: { published: true, authorized: true }, orderBy: { order: "asc" } }));

export const getGallery = cache((ownerType: "Project" | "Intervention" | "Event", ownerId: string) =>
  db.galleryItem.findMany({ where: { ownerType, ownerId }, orderBy: { order: "asc" }, include: { media: true } }),
);
