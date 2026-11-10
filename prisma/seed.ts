/**
 * Données initiales VÉRIFIÉES : catalogue de services fourni par NUTE.
 * Aucune réalisation, intervention, personne, partenaire ou témoignage n'est créé ici.
 * Idempotent : peut être relancé sans dupliquer les données.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type S = { slug: string; title: string; summary: string; description: string; problem: string; audience: string };
type C = { slug: string; title: string; summary: string; services: S[] };

const catalogue: C[] = [
  {
    slug: "informatique-et-maintenance",
    title: "Informatique et maintenance",
    summary: "Diagnostic, réparation et entretien des ordinateurs et des postes de travail, pour des équipements fiables et durables.",
    services: [
      {
        slug: "reparation-ordinateurs",
        title: "Réparation d'ordinateurs",
        summary: "Remise en état des ordinateurs portables et de bureau : composants, écrans, alimentation, stockage.",
        description:
          "Nous identifions l'origine de la panne et remettons en état vos ordinateurs portables et de bureau : remplacement de composants défectueux, écrans, claviers, alimentations, disques et mémoire. Chaque réparation est précédée d'un diagnostic et d'une explication claire de l'intervention proposée.",
        problem: "Un ordinateur qui ne démarre plus, qui chauffe, qui s'éteint seul ou dont un composant est endommagé immobilise votre travail.",
        audience: "Particuliers, étudiants, professionnels indépendants, entreprises et institutions.",
      },
      {
        slug: "diagnostic-technique",
        title: "Diagnostic technique",
        summary: "Analyse méthodique du matériel et du logiciel pour identifier la cause réelle d'un dysfonctionnement.",
        description:
          "Avant toute réparation ou tout achat, nous réalisons un diagnostic matériel et logiciel méthodique : tests des composants, état du stockage, températures, système d'exploitation, logiciels et virus. Vous savez précisément ce qui ne va pas et quelles options s'offrent à vous.",
        problem: "Sans diagnostic fiable, on remplace parfois la mauvaise pièce ou l'on renonce à un équipement encore réparable.",
        audience: "Toute personne ou organisation confrontée à un équipement lent, instable ou en panne.",
      },
      {
        slug: "maintenance-preventive",
        title: "Maintenance préventive",
        summary: "Entretien planifié du parc informatique pour éviter les pannes et prolonger la durée de vie du matériel.",
        description:
          "Nettoyage interne, contrôle des composants, mises à jour, vérification des sauvegardes et de la sécurité : la maintenance préventive réduit les pannes imprévues et prolonge la durée de vie de vos équipements. Elle peut être organisée de façon ponctuelle ou périodique.",
        problem: "La poussière, la chaleur et l'absence de mises à jour provoquent des pannes coûteuses qui auraient pu être évitées.",
        audience: "Entreprises, écoles, institutions et organisations disposant d'un parc informatique.",
      },
      {
        slug: "maintenance-corrective",
        title: "Maintenance corrective",
        summary: "Intervention rapide pour rétablir le fonctionnement d'un équipement ou d'un système en panne.",
        description:
          "Lorsqu'une panne survient, nous intervenons pour rétablir le fonctionnement de vos équipements et systèmes : remplacement de pièces, réparation logicielle, restauration du système, récupération de la configuration. L'objectif est de limiter l'interruption de votre activité.",
        problem: "Une panne sur un poste clé interrompt l'activité et peut entraîner une perte de données.",
        audience: "Professionnels, entreprises et institutions dont l'activité dépend de leurs outils informatiques.",
      },
      {
        slug: "installation-systemes-logiciels",
        title: "Installation de systèmes et logiciels",
        summary: "Installation et configuration de systèmes d'exploitation, de logiciels professionnels et d'outils bureautiques.",
        description:
          "Nous installons et configurons les systèmes d'exploitation, pilotes, logiciels bureautiques et professionnels, antivirus et outils de sauvegarde, en veillant à la compatibilité avec votre matériel et à la sécurité de l'ensemble.",
        problem: "Un système mal installé ou des logiciels mal configurés génèrent instabilité, lenteurs et failles de sécurité.",
        audience: "Particuliers, professionnels, entreprises, écoles et institutions.",
      },
      {
        slug: "assistance-technique",
        title: "Assistance technique",
        summary: "Accompagnement et dépannage des utilisateurs, sur place ou à distance.",
        description:
          "Nous accompagnons les utilisateurs dans la résolution de leurs problèmes informatiques du quotidien : dépannage, paramétrage, conseils d'utilisation, sur place ou à distance selon la situation.",
        problem: "Les petits blocages techniques répétés font perdre du temps et freinent la productivité.",
        audience: "Particuliers, équipes de bureau, entreprises et institutions.",
      },
    ],
  },
  {
    slug: "installation-et-infrastructure",
    title: "Installation et infrastructure",
    summary: "Réseaux, connectivité Internet, Starlink et vidéosurveillance : des infrastructures installées et configurées avec rigueur.",
    services: [
      {
        slug: "installation-reseaux-informatiques",
        title: "Installation de réseaux informatiques",
        summary: "Conception et déploiement de réseaux filaires et sans fil pour bureaux, écoles et institutions.",
        description:
          "Nous concevons et installons des réseaux informatiques filaires et Wi-Fi adaptés à vos locaux et à vos usages : câblage, points d'accès, commutateurs, organisation des équipements et tests de fonctionnement.",
        problem: "Un réseau mal conçu provoque des coupures, une couverture Wi-Fi insuffisante et des débits faibles.",
        audience: "Entreprises, écoles, universités, institutions et organisations.",
      },
      {
        slug: "configuration-routeurs",
        title: "Configuration de routeurs",
        summary: "Paramétrage et sécurisation des routeurs et points d'accès.",
        description:
          "Configuration des routeurs et points d'accès : réseau sans fil, mots de passe, sécurité, contrôle d'accès, répartition des appareils et optimisation de la couverture.",
        problem: "Un routeur laissé avec sa configuration d'origine expose le réseau et n'exploite pas ses capacités.",
        audience: "Particuliers, petites structures, entreprises et institutions.",
      },
      {
        slug: "installation-starlink",
        title: "Installation de Starlink",
        summary: "Installation et configuration de solutions Internet par satellite Starlink.",
        description:
          "Nous installons et configurons les équipements Starlink : choix de l'emplacement, fixation, raccordement, configuration du réseau et intégration avec votre infrastructure existante pour une connexion stable.",
        problem: "Dans de nombreuses zones, l'accès à une connexion Internet fiable reste difficile.",
        audience: "Particuliers, entreprises, écoles, institutions et organisations, y compris hors des zones bien desservies.",
      },
      {
        slug: "installation-cameras-surveillance",
        title: "Installation de caméras de surveillance",
        summary: "Installation et configuration de systèmes de vidéosurveillance, avec consultation à distance.",
        description:
          "Nous installons et configurons des systèmes de vidéosurveillance : choix et positionnement des caméras, enregistreur, câblage, stockage des images et consultation à distance sur ordinateur ou téléphone.",
        problem: "Protéger des locaux, des biens et des personnes exige un système bien dimensionné et correctement configuré.",
        audience: "Particuliers, commerces, entreprises, écoles et institutions.",
      },
      {
        slug: "configuration-optimisation-equipements",
        title: "Configuration et optimisation des équipements",
        summary: "Mise en service et optimisation des équipements informatiques, réseau et audiovisuels.",
        description:
          "Mise en service, configuration et optimisation de vos équipements : ordinateurs, imprimantes, équipements réseau, matériel audiovisuel. Nous veillons à ce que chaque appareil fonctionne correctement et s'intègre à votre environnement.",
        problem: "Des équipements mal configurés n'offrent pas les performances attendues.",
        audience: "Particuliers, entreprises, écoles et institutions.",
      },
    ],
  },
  {
    slug: "developpement-et-solutions-numeriques",
    title: "Développement et solutions numériques",
    summary: "Logiciels, sites web et applications conçus autour des besoins réels des organisations.",
    services: [
      {
        slug: "developpement-logiciels",
        title: "Développement de logiciels",
        summary: "Conception de logiciels sur mesure pour automatiser et structurer vos activités.",
        description:
          "Nous concevons des logiciels adaptés à vos processus : gestion, suivi, saisie et traitement de données. Le développement commence par l'analyse de vos besoins et se poursuit jusqu'à la mise en service et l'accompagnement des utilisateurs.",
        problem: "Les tâches manuelles répétitives et les données dispersées ralentissent les organisations.",
        audience: "Entreprises, institutions, écoles et organisations.",
      },
      {
        slug: "creation-sites-web",
        title: "Création de sites web",
        summary: "Sites vitrines et sites institutionnels rapides, accessibles et bien référencés.",
        description:
          "Nous créons des sites web professionnels : structure du contenu, conception graphique, développement, optimisation pour les mobiles et les moteurs de recherche, mise en ligne et formation à la mise à jour.",
        problem: "Sans présence en ligne crédible, une organisation reste difficile à trouver et à évaluer.",
        audience: "Entreprises, professionnels, institutions, écoles et organisations.",
      },
      {
        slug: "developpement-applications",
        title: "Développement d'applications",
        summary: "Applications web et mobiles pour vos clients, vos équipes ou vos usagers.",
        description:
          "Nous développons des applications web et mobiles qui répondent à un usage précis : services aux clients, outils internes, plateformes de gestion. Nous accompagnons le projet de la conception à la mise en production.",
        problem: "Certains besoins ne trouvent pas de réponse dans les outils existants.",
        audience: "Entreprises, institutions, porteurs de projets et organisations.",
      },
      {
        slug: "solutions-numeriques-entreprises-institutions",
        title: "Solutions numériques pour entreprises et institutions",
        summary: "Accompagnement dans la transformation numérique et le choix des outils adaptés.",
        description:
          "Nous aidons les entreprises et institutions à choisir, mettre en place et utiliser les bons outils numériques : messagerie, outils collaboratifs, gestion documentaire, présence en ligne, sauvegarde et sécurité.",
        problem: "Face à la multitude d'outils, il est difficile de savoir lesquels adopter et comment les déployer.",
        audience: "Entreprises, institutions, écoles et organisations.",
      },
    ],
  },
  {
    slug: "achat-vente-et-accessoires",
    title: "Achat, vente et accessoires",
    summary: "Équipements informatiques, photographiques et audiovisuels, conseillés selon votre usage.",
    services: [
      {
        slug: "vente-ordinateurs-equipements",
        title: "Vente d'ordinateurs et équipements informatiques",
        summary: "Ordinateurs et équipements choisis selon votre usage et votre budget.",
        description:
          "Nous proposons des ordinateurs et équipements informatiques et vous conseillons dans le choix du matériel adapté à votre usage, à votre budget et à votre environnement de travail.",
        problem: "Un matériel inadapté coûte cher et ne répond pas aux besoins réels.",
        audience: "Particuliers, étudiants, professionnels, entreprises et institutions.",
      },
      {
        slug: "accessoires-informatiques",
        title: "Accessoires informatiques",
        summary: "Périphériques, stockage, câbles, protection et accessoires du quotidien.",
        description: "Claviers, souris, stockage, câbles, chargeurs, protections et autres accessoires informatiques pour équiper et compléter vos postes de travail.",
        problem: "Un accessoire manquant ou défectueux suffit à bloquer l'utilisation d'un équipement.",
        audience: "Particuliers, professionnels et organisations.",
      },
      {
        slug: "accessoires-photographiques",
        title: "Accessoires photographiques",
        summary: "Accessoires pour la photographie : supports, éclairage, stockage et protection.",
        description: "Accessoires destinés à la photographie : supports, éclairage, cartes mémoire, batteries, protections et autres éléments utiles aux photographes.",
        problem: "Les créateurs ont besoin d'accessoires fiables pour travailler dans de bonnes conditions.",
        audience: "Photographes, créateurs de contenu, organisations et particuliers.",
      },
      {
        slug: "accessoires-audiovisuels",
        title: "Accessoires audiovisuels",
        summary: "Accessoires pour la vidéo, le son et la diffusion.",
        description: "Accessoires audiovisuels pour la captation vidéo, la prise de son, la projection et la diffusion.",
        problem: "La qualité d'une production ou d'une présentation dépend aussi de ses accessoires.",
        audience: "Créateurs de contenu, organisateurs d'événements, écoles, entreprises et institutions.",
      },
      {
        slug: "equipements-consommables",
        title: "Équipements et consommables technologiques",
        summary: "Équipements et consommables pour le fonctionnement quotidien des postes et des bureaux.",
        description: "Équipements et consommables technologiques nécessaires au fonctionnement quotidien des postes de travail et des bureaux.",
        problem: "La rupture d'un consommable ou d'un équipement interrompt le travail.",
        audience: "Entreprises, écoles, institutions et particuliers.",
      },
    ],
  },
  {
    slug: "multimedia",
    title: "Multimédia",
    summary: "Photographie, vidéo, contenus et solutions audiovisuelles pour communiquer et documenter.",
    services: [
      {
        slug: "photographie",
        title: "Photographie",
        summary: "Couverture photographique d'événements, portraits professionnels et images institutionnelles.",
        description: "Couverture photographique d'événements, portraits professionnels, photographies de produits et images institutionnelles, avec traitement et livraison des fichiers.",
        problem: "Des images de qualité sont indispensables pour documenter et valoriser une activité.",
        audience: "Entreprises, institutions, organisateurs d'événements et particuliers.",
      },
      {
        slug: "video",
        title: "Vidéo",
        summary: "Captation, montage et réalisation de vidéos institutionnelles et événementielles.",
        description: "Captation, montage et réalisation de vidéos : événements, présentations institutionnelles, contenus de formation et de communication.",
        problem: "La vidéo est devenue un format essentiel pour communiquer et transmettre.",
        audience: "Entreprises, institutions, écoles, organisations et particuliers.",
      },
      {
        slug: "creation-contenu",
        title: "Création de contenu",
        summary: "Contenus visuels et audiovisuels pour vos supports de communication et réseaux sociaux.",
        description: "Conception et production de contenus visuels et audiovisuels pour vos supports de communication, votre site web et vos réseaux sociaux.",
        problem: "Communiquer régulièrement demande des contenus cohérents et de qualité.",
        audience: "Entreprises, institutions, organisations et professionnels.",
      },
      {
        slug: "solutions-audiovisuelles",
        title: "Solutions audiovisuelles",
        summary: "Mise en place de dispositifs audiovisuels pour salles, événements et présentations.",
        description: "Mise en place et configuration de dispositifs audiovisuels : projection, sonorisation, affichage et diffusion pour les salles, événements et présentations.",
        problem: "Un dispositif audiovisuel défaillant compromet une présentation ou un événement.",
        audience: "Écoles, universités, entreprises, institutions et organisateurs d'événements.",
      },
    ],
  },
  {
    slug: "formation-et-accompagnement",
    title: "Formation et accompagnement",
    summary: "Formations, ateliers et séminaires pour rendre la technologie accessible et utile.",
    services: [
      {
        slug: "formations-informatiques",
        title: "Formations informatiques",
        summary: "Formations aux outils informatiques, adaptées au niveau et aux objectifs des participants.",
        description: "Formations aux outils informatiques et numériques, conçues selon le niveau et les objectifs des participants, pour les individus comme pour les équipes.",
        problem: "Des outils mal maîtrisés limitent la productivité et l'autonomie des utilisateurs.",
        audience: "Particuliers, étudiants, équipes d'entreprises, écoles et institutions.",
      },
      {
        slug: "ateliers-pratiques",
        title: "Ateliers pratiques",
        summary: "Sessions concrètes, orientées vers la manipulation et la mise en situation.",
        description: "Ateliers pratiques centrés sur la manipulation et la mise en situation, pour acquérir rapidement des compétences directement utilisables.",
        problem: "La théorie seule ne suffit pas pour maîtriser un outil ou une technique.",
        audience: "Étudiants, professionnels, écoles, organisations et communautés.",
      },
      {
        slug: "seminaires",
        title: "Séminaires",
        summary: "Séminaires et conférences sur des thèmes technologiques et numériques.",
        description: "Organisation et animation de séminaires et de conférences sur des thèmes technologiques et numériques, pour sensibiliser, informer et partager des connaissances.",
        problem: "Les organisations ont besoin de comprendre les évolutions technologiques pour prendre de bonnes décisions.",
        audience: "Écoles, universités, entreprises, institutions et organisations.",
      },
      {
        slug: "initiation-outils-numeriques",
        title: "Initiation aux outils numériques",
        summary: "Premiers pas avec l'ordinateur, Internet et les outils numériques essentiels.",
        description: "Initiation à l'ordinateur, à Internet, à la messagerie et aux outils numériques essentiels, avec une pédagogie progressive et accessible.",
        problem: "Le manque de bases numériques exclut de nombreuses personnes des opportunités actuelles.",
        audience: "Débutants, jeunes, adultes, communautés et organisations.",
      },
      {
        slug: "accompagnement-technique",
        title: "Accompagnement technique",
        summary: "Suivi dans la durée pour l'adoption et la bonne utilisation de vos outils.",
        description: "Accompagnement technique dans la durée : suivi après installation, conseils, aide à l'adoption des outils et réponse aux questions des utilisateurs.",
        problem: "Après une installation ou une formation, les utilisateurs ont besoin d'un appui pour progresser.",
        audience: "Entreprises, institutions, écoles et organisations.",
      },
    ],
  },
];

async function main() {
  for (const [ci, cat] of catalogue.entries()) {
    const c = await db.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { slug: cat.slug, title: cat.title, summary: cat.summary, order: ci },
    });
    for (const [si, s] of cat.services.entries()) {
      await db.service.upsert({
        where: { slug: s.slug },
        update: {},
        create: { ...s, categoryId: c.id, order: si, published: true },
      });
    }
  }
  console.log(`Catalogue : ${catalogue.length} catégories, ${catalogue.reduce((n, c) => n + c.services.length, 0)} services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
