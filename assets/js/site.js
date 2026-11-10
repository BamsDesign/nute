/* =========================================================
   NUTE — shared behaviour (all pages)
   ========================================================= */
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => matchMedia('(max-width: 760px)').matches;

/* ---------- content (CMS-managed JSON files in /content) ---------- */
const cache = {};
export async function getJSON(name) {
  if (!cache[name]) {
    cache[name] = fetch(`content/${name}.json`, { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error(`content/${name}.json: ${r.status}`);
      return r.json();
    });
  }
  return cache[name];
}
export async function getTeam() {
  const data = await getJSON('team');
  data.members = (data.members || []).filter(m => m && m.active !== false);
  return data;
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pad = n => String(n).padStart(2, '0');
export const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

/** Portrait: uploaded photo, or a clearly marked placeholder until the photo is provided. */
export function portraitHTML(m, { eager = false } = {}) {
  if (m.photo) {
    return `<div class="portrait"><img src="${esc(m.photo)}" alt="Portrait de ${esc(m.name)}" ${eager ? '' : 'loading="lazy"'} decoding="async"></div>`;
  }
  return `<div class="portrait"><div class="portrait__ph" role="img" aria-label="Portrait de ${esc(m.name)} (à venir)"><small>Portrait à intégrer</small><b>${esc(initials(m.name))}</b></div></div>`;
}
export const profileURL = m => `profil.html?id=${encodeURIComponent(m.id)}`;

/* ---------- smooth scroll (Lenis) synced with ScrollTrigger ---------- */
export let lenis = null;
function initScroll() {
  if (reduceMotion || !window.Lenis) return;
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname) return;
    const target = url.hash.length > 1 && document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    lenis.scrollTo(url.hash === '#top' ? 0 : target, { offset: 0 });
  });
}

/* ---------- menu overlay ---------- */
let menuOpen = false;
const menuEl = () => document.getElementById('menu');
const menuBtn = () => document.querySelector('.nav-pill__menu');
export function openMenu() {
  const m = menuEl(); if (!m || menuOpen) return;
  menuOpen = true;
  document.body.classList.add('is-menu-open');
  menuBtn().setAttribute('aria-expanded', 'true');
  m.setAttribute('aria-hidden', 'false');
  lenis && lenis.stop();
  gsap.killTweensOf(m);
  gsap.set(m, { visibility: 'visible' });
  gsap.to(m, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' });
  gsap.fromTo(m.querySelectorAll('.menu__list a span'), { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .35 });
  gsap.fromTo(m.querySelector('.menu__foot'), { opacity: 0 }, { opacity: 1, duration: .6, delay: .6 });
}
export function closeMenu() {
  const m = menuEl(); if (!m || !menuOpen) return;
  menuOpen = false;
  document.body.classList.remove('is-menu-open');
  menuBtn().setAttribute('aria-expanded', 'false');
  m.setAttribute('aria-hidden', 'true');
  lenis && lenis.start();
  gsap.to(m, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'expo.inOut', onComplete: () => gsap.set(m, { visibility: 'hidden' }) });
}
function initMenu() {
  const b = menuBtn(); if (!b) return;
  b.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  menuEl().addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  // mark current page
  const here = location.pathname.split('/').pop() || 'index.html';
  menuEl().querySelectorAll('a').forEach(a => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
}

/* ---------- reveals ---------- */
export function initReveals(scope = document) {
  const els = [...scope.querySelectorAll('[data-reveal]:not([data-revealed])')];
  els.forEach(el => el.setAttribute('data-revealed', ''));
  if (reduceMotion) { gsap.set(els, { opacity: 1 }); return; }
  gsap.set(els, { opacity: 0, y: 36 });
  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08 }),
  });
}

/** Word-by-word scrubbed reveal (reference: mission paragraph). */
export function wordScrub(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
  if (reduceMotion) return;
  gsap.fromTo(el.querySelectorAll('.w'), { opacity: .14 }, {
    opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
}

/** Wrap a heading's lines for a mask-up reveal. */
export function linesHTML(lines) {
  return lines.map(l => `<span class="line"><span>${esc(l)}</span></span>`).join('');
}
export function revealLines(el, delay = 0) {
  const spans = el.querySelectorAll('.line > span');
  if (reduceMotion) return gsap.set(spans, { yPercent: 0 });
  return gsap.fromTo(spans, { yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: .08, ease: 'expo.out', delay });
}

function initHeaderState() {
  const h = document.querySelector('.site-header'); if (!h) return;
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    h.classList.toggle('is-scrolled', y > 40);
    h.classList.toggle('is-hidden', y > 300 && y > last + 2);
    if (y < last - 2) h.classList.remove('is-hidden');
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function initSite() {
  initScroll();
  initHeaderState();
  initMenu();
  document.querySelectorAll('[data-year]').forEach(n => (n.textContent = new Date().getFullYear()));
  // header entrance
  if (!reduceMotion) {
    gsap.from('.site-header > *', { y: -24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, delay: .1 });
  }
}

export async function initContact() {
  const list = document.getElementById('contactList') || document.createElement('div');
  try {
    const s = await getJSON('site');
    const rows = [];
    if (s.contactEmail) rows.push(`<a class="u-line" href="mailto:${esc(s.contactEmail)}">${esc(s.contactEmail)}</a>`);
    if (s.contactPhone) rows.push(`<a class="u-line" href="tel:${esc(s.contactPhone.replace(/\s/g, ''))}">${esc(s.contactPhone)}</a>`);
    if (s.address) rows.push(`<span>${esc(s.address)}</span>`);
    list.innerHTML = rows.join('');
    const social = (s.social || []).filter(x => x && x.url)
      .map(x => `<a class="u-line" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.network)}</a>`).join('');
    document.querySelectorAll('[data-social]').forEach(n => (n.innerHTML = social));
    const btn = document.getElementById('contactBtn');
    if (btn && s.contactEmail) btn.href = `mailto:${s.contactEmail}`;
  } catch (e) { console.warn(e); }
}

export { gsap, ScrollTrigger };
