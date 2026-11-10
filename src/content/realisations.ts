// ─────────────────────────────────────────────────────────────────────
// RÉALISATIONS — uniquement des projets réellement menés par NUTE.
// Photos : public/images/realisations/  ·  Catégories possibles :
// maintenance, installation, reseaux, cameras, starlink, logiciel, web-apps, multimedia, autres
//
// Exemple à copier dans la liste :
// {
//   slug: "reseau-wifi-ecole-x",                 // adresse de la page (minuscules, tirets)
//   title: "Installation du réseau Wi-Fi de l'école X",
//   category: "reseaux",
//   summary: "Une phrase qui résume le projet.",
//   client: "École X", clientAuthorized: true,   // nom affiché seulement avec autorisation
//   location: "Port-au-Prince", date: "2026-03-14",
//   problem: "Le besoin initial…", solution: "Ce que NUTE a fait…", results: "Les résultats…",
//   technologies: ["Routeur …", "Points d'accès …"],
//   coverUrl: "/images/realisations/ecole-x.jpg", coverAlt: "Technicien NUTE installant un point d'accès",
//   photos: [
//     { src: "/images/realisations/ecole-x-avant.jpg", alt: "Câblage avant intervention", kind: "BEFORE" },
//     { src: "/images/realisations/ecole-x-apres.jpg", alt: "Baie réseau après intervention", kind: "AFTER" },
//     { src: "/images/realisations/ecole-x-2.jpg", alt: "Salle informatique équipée" },
//   ],
//   videoUrl: "https://www.youtube.com/watch?v=…",
//   featured: true,                               // afficher sur l'accueil
//   intervention: "ecole-x",                      // slug du lieu dans interventions.ts
// },
// ─────────────────────────────────────────────────────────────────────
import type { ProjectInput } from "./types";

export const realisations: ProjectInput[] = [];
