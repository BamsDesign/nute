# NUTE — site vitrine

Static site (HTML / CSS / JS), no build step. 3D logo with Three.js, motion with GSAP + ScrollTrigger, smooth scroll with Lenis. All libraries are vendored in `assets/vendor/`, so nothing loads from a CDN except the Inter Tight font and the admin panel.

## Pages
| File | Content |
|---|---|
| `index.html` | Hero 1, Hero 2 "Projet NUTE", Mission, Services, **Accessoires**, **Réalisations** (category filters + counters), **Projet phare (AyitiCommerce)**, **Événements**, **Lieux d'intervention** (map), team teaser, Formation, Contact + social links |
| `equipe.html` | **Notre équipe**: 4 profiles. Click or tap a photo to show the role, name and institution in a glass panel. Click again, click outside or press Esc to close. The panel has a "Voir le profil" link |
| `profil.html?id=<id>` | Full profile page: portrait, name, position, academic background, biography, expertise, links, previous/next member |
| `admin/` | Admin panel (Decap CMS) |

## Deployment (Render)
`render.yaml` deploys the site as a static site, with no build step. **Every push to `main` republishes nute.onrender.com within 1 to 2 minutes.**
- Old Next.js addresses (`/equipe`, `/services`, …) redirect to the new pages.
- The previous Next.js version is kept in the `version-nextjs` branch.
- Render reads `render.yaml` only through a Blueprint. If the existing service was created by hand, set it in the Render dashboard instead: Build Command `echo ok`, Publish Directory `.`.

## Run locally
The pages load `content/*.json` with `fetch`, so open them through a web server, not by double-clicking the file:
```
python3 -m http.server 8080   # → http://localhost:8080
```

## Content (CMS)
All editable content is in `content/`:
- `team.json`: members. **Array order = display order.** `active: false` hides a profile. Fields: name, position, mainExpertise, institution, photo, bio, listLabel, expertise[], links[].
- `site.json`: contact details + social links (Instagram, TikTok, X). A link with an empty URL is hidden.
- `accessoires.json`: products (cameras, Lenovo / HP / MacBook laptops, Samsung / iPhone phones, RJ45 cables) and their photos.
- `realisations.json`: filter categories + completed work (title, category, city, photo). Counters are computed automatically.
- `projets.json`: projet phare (AyitiCommerce): role, description, link, visual.
- `formation.json`: optional intro text + the list of trainings given, with their photos.
- `evenements.json`: events (Deschapelles / Gestion Scolaire, Limonade, Cap-Haïtien) and their photo galleries.
- `lieux.json`: intervention cities + GPS coordinates (used for the map).

### Administration (`/admin`)
Decap CMS lets an administrator add, edit, reorder (drag and drop), activate or deactivate members, upload portraits to `assets/img/team/`, add expertise and links, and edit the Formation text and contact details.
1. The repository is already set in `admin/config.yml` (`BamsDesign/nute`).
2. Login:
   - **Netlify**: use the `git-gateway` backend (commented out in the config) and turn on Identity.
   - **Other hosts (Render, etc.)**: keep `github` and add an OAuth proxy (`base_url`).
   - **Local editing**: run `npx decap-server` at the project root, then open `http://localhost:8080/admin/`.

## 3D logo
`assets/js/logo3d.js` extrudes the **exact path data** of the official NUTE mark (`assets/img/nute-mark-source.svg`) without changing its proportions. The body is satin black, the triangle is satin #F75006, and the scene uses studio lighting. The logo sways slowly and floats, follows the mouse, and moves with scroll (Hero 1 → Hero 2, then fades out).
The fixed fallback `assets/img/nute-logo-3d.png` replaces WebGL in these cases: reduced motion is on, the device has ≤ 2 cores or ≤ 2 GB of memory, data saver is on, or WebGL is not available.

## ⚠️ Pending items (not received)
0. **Accessory photos**: camera, MacBook Air, MacBook Pro, Samsung and iPhone use real product photos stored in `assets/img/uploads/`. "Câbles RJ45" still uses an AI-generated image (Higgsfield CDN); replace it from `/admin → Accessoires`.
0. **Réalisations photos**: none published yet. Every category shows "Photo à ajouter" frames until real photos are added from `/admin → Réalisations`.
1. **The 4 team photos.** They were not among the files received. A neutral placeholder (initials + "Portrait à intégrer") is shown for now. Add the photos from `/admin` (Portrait field) or set the path in `team.json`. 4:5 format recommended, same framing for everyone. Photos automatically get the same treatment (B/W, contrast, orange mark) so the series looks consistent.
2. **Formation.** The section lists the trainings given (`content/formation.json → items`: title, date, description, photos). The first one is "Formation sur l’intelligence artificielle". Add new trainings from `/admin → Formation`.
3. **Contact details.** Add them in `content/site.json`.
4. **Descriptions of services 02 to 06.** Only "Réparation d'ordinateurs" (01) was visible in the current site. The other rows show only the domain name.
