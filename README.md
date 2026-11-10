# NUTE — Site corporate officiel

> **La technologie, votre mission, notre solution.**

Site corporate de **NUTE (NUTESERVICES)**, entreprise de services technologiques, informatiques et multimédias en Haïti, avec un **CMS d'administration** intégré permettant à l'équipe de gérer tout le contenu sans toucher au code.

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Démarrage rapide](#démarrage-rapide)
3. [Architecture](#architecture)
4. [Administration (CMS)](#administration-cms)
5. [Principes éditoriaux : aucun contenu inventé](#principes-éditoriaux--aucun-contenu-inventé)
6. [Informations à fournir par NUTE](#informations-à-fournir-par-nute)
7. [Sécurité](#sécurité)
8. [SEO](#seo)
9. [Multilingue](#multilingue)
10. [Mise en production](#mise-en-production)

---

## Fonctionnalités

### Site public (français)

| Page | Chemin | Contenu |
|---|---|---|
| Accueil | `/` | Héros, slogan, 6 domaines d'expertise, chiffres clés (vérifiés uniquement), réalisations, activités, équipe, « Pourquoi NUTE », témoignages et partenaires (si autorisés), appel à l'action |
| À propos | `/a-propos` | Présentation, signification de NUTE, histoire, raison d'être, mission, vision, 7 valeurs, approche, engagement |
| Services | `/services`, `/services/[slug]` | 6 catégories, 29 services ; chaque service : description, problème résolu, public, réalisations associées, devis / WhatsApp |
| Réalisations | `/realisations`, `/realisations/[slug]` | Portfolio filtrable (9 catégories), étude de cas complète, avant/après, galerie avec visionneuse, vidéo |
| Interventions | `/interventions`, `/interventions/[slug]` | **Carte interactive d'Haïti** (vectorielle, sans service tiers), liste filtrable, fiches détaillées |
| Activités | `/activites`, `/activites/[slug]` | Événements à venir, **chronologie** par année, rôle de NUTE, galerie, vidéo |
| Équipe | `/equipe`, `/equipe/[slug]` | Profils : fonction, responsabilités, formation, expérience, compétences, certifications |
| Formations | `/formations` | Offre de formation, sessions à venir, formations réalisées, thèmes, demande de formation |
| Actualités | `/actualites`, `/actualites/[slug]` | Articles (Markdown), catégories, auteur, date, partage social |
| Contact | `/contact` | Formulaire validé (serveur), anti-spam, limitation de débit, WhatsApp, carte Google Maps |
| Légal | `/mentions-legales`, `/confidentialite` | Mentions et politique de confidentialité |

### Administration

Tableau de bord, demandes de contact, réalisations, interventions, activités, services, équipe, actualités, témoignages, partenaires, médiathèque, informations de l'entreprise, textes des pages, SEO, traductions, utilisateurs et rôles, journal d'audit.

---

## Démarrage rapide

Prérequis : **Node.js ≥ 20** et **PostgreSQL ≥ 14**.

```bash
npm install
```

```bash
cp .env.example .env
```

Renseignez `DATABASE_URL` dans `.env`, puis :

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
ADMIN_EMAIL=vous@exemple.com ADMIN_PASSWORD='MotDePasseSolide2026' ADMIN_NAME="Votre Nom" npm run admin:create
```

```bash
npm run dev
```

- Site : <http://localhost:3000>
- Administration : <http://localhost:3000/espace-nute> (valeur de `ADMIN_PATH`)

Contenus d'exemple facultatifs (pour visualiser les mises en page, avec badge « Exemple ») :

```bash
npm run db:seed:demo
```

Pour les retirer :

```bash
npm run db:seed:demo -- --remove
```

---

## Architecture

| Couche | Choix |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions), React 19, TypeScript strict |
| Base de données | PostgreSQL via Prisma ORM (`prisma/schema.prisma`) |
| Style | Système de design CSS sur mesure (`src/app/globals.css`) : jetons, grille 12 colonnes, typographie Inter Tight / Inter / IBM Plex Mono |
| Animations | GSAP + ScrollTrigger, chargés à la demande, désactivés avec `prefers-reduced-motion` |
| Images | Ré-encodage WebP par `sharp` au téléversement + miniature, `srcset`, chargement différé |
| Validation | Zod côté serveur pour tous les formulaires |

```
prisma/              schéma, migrations, seed (services vérifiés), seed-demo (exemples)
scripts/             création d'un administrateur
src/app/(site)/      pages publiques
src/app/admin/       administration (servie via ADMIN_PATH, /admin renvoie 404)
src/app/api/cms/     téléversement et liste des médias (authentifiés)
src/app/media/       service sécurisé des fichiers téléversés
src/components/      composants du site et de l'administration
src/lib/             auth, sécurité, paramètres, requêtes, SEO, taxonomies
src/lib/admin/       moteur de contenus déclaratif (resources.ts)
src/i18n/            dictionnaires d'interface (fr de référence)
```

**Moteur de contenus déclaratif** : `src/lib/admin/resources.ts` décrit chaque type de contenu (champs, validation, colonnes). Formulaires, listes et validation serveur sont générés à partir de cette configuration. Pour ajouter un champ : l'ajouter au schéma Prisma, créer une migration, puis le déclarer dans `resources.ts`.

---

## Administration (CMS)

| Rôle | Droits |
|---|---|
| **Administrateur** | Tout, y compris informations de l'entreprise, utilisateurs et journal d'audit |
| **Éditeur** | Contenus, médias, demandes de contact, SEO, traductions |

- **Médiathèque** classée en catégories (logo, équipe, projets, interventions, formations, séminaires, événements, produits, vidéos). Chaque image doit avoir une description ; les médias sans description sont signalés.
- **Galeries** sur les réalisations, interventions et activités, avec photos « avant / après » pour les réalisations.
- **Publication** : brouillon / publié, mise en avant, programmation des articles par date.
- **Tableau de bord** : liste des informations encore manquantes et des contenus d'exemple restants.

---

## Principes éditoriaux : aucun contenu inventé

Le site a été construit pour ne **jamais présenter comme un fait une information non confirmée** :

- Seul le **catalogue de services** fourni par NUTE est pré-rempli. Aucune réalisation, intervention, personne, client, partenaire, témoignage, chiffre ou certification n'a été inventé.
- Les sections sans contenu affichent un **état « En préparation »** sobre plutôt que du faux contenu.
- Les informations inconnues (histoire, signification de « NUTE », adresse, téléphone…) sont **masquées** ou signalées « publication prochaine ».
- Les **chiffres clés** ne s'affichent que s'ils sont cochés « vérifié ».
- Les **témoignages** exigent l'accord de leur auteur, les **partenaires** une autorisation de citer, le **nom d'un client** une autorisation explicite.
- Les **contenus d'exemple** (`isDemo`) portent un badge « Exemple » et une note explicite, sont exclus du sitemap, en `noindex`, et sans données structurées.
- Sans photo réelle, un **emplacement « Photographie à venir »** est affiché, jamais d'image générique.
- **Aucun logo n'a été créé** : le nom est composé typographiquement jusqu'au téléversement du logo officiel (Administration → Entreprise et pages). Le favicon « N » et l'image de partage sont typographiques et provisoires.

---

## Informations à fournir par NUTE

À saisir dans l'administration (le tableau de bord suit l'avancement) :

- [ ] Logo officiel (PNG/WebP) et favicon (`src/app/icon.png`)
- [ ] Téléphone et numéro WhatsApp (active le bouton WhatsApp sur tout le site)
- [ ] Adresse du bureau, ville, département, horaires, carte Google Maps
- [ ] Signification officielle du nom « NUTE »
- [ ] Année de création, histoire de l'entreprise, raisons de sa création
- [ ] Réseaux sociaux
- [ ] Profils de l'équipe (validés par chaque personne)
- [ ] Réalisations documentées, avec photos réelles
- [ ] Lieux d'intervention vérifiés, avec coordonnées GPS
- [ ] Activités, formations et séminaires passés
- [ ] Témoignages et partenaires autorisés
- [ ] Chiffres clés vérifiés
- [ ] Photographie d'en-tête et photos des catégories de services

---

## Sécurité

- **Administration cachée** : servie uniquement sous `ADMIN_PATH` ; `/admin` renvoie 404 ; en-têtes `noindex` et `no-store` ; absente du `robots.txt`.
- **Authentification** : mots de passe bcrypt (coût 12), politique de 12 caractères minimum, sessions en base (jeton aléatoire 256 bits, seul son hachage SHA-256 est stocké), cookie `__Host-` `HttpOnly` `Secure` `SameSite=Lax`, expiration 12 h, révocation lors des changements de mot de passe ou de rôle.
- **Anti-force brute** : limitation par IP et par e-mail (stockée en base), verrouillage du compte 15 min après 5 échecs, messages d'erreur génériques, temps de réponse constant.
- **Contrôle d'accès par rôle** vérifié côté serveur dans chaque page, action et route d'API ; les routes d'API renvoient 404 aux visiteurs non authentifiés.
- **CSRF** : protections natives des Server Actions (vérification d'origine) et contrôle `Origin` sur l'API de téléversement.
- **Téléversements** : type détecté par signature binaire (et non par l'extension), SVG refusés, images ré-encodées (EXIF et géolocalisation supprimés), limites de taille, noms aléatoires, stockage hors du dossier public, service avec `nosniff` et CSP `sandbox`, protection contre la traversée de répertoires.
- **En-têtes** : CSP stricte, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `COOP`.
- **Contenu** : Markdown rendu sans HTML brut, JSON-LD échappé, liens externes isolés (`noopener`).
- **Formulaire de contact** : validation Zod, pot de miel anti-robots, 5 envois par heure et par IP.
- **Journal d'audit** : connexions, échecs, créations, modifications, suppressions, téléversements, avec IP.

---

## SEO

- Métadonnées par page (titre, description, URL canonique, Open Graph, Twitter), modifiables par page dans **Administration → Référencement**.
- `sitemap.xml` dynamique, `robots.txt`.
- Données structurées : `Organization` (+ `LocalBusiness` uniquement lorsque l'adresse est renseignée), `WebSite`, `BreadcrumbList`, `Service`, `CreativeWork` (réalisations), `Event`, `Person`, `NewsArticle`.
- HTML sémantique, textes alternatifs obligatoires, maillage interne (services ↔ réalisations ↔ interventions).

## Accessibilité et performance

- Audit axe-core (WCAG 2 A/AA + bonnes pratiques) : **0 violation** sur les pages testées.
- Navigation clavier complète (menu mobile, visionneuse, carte), lien d'évitement, focus visibles, `prefers-reduced-motion` respecté.
- Aucune police ni script tiers chargé à l'exécution (polices auto-hébergées par `next/font`), JS partagé ≈ 103 ko, GSAP chargé à la demande.
- Aucune largeur de défilement horizontal sur mobile (vérifié sur 15 pages).

## Multilingue

Le **français** est la langue de référence. L'interface repose sur un dictionnaire (`src/i18n/fr.ts`) dont chaque texte peut être traduit en **créole haïtien** et en **anglais** dans **Administration → Traductions** ; une langue sans traduction reprend le français. L'étape suivante consistera à activer un préfixe d'URL par langue (`/ht`, `/en`) et à ajouter des champs traduits aux contenus éditoriaux.

---

## Mise en production

### Avec Docker Compose (serveur ou VPS)

```bash
cp .env.example .env
```

Définissez au minimum `POSTGRES_PASSWORD`, `SITE_URL` et `ADMIN_PATH` dans `.env`, puis :

```bash
docker compose up -d --build
```

```bash
docker compose run --rm tools npm run db:seed
```

```bash
docker compose run --rm -e ADMIN_EMAIL=vous@exemple.com -e ADMIN_PASSWORD='MotDePasseSolide2026' -e ADMIN_NAME="Votre Nom" tools npm run admin:create
```

Placez un proxy HTTPS (Caddy, Nginx, Traefik) devant le port 3000.

### Vercel

Le dépôt contient un `vercel.json` (préréglage **Next.js**) et un script `scripts/vercel-build.sh` qui, à chaque build, **si une base est connectée** :
applique les migrations (via `DATABASE_URL_UNPOOLED` pour Neon), installe le catalogue de services (sans doublon) et crée le compte administrateur s'il n'existe pas encore.

1. **Base de données** : Vercel → Storage → Neon → connectez-la au projet (ajoute `DATABASE_URL` et `DATABASE_URL_UNPOOLED`).
2. **Médias** : Vercel → Storage → **Blob** → connectez-le au projet (ajoute `BLOB_READ_WRITE_TOKEN`). Sans lui, les téléversements échouent : le disque de Vercel n'est pas persistant.
3. **Variables** (Settings → Environment Variables) :
   - `SITE_URL` : adresse publique, ex. `https://nute-pi.vercel.app`
   - `ADMIN_PATH` : chemin secret de l'administration, ex. `espace-nute`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 caractères min., majuscules, minuscules, chiffres), `ADMIN_NAME` : compte créé au premier build. Supprimez `ADMIN_PASSWORD` ensuite et changez le mot de passe dans « Mon compte ».
4. Redéployez.

Limite Vercel : 4,5 Mo par envoi. Les photos plus lourdes sont réduites automatiquement dans le navigateur ; pour les vidéos, publiez-les sur YouTube ou Vimeo et collez le lien.

### Plateformes Node (Render, Railway, Fly.io…)

- Build : `npm ci && npm run build` · Démarrage : `npx prisma migrate deploy && npm start`
- Prévoir un **disque persistant** monté sur `UPLOAD_DIR` (les médias y sont stockés).
- `ADMIN_PATH` et `SITE_URL` doivent être définis **au moment du build**.

### Notifications e-mail

Renseignez `SMTP_*` et `CONTACT_NOTIFY_TO` pour recevoir chaque demande de contact par e-mail (elles sont de toute façon enregistrées dans l'administration).

### Sauvegardes

Sauvegardez régulièrement la base PostgreSQL (`pg_dump`) **et** le dossier `UPLOAD_DIR`.
