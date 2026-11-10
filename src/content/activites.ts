// ─────────────────────────────────────────────────────────────────────
// ACTIVITÉS ET ÉVÉNEMENTS — séminaires, formations, conférences, ateliers, visites…
// Types : SEMINAR, TRAINING, CONFERENCE, WORKSHOP, DEMO, VISIT, COMMUNITY, PRESENTATION, PROFESSIONAL, OTHER
// Rôle de NUTE : ORGANIZER, CO_ORGANIZER, TRAINER, SPEAKER, PARTNER, EXHIBITOR, PARTICIPANT
// Les formations, séminaires, ateliers et conférences apparaissent aussi sur la page « Formations ».
// Une date future fait apparaître l'activité dans « À venir ».
//
// Exemple :
// {
//   slug: "seminaire-cybersecurite-2026",
//   title: "Séminaire de sensibilisation à la cybersécurité",
//   type: "SEMINAR", role: "ORGANIZER",
//   date: "2026-04-18", location: "Port-au-Prince",
//   summary: "Une phrase qui résume l'activité.",
//   description: "Texte détaillé en Markdown…",
//   topics: ["Mots de passe", "Hameçonnage"],
//   participantsCount: 45,                         // seulement si documenté
//   certificate: true,
//   coverUrl: "/images/activites/seminaire.jpg", coverAlt: "…",
//   photos: [{ src: "/images/activites/seminaire-1.jpg", alt: "…" }],
// },
// ─────────────────────────────────────────────────────────────────────
import type { EventInput } from "./types";

export const activites: EventInput[] = [];
