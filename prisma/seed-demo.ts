/**
 * Contenus de DÉMONSTRATION (facultatifs) pour visualiser les mises en page.
 * Chaque élément porte isDemo = true : un badge « Exemple » et une note explicite
 * sont affichés sur le site, et ces pages sont exclues du sitemap (noindex).
 * Ils ne décrivent AUCUNE réalisation, personne ou lieu réels.
 *
 *   npm run db:seed:demo            → crée les exemples
 *   npm run db:seed:demo -- --remove → supprime tous les exemples
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const year = new Date().getFullYear();
const d = (m: number, day: number, y = year) => new Date(Date.UTC(y, m - 1, day, 12));

async function remove() {
  const [p, e, t, i, a] = await Promise.all([
    db.project.findMany({ where: { isDemo: true }, select: { id: true } }),
    db.event.findMany({ where: { isDemo: true }, select: { id: true } }),
    db.teamMember.deleteMany({ where: { isDemo: true } }),
    db.intervention.findMany({ where: { isDemo: true }, select: { id: true } }),
    db.article.deleteMany({ where: { isDemo: true } }),
  ]);
  await db.galleryItem.deleteMany({ where: { ownerId: { in: [...p, ...e, ...i].map((x) => x.id) } } });
  await db.project.deleteMany({ where: { isDemo: true } });
  await db.event.deleteMany({ where: { isDemo: true } });
  await db.intervention.deleteMany({ where: { isDemo: true } });
  console.log(`Exemples supprimés : ${p.length} réalisations, ${e.length} activités, ${t.count} profils, ${i.length} interventions, ${a.count} articles.`);
}

async function create() {
  const school = await db.intervention.upsert({
    where: { slug: "exemple-etablissement-scolaire" },
    update: {},
    create: {
      slug: "exemple-etablissement-scolaire",
      name: "Exemple — Établissement scolaire",
      type: "SCHOOL",
      city: "Port-au-Prince",
      department: "Ouest",
      date: d(3, 14),
      purpose: "Exemple de fiche : installation d'un réseau informatique pour une salle multimédia.",
      workPerformed: "Texte d'exemple. Décrivez ici précisément le travail effectué sur place, les équipements installés et les personnes formées.",
      latitude: 18.5392,
      longitude: -72.335,
      verified: false,
      published: true,
      isDemo: true,
    },
  });
  await db.intervention.upsert({
    where: { slug: "exemple-entreprise-cap-haitien" },
    update: {},
    create: {
      slug: "exemple-entreprise-cap-haitien",
      name: "Exemple — Entreprise",
      type: "COMPANY",
      city: "Cap-Haïtien",
      department: "Nord",
      date: d(6, 2),
      purpose: "Exemple de fiche : installation d'un kit Starlink et configuration du réseau de bureau.",
      latitude: 19.7578,
      longitude: -72.2042,
      published: true,
      isDemo: true,
    },
  });
  await db.intervention.upsert({
    where: { slug: "exemple-institution-les-cayes" },
    update: {},
    create: {
      slug: "exemple-institution-les-cayes",
      name: "Exemple — Institution",
      type: "INSTITUTION",
      city: "Les Cayes",
      department: "Sud",
      date: d(8, 21),
      purpose: "Exemple de fiche : déploiement d'un système de vidéosurveillance.",
      latitude: 18.193,
      longitude: -73.7461,
      published: true,
      isDemo: true,
    },
  });

  const projects = [
    { slug: "exemple-reseau-salle-multimedia", title: "Exemple — Réseau d'une salle multimédia scolaire", category: "reseaux", interventionId: school.id, featured: true, technologies: ["Câblage catégorie 6", "Commutateur administrable", "Points d'accès Wi-Fi"] },
    { slug: "exemple-installation-starlink", title: "Exemple — Installation Starlink pour un bureau", category: "starlink", featured: true, technologies: ["Kit Starlink", "Routeur maillé"] },
    { slug: "exemple-videosurveillance", title: "Exemple — Système de vidéosurveillance", category: "cameras", featured: true, technologies: ["Caméras IP", "Enregistreur NVR", "Accès à distance"] },
    { slug: "exemple-site-institutionnel", title: "Exemple — Site web institutionnel", category: "web-apps", technologies: ["Next.js", "PostgreSQL"] },
  ];
  for (const [i, p] of projects.entries()) {
    await db.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        summary: "Texte d'exemple illustrant la présentation d'une réalisation : à remplacer par un projet réel et documenté.",
        location: ["Port-au-Prince", "Pétion-Ville", "Les Cayes", "Cap-Haïtien"][i],
        date: d(2 + i * 2, 10),
        problem: "Exemple : décrivez le besoin initial du client, les contraintes et la situation de départ.",
        solution: "Exemple : décrivez la solution mise en œuvre par NUTE, les étapes et les choix techniques.",
        results: "Exemple : décrivez les résultats mesurables obtenus après l'intervention.",
        published: true,
        isDemo: true,
      },
    });
  }

  const events = [
    { slug: "exemple-seminaire-cybersecurite", title: "Exemple — Séminaire de sensibilisation à la cybersécurité", type: "SEMINAR", role: "ORGANIZER", date: d(4, 18), topics: ["Mots de passe", "Hameçonnage", "Sauvegardes"] },
    { slug: "exemple-atelier-maintenance", title: "Exemple — Atelier pratique de maintenance informatique", type: "WORKSHOP", role: "TRAINER", date: d(7, 5), topics: ["Diagnostic", "Nettoyage", "Remplacement de composants"] },
    { slug: "exemple-visite-institutionnelle", title: "Exemple — Visite institutionnelle", type: "VISIT", role: "PARTICIPANT", date: d(11, 20, year - 1), topics: [] },
  ];
  for (const e of events) {
    await db.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: { ...e, location: "Port-au-Prince", summary: "Texte d'exemple illustrant la présentation d'une activité : à remplacer par une activité réelle.", published: true, isDemo: true },
    });
  }

  for (const [i, m] of [
    { name: "Profil d'exemple A", position: "Fonction à préciser", department: "Direction" },
    { name: "Profil d'exemple B", position: "Fonction à préciser", department: "Technique" },
    { name: "Profil d'exemple C", position: "Fonction à préciser", department: "Technique" },
    { name: "Profil d'exemple D", position: "Fonction à préciser", department: "Multimédia" },
  ].entries()) {
    const slug = `exemple-profil-${String.fromCharCode(97 + i)}`;
    await db.teamMember.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        ...m,
        order: i,
        shortBio: "Profil de démonstration. Remplacez-le par le profil réel d'un membre de l'équipe, validé par la personne concernée.",
        responsibilities: ["Responsabilité d'exemple"],
        skills: ["Compétence d'exemple"],
        published: true,
        isDemo: true,
      },
    });
  }

  await db.article.upsert({
    where: { slug: "exemple-article" },
    update: {},
    create: {
      slug: "exemple-article",
      title: "Exemple — Cinq gestes pour prolonger la durée de vie de votre ordinateur",
      category: "conseils",
      excerpt: "Article de démonstration illustrant la mise en page des actualités.",
      content: "Ceci est un **article d'exemple**.\n\n## Un intertitre\n\nRédigez vos articles en Markdown depuis l'administration : intertitres, listes, liens et citations sont pris en charge.\n\n- Premier point\n- Deuxième point\n\n> Une citation mise en valeur.",
      authorName: "Équipe NUTE",
      publishedAt: d(9, 1),
      published: true,
      isDemo: true,
    },
  });
  console.log("Contenus d'exemple créés (badge « Exemple » visible sur le site).");
}

(process.argv.includes("--remove") ? remove() : create())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
