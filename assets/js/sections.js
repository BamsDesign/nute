/* =========================================================
   NUTE — CMS-driven home sections:
   Accessoires · Réalisations · Projet phare · Événements · Lieux
   ========================================================= */
import { gsap, ScrollTrigger, getJSON, esc, pad, initReveals, reduceMotion } from './site.js';

const PHOTO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="5" width="19" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.8"/><path d="M8 5l1.5-2.2h5L16 5"/></svg>';

/** Photo if provided, otherwise a clearly marked empty slot. */
export function slot(src, alt, label = 'Photo à ajouter') {
  return src
    ? `<div class="slot"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>`
    : `<div class="slot"><div class="slot__empty">${PHOTO_ICON}<span>${esc(label)}</span></div></div>`;
}

/* ---------- Accessoires ---------- */
async function accessoires() {
  const d = await getJSON('accessoires');
  const intro = document.querySelector('[data-acc-intro]');
  if (intro) intro.textContent = d.intro || '';
  document.getElementById('accGrid').innerHTML = (d.items || []).map((it, i) => `
    <article class="acc${i === 0 ? ' acc--wide' : ''}" data-reveal>
      ${slot(it.photo, it.name, `Photo ${it.name}`)}
      <div class="acc__meta"><span class="acc__name">${esc(it.name)}</span><span class="eyebrow">${esc(it.group)}</span></div>
    </article>`).join('');
}

/* ---------- Réalisations with category filters ---------- */
async function realisations() {
  const d = await getJSON('realisations');
  const items = d.items || [];
  const cats = d.categories || [];
  const filters = document.getElementById('realFilters');
  const grid = document.getElementById('realGrid');
  const count = c => c ? items.filter(x => x.category === c).length : items.length;

  filters.innerHTML = [['', 'Toutes'], ...cats.map(c => [c, c])].map(([v, l], i) =>
    `<button class="filter" role="tab" type="button" data-cat="${esc(v)}" aria-selected="${i === 0}">${esc(l)} <span class="n">${count(v)}</span></button>`).join('');

  function render(cat) {
    const list = cat ? items.filter(x => x.category === cat) : items;
    if (!list.length) {
      const label = cat || 'toutes catégories';
      grid.innerHTML = `<div class="real-empty">${slot('', '', 'Photo à ajouter')}${slot('', '', 'Photo à ajouter')}${slot('', '', 'Photo à ajouter')}
        <p>Aucune réalisation publiée pour « ${esc(label)} » pour le moment. Les photos s’ajoutent depuis l’administration.</p></div>`;
    } else {
      grid.innerHTML = list.map(x => `
        <article class="real">
          ${slot(x.photo, x.title)}
          <div class="real__meta"><strong>${esc(x.title)}</strong><span>${esc([x.category, x.city].filter(Boolean).join(' · '))}</span></div>
        </article>`).join('');
    }
    if (!reduceMotion) gsap.from(grid.children.length === 1 && grid.firstElementChild.classList.contains('real-empty') ? grid.querySelectorAll('.slot') : grid.children,
      { opacity: 0, y: 24, duration: .7, stagger: .05, ease: 'expo.out' });
    ScrollTrigger.refresh();
  }
  filters.addEventListener('click', e => {
    const b = e.target.closest('.filter'); if (!b) return;
    filters.querySelectorAll('.filter').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    render(b.dataset.cat);
  });
  render('');
}

