// ─────────────────────────────────────────────────────────────────────
// INTERVENTIONS — lieux où NUTE est réellement intervenu (affichés sur la carte d'Haïti).
// Types : SCHOOL, UNIVERSITY, COMPANY, INSTITUTION, ORGANIZATION, COMMUNITY, OTHER
//
// Exemple :
// {
//   slug: "ecole-x",
//   name: "École X",
//   type: "SCHOOL",
//   city: "Port-au-Prince", department: "Ouest", date: "2026-03-14",
//   purpose: "Installation d'un réseau informatique pour la salle multimédia.",
//   workPerformed: "Câblage, configuration du routeur, formation du personnel…",
//   latitude: 18.5392, longitude: -72.335,         // Google Maps → clic droit → coordonnées
//   coverUrl: "/images/interventions/ecole-x.jpg", coverAlt: "Façade de l'école X",
//   photos: [{ src: "/images/interventions/ecole-x-1.jpg", alt: "…" }],
// },
// ─────────────────────────────────────────────────────────────────────
import type { InterventionInput } from "./types";

export const interventions: InterventionInput[] = [];
