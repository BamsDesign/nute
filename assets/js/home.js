/* =========================================================
   NUTE — home page
   ========================================================= */
import { gsap, ScrollTrigger, initSite, initReveals, initContact, wordScrub, linesHTML, revealLines,
         getTeam, getJSON, portraitHTML, profileURL, esc, pad, reduceMotion, isMobile } from './site.js';
import { createLogoStage } from './logo3d.js';
import { initSections } from './sections.js';

initSite();

/* ---------- 3D logo choreography ---------- */
const stage = createLogoStage(document.getElementById('stage'));
const rig = stage.rig;

const poses = () => isMobile()
  ? { h1: { x: 0, y: 0.0, size: 0.3 }, h2: { x: 0.08, y: -0.02, size: 0.34, rz: 0.3 } }
  : { h1: { x: 0, y: -0.15, size: 0.45 }, h2: { x: 0.2, y: 0.0, size: 0.58, rz: 0.32 } };

let p = poses();
Object.assign(rig, p.h1);

if (!reduceMotion) {
  // Intro: wordmark letters + logo rising behind the glass cards (reference)
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro.from('.hero1__word .ch', { yPercent: 70, opacity: 0, duration: 1.4, stagger: .06 }, .15)
       .from(rig, { y: rig.y - 0.55, opacity: 0, rx: 0.6, duration: 2.2 }, .25)
       .from('.gcard', { y: 80, opacity: 0, duration: 1.3, stagger: .1 }, .55)
       .from('.hero1__scroll', { opacity: 0, duration: 1 }, 1.1);
}

function buildScroll() {
  p = poses();
  // hero1 → hero2: travel, grow, tilt
  gsap.timeline({
    scrollTrigger: { trigger: '.hero2', start: 'top bottom', end: 'top top', scrub: 1, invalidateOnRefresh: true },
  })
    .fromTo(rig, { x: p.h1.x, y: p.h1.y, size: p.h1.size, rz: 0, ry: 0 },
                 { x: p.h2.x, y: p.h2.y, size: p.h2.size, rz: p.h2.rz, ry: Math.PI * 0.18, ease: 'none' }, 0)
    .to('.hero1__word', { yPercent: -40, opacity: 0, ease: 'none' }, 0)
    .to('.hero1__cards', { y: -120, opacity: 0, ease: 'none' }, 0);

  // hero2 → content: lift away and fade
  gsap.timeline({
    scrollTrigger: { trigger: '.hero2', start: 'bottom bottom', end: 'bottom top', scrub: 1 },
  }).fromTo(rig, { y: p.h2.y, opacity: 1, rx: 0 }, { y: 0.45, opacity: 0, rx: -0.5, ease: 'none', immediateRender: false });
}
buildScroll();
ScrollTrigger.addEventListener('refreshInit', () => { p = poses(); });

/* ---------- hero 2 carousel (pagination dots) ---------- */
const slides = [
  { label: 'Atelier',   title: ['Solutions', 'technologiques,', "de l'atelier", 'au terrain'],
    text: "Six domaines d'expertise complémentaires pour répondre aux besoins des particuliers, des entreprises et des institutions." },
  { label: 'Équipe',    title: ['Informatique,', 'réseaux et', 'électronique'],
    text: 'Une équipe pluridisciplinaire : informatique, bases de données, gestion IT, électronique et réseaux informatiques.' },
  { label: 'Formation', title: ['Former et', 'accompagner'],
    text: "Formation et accompagnement : l'un des six domaines d'expertise de NUTE." },
];
const titleEl = document.querySelector('.hero2__title');
const textEl = document.querySelector('.hero2__statement');
const pager = document.querySelector('.hero2__pager');
const list = document.getElementById('h2list');
const count = document.getElementById('h2count');
const moreLinks = ['#services', '#equipe', '#formation'];
let cur = -1, timer;

pager.innerHTML = slides.map((s, i) => `<button class="pager-btn" role="tab" aria-label="${esc(s.label)}">${pad(i + 1)}</button>`).join('');
list.innerHTML = slides.map((s, i) => `<li><span>${esc(s.label)}</span><span>${pad(i + 1)}</span></li>`).join('');

function show(i, animate = true) {
  if (i === cur) return;
  cur = i;
  const s = slides[i];
  const swap = () => {
    titleEl.innerHTML = linesHTML(s.title);
    textEl.textContent = s.text;
    if (animate) {
      revealLines(titleEl);
      gsap.fromTo(textEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', delay: .15 });
    }
  };
  if (animate && titleEl.children.length && !reduceMotion) {
    gsap.to(titleEl.querySelectorAll('.line > span'), { yPercent: -105, duration: .5, stagger: .04, ease: 'expo.in', onComplete: swap });
    gsap.to(textEl, { opacity: 0, duration: .35 });
    gsap.to(rig, { rz: '+=0', ry: `+=${Math.PI * 0.35}`, duration: 1.6, ease: 'expo.inOut' });
  } else swap();
  [...pager.children].forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
  [...list.children].forEach((li, k) => li.classList.toggle('is-on', k === i));
  count.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
  document.getElementById('h2more').href = moreLinks[i];
}
function autoplay() {
  clearInterval(timer);
  if (!reduceMotion) timer = setInterval(() => show((cur + 1) % slides.length), 6500);
}
pager.addEventListener('click', e => {
  const b = e.target.closest('.pager-btn'); if (!b) return;
  show([...pager.children].indexOf(b)); autoplay();
});
show(0, false);
ScrollTrigger.create({ trigger: '.hero2', start: 'top 60%', once: true, onEnter: () => { revealLines(titleEl); autoplay(); } });

/* ---------- mission paragraph ---------- */
document.querySelectorAll('[data-words]').forEach(wordScrub);

/* ---------- team teaser (CMS) ---------- */
getTeam().then(team => {
  document.querySelector('[data-team-intro]').textContent = team.intro || '';
  document.getElementById('teamStrip').innerHTML = team.members.map(m => `
    <a href="${profileURL(m)}" data-reveal>
      ${portraitHTML(m)}
      <span class="meta"><strong>${esc(m.name)}</strong><span>${esc(m.position)}</span></span>
    </a>`).join('');
  initReveals(document.getElementById('equipe'));
  ScrollTrigger.refresh();
}).catch(console.error);

/* ---------- Formation (CMS — source: image « download (2) ») ---------- */
getJSON('formation').then(f => {
  document.querySelector('[data-formation-title]').textContent = f.title || 'Formation';
  if (f.tag) document.querySelector('[data-formation-tag]').textContent = f.tag;
  const body = document.getElementById('formationBody');
  body.innerHTML = f.body && f.body.trim()
    ? `<p class="formation__body">${esc(f.body)}</p>`
    : `<div class="pending" role="note"><strong>Contenu en attente</strong><p>${esc(f.pendingNote || 'Texte Formation à fournir.')}</p></div>`;
}).catch(console.error);

initContact();
initSections();
initReveals();