/* ---------- Projet phare ---------- */
async function flagship() {
  const d = await getJSON('projets');
  const p = (d.items || []).find(x => x.featured) || (d.items || [])[0];
  const el = document.getElementById('flagship');
  if (!p) { el.closest('section').hidden = true; return; }
  const pending = '<span class="pending-inline">À compléter</span>';
  el.innerHTML = `
    <article class="flag" data-reveal>
      <div class="flag__body">
        <div style="display:grid;gap:18px">
          <span class="tag tag--orange" style="background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)">Projet phare</span>
          <h2 class="flag__name">${esc(p.name)}<span>.</span></h2>
          ${p.description ? `<p style="max-width:52ch;color:rgba(255,255,255,.75)">${esc(p.description)}</p>` : ''}
          ${(p.features || []).length ? `<div class="flag__feat">${p.features.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
        </div>
        <div style="display:grid;gap:22px">
          <dl>
            <dt>Rôle</dt><dd>${p.role ? esc(p.role) : p.aboutUrl ? `<a class="u-line" href="${esc(p.aboutUrl)}" target="_blank" rel="noopener">À propos de ${esc(p.name)} ↗</a>` : pending}</dd>
            ${p.mission ? `<dt>Mission</dt><dd>${esc(p.mission)}</dd>` : ''}
            ${p.audience ? `<dt>Pour qui</dt><dd>${esc(p.audience)}</dd>` : ''}
            ${p.plans ? `<dt>Forfaits</dt><dd>${esc(p.plans)}</dd>` : ''}
            <dt>Site</dt><dd>${p.url ? `<a class="u-line" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : pending}</dd>
          </dl>
          <a class="btn btn--light" ${p.url ? `href="${esc(p.url)}" target="_blank" rel="noopener"` : 'aria-disabled="true"'}>Visiter ${esc(p.name)} <span class="ico"><svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="1.6"><path d="M2 10 10 2M4 2h6v6"/></svg></span></a>
        </div>
      </div>
      ${slot(p.image, p.name, `Visuel ${p.name}`)}
    </article>`;
}

/* ---------- Événements ---------- */
async function events() {
  const d = await getJSON('evenements');
  const list = [...(d.items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  document.getElementById('eventsList').innerHTML = list.map((ev, i) => {
    const photos = (ev.photos || []).filter(Boolean);
    // without an Instagram link there is nowhere to see hidden photos, so show them all
    const MAX = ev.instagram ? 8 : Infinity;
    const shown = photos.slice(0, MAX), more = photos.length - shown.length;
    const slots = photos.length
      ? shown.map(src => slot(src, ev.title)).join('')
      : [0, 1, 2].map(() => slot('', '', 'Espace photo')).join('');
    return `
    <article class="event" data-reveal>
      <span class="index">${pad(i + 1)}</span>
      <div class="event__head">
        <h3 class="event__title">${esc(ev.title)}</h3>
        <div class="event__where">
          ${ev.place ? `<span class="tag tag--orange">${esc(ev.place)}</span>` : ''}
          ${ev.city ? `<span class="tag">${esc(ev.city)}</span>` : ''}
          ${ev.region ? `<span class="tag">${esc(ev.region)}</span>` : ''}
          ${ev.date ? `<span class="tag">${esc(ev.date)}</span>` : ''}
        </div>
        ${ev.description ? `<p class="event__desc">${esc(ev.description)}</p>` : ''}
      </div>
      <div class="event__photos" style="--n:${Math.min(Math.max(shown.length, 3), 4)}">${slots}</div>
      ${ev.instagram ? `<a class="link-arrow event__ig" href="${esc(ev.instagram)}" target="_blank" rel="noopener"><span class="dot"></span>${more > 0 ? `Voir les ${more} autres photos sur Instagram` : 'Voir sur Instagram'}</a>` : ''}
    </article>`;
  }).join('');
}

/* ---------- Lieux d'intervention (map plotted from real coordinates) ---------- */
async function places() {
  const d = await getJSON('lieux');
  const items = d.items || [];
  const listEl = document.getElementById('placesList');
  const mapEl = document.getElementById('placesMap');
  const fmt = (v, p, n) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? p : n}`;
  listEl.innerHTML = items.map((p, i) => `
    <li data-i="${i}"><span class="index">${pad(i + 1)}</span><span class="city">${esc(p.city)}</span><span class="coord">${fmt(p.lat, 'N', 'S')} ${fmt(p.lng, 'E', 'O')}</span></li>`).join('');

  // Equirectangular projection on a padded bounding box
  const W = 600, H = 480, padX = 90, padY = 70;
  const lats = items.map(p => p.lat), lngs = items.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const kx = (W - padX * 2) / Math.max(maxLng - minLng, .01), ky = (H - padY * 2) / Math.max(maxLat - minLat, .01);
  const k = Math.min(kx, ky);
  const ox = (W - (maxLng - minLng) * k) / 2, oy = (H - (maxLat - minLat) * k) / 2;
  const X = lng => ox + (lng - minLng) * k, Y = lat => H - (oy + (lat - minLat) * k);
  const pts = items.map(p => ({ ...p, x: X(p.lng), y: Y(p.lat) }));
  const grid = [];
  for (let gx = 0; gx <= W; gx += 40) grid.push(`<line x1="${gx}" y1="0" x2="${gx}" y2="${H}"/>`);
  for (let gy = 0; gy <= H; gy += 40) grid.push(`<line x1="0" y1="${gy}" x2="${W}" y2="${gy}"/>`);
  const path = [...pts].sort((a, b) => b.lat - a.lat); // north → south
  const links = path.slice(1).map((p, i) => `<line x1="${path[i].x}" y1="${path[i].y}" x2="${p.x}" y2="${p.y}"/>`).join('');
  mapEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
    <g stroke="rgba(0,0,0,.06)" stroke-width="1">${grid.join('')}</g>
    <g class="links" stroke="#000" stroke-width="1" stroke-dasharray="3 5" opacity=".35">${links}</g>
    ${pts.map((p, i) => `<g class="pin" data-i="${i}">
      <circle class="ring" cx="${p.x}" cy="${p.y}" r="18" fill="rgba(247,80,6,.14)"/>
      <circle class="pt" cx="${p.x}" cy="${p.y}" r="6" fill="#F75006"/>
      <text class="lbl" x="${p.x + 14}" y="${p.y + 4}">${esc(p.city)}</text></g>`).join('')}
    <text x="20" y="${H - 20}" font-size="11" fill="rgba(0,0,0,.45)" font-family="ui-monospace,monospace">HAÏTI — ${items.length} LIEUX</text>
  </svg>`;

  const setOn = i => {
    listEl.querySelectorAll('li').forEach(li => li.classList.toggle('is-on', li.dataset.i === String(i)));
    mapEl.querySelectorAll('.pin').forEach(g => g.classList.toggle('is-on', g.dataset.i === String(i)));
  };
  listEl.addEventListener('pointerover', e => { const li = e.target.closest('li'); if (li) setOn(li.dataset.i); });
  listEl.addEventListener('pointerleave', () => setOn(-1));

  if (!reduceMotion) {
    gsap.from(mapEl.querySelectorAll('.pt'), { attr: { r: 0 }, duration: .8, stagger: .12, ease: 'back.out(3)',
      scrollTrigger: { trigger: mapEl, start: 'top 75%', once: true } });
    const ls = mapEl.querySelector('.links');
    gsap.from(ls, { opacity: 0, duration: 1.2, scrollTrigger: { trigger: mapEl, start: 'top 70%', once: true } });
  }
}

export async function initSections() {
  await Promise.allSettled([accessoires(), realisations(), flagship(), events(), places()])
    .then(r => r.forEach(x => x.status === 'rejected' && console.error(x.reason)));
  initReveals();
  ScrollTrigger.refresh();
}
