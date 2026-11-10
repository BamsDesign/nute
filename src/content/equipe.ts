// ─────────────────────────────────────────────────────────────────────
// ÉQUIPE — n'indiquez que des informations validées par chaque personne.
// Photos : public/images/equipe/ (format portrait de préférence).
//
// Exemple :
// {
//   slug: "prenom-nom",
//   name: "Prénom Nom",
//   position: "Directeur technique",
//   department: "Technique",
//   shortBio: "Présentation en une ou deux phrases.",
//   biography: "Biographie détaillée (Markdown)…",
//   responsibilities: ["Supervision des installations réseau"],
//   education: [{ degree: "Licence", field: "Informatique", institution: "Université …", year: "2020" }],
//   experience: [{ role: "Technicien réseau", organization: "…", period: "2020 – 2023", description: "…" }],
//   skills: ["Réseaux", "Starlink"],
//   certifications: ["…"],
//   linkedinUrl: "https://www.linkedin.com/in/…",
//   photoUrl: "/images/equipe/prenom-nom.jpg", photoAlt: "Portrait de Prénom Nom",
// },
// L'ordre de la liste est l'ordre d'affichage.
// ─────────────────────────────────────────────────────────────────────
import type { TeamMemberInput } from "./types";

export const equipe: TeamMemberInput[] = [];
