# NUTE — Site vitrine officiel

> **La technologie, votre mission, notre solution.**

Site vitrine de **NUTE (NUTESERVICES)**, entreprise de services technologiques, informatiques et multimédias en Haïti.

Le site est **100 % statique** : pas de serveur, pas de base de données, pas d'administration. Il est rapide, gratuit à héberger et ne « s'endort » jamais. Tout le contenu se trouve dans des fichiers du dossier [`src/content/`](src/content).

> La version précédente avec administration (CMS) et base de données est conservée dans la branche `version-cms`.

---

## Pages

| Page | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | Slogan, 6 domaines d'expertise, réalisations, activités, équipe, « Pourquoi NUTE », témoignages et partenaires (si présents) |
| À propos | `/a-propos` | Présentation, signification de NUTE, histoire, mission, vision, valeurs, approche, engagement |
| Services | `/services`, `/services/…` | 6 catégories, 29 services, chacun avec sa page |
| Réalisations | `/realisations`, `/realisations/…` | Portfolio filtrable, étude de cas, photos avant/après, galerie, vidéo |
| Interventions | `/interventions`, `/interventions/…` | Carte interactive d'Haïti et liste des lieux |
| Activités | `/activites`, `/activites/…` | Événements à venir et chronologie |
| Équipe | `/equipe`, `/equipe/…` | Profils professionnels |
| Formations | `/formations` | Offre de formation, sessions à venir et réalisées |
| Actualités | `/actualites`, `/actualites/…` | Articles |
| Contact | `/contact` | Formulaire qui ouvre la messagerie (ou WhatsApp) avec le message déjà rédigé |

Les sections sans contenu affichent un message « En préparation » sobre : **rien n'est inventé**. Seul le catalogue de services est pré-rempli.

---

## Modifier le contenu

Chaque fichier de `src/content/` contient un **exemple commenté** à copier. Après modification, envoyez les changements sur GitHub (branche `main`) : Render republie le site automatiquement en 1 à 2 minutes.

| Fichier | Contenu |
|---|---|
| `entreprise.ts` | Coordonnées (téléphone, WhatsApp, adresse, horaires, réseaux sociaux, carte), logo, textes de l'accueil et de « À propos », chiffres clés |
| `services.ts` | Catalogue des services |
| `realisations.ts` | Projets réalisés |
| `interventions.ts` | Lieux d'intervention (carte d'Haïti) |
| `activites.ts` | Séminaires, formations, conférences, ateliers, visites… |
| `equipe.ts` | Membres de l'équipe |
| `actualites.ts` | Articles |
| `temoignages.ts` | Témoignages (avec l'accord de leur auteur) |
| `partenaires.ts` | Partenaires (avec autorisation) |

**Photos** : placez-les dans `public/images/<rubrique>/` (ex. `public/images/realisations/ecole-x.jpg`) et indiquez leur chemin sans `public` (ex. `"/images/realisations/ecole-x.jpg"`), toujours avec une description (`alt`). Réduisez les photos à environ 2000 px de large avant de les ajouter.

**Vidéos** : publiez-les sur YouTube ou Vimeo et collez le lien dans `videoUrl`.

**Logo** : placez-le dans `public/images/logo.png` et indiquez `logoUrl: "/images/logo.png"` dans `entreprise.ts`. Remplacez aussi `src/app/icon.png` (icône de l'onglet) et `public/og-image.png` (image de partage, 1200 × 630).

**Exemple — ajouter une réalisation** dans `src/content/realisations.ts` :

```ts
export const realisations: ProjectInput[] = [
  {
    slug: "starlink-bureau-petion-ville",
    title: "Installation Starlink pour un bureau",
    category: "starlink",
    summary: "Connexion Internet stable pour une équipe de 12 personnes.",
    location: "Pétion-Ville",
    date: "2026-06-02",
    problem: "…",
    solution: "…",
    results: "…",
    coverUrl: "/images/realisations/starlink-bureau.jpg",
    coverAlt: "Antenne Starlink installée sur le toit du bureau",
    featured: true,
  },
];
```

---

## Développement

Prérequis : **Node.js ≥ 20**.

```bash
npm install
```

```bash
npm run dev
```

Site disponible sur <http://localhost:3000>. Pour produire le site final dans le dossier `out/` :

```bash
npm run build
```

---

## Mise en ligne sur Render

Le fichier `render.yaml` décrit le déploiement (Static Site gratuit, en-têtes de sécurité inclus).

1. Render → **New → Blueprint** → choisissez le dépôt `BamsDesign/nute`.
2. Cliquez sur **Apply**.
3. Une fois l'adresse attribuée connue (ex. `https://nute.onrender.com`), mettez-la dans la variable `SITE_URL` du fichier `render.yaml` (référencement), puis envoyez le changement.

Pour un nom de domaine (ex. `nuteservices.com`) : Render → service → **Settings → Custom Domains**, puis mettez `SITE_URL` à jour.

Le dossier `out/` peut aussi être publié sur n'importe quel hébergeur statique (Netlify, Cloudflare Pages, GitHub Pages…).

---

## Technique

- **Next.js 15** en export statique, React 19, TypeScript strict.
- **Design** : système CSS sur mesure (`src/app/globals.css`), polices auto-hébergées (Inter, Inter Tight, IBM Plex Mono), animations GSAP discrètes désactivées si l'utilisateur préfère réduire les animations.
- **SEO** : titres et descriptions par page, URL canoniques, Open Graph, Twitter, `sitemap.xml`, `robots.txt`, données structurées (`Organization`, `LocalBusiness` lorsque l'adresse est renseignée, `Service`, `Event`, `Person`, `NewsArticle`, fil d'Ariane).
- **Accessibilité** : audit axe-core WCAG 2 A/AA sans violation, navigation au clavier, aucun débordement horizontal sur mobile.
- **Sécurité** : aucun serveur ni donnée stockée ; en-têtes (CSP, HSTS, X-Frame-Options…) définis dans `render.yaml`.
- **Multilingue** : textes d'interface dans `src/i18n/fr.ts`, prêts pour une version créole (`ht`) et anglaise (`en`).

## Informations à fournir par NUTE

- [ ] Logo officiel
- [ ] Téléphone et numéro WhatsApp (active le bouton WhatsApp sur tout le site)
- [ ] Adresse, horaires, carte Google Maps
- [ ] Signification officielle de « NUTE », année de création, histoire
- [ ] Réseaux sociaux
- [ ] Réalisations, lieux d'intervention, activités (avec photos réelles)
- [ ] Profils de l'équipe (validés par chaque personne)
- [ ] Témoignages et partenaires autorisés
