/* =========================================================
   NUTE — Notre équipe
   Click / tap a portrait → frosted-glass panel reveals the role,
   name and institution. Click again, click outside or Esc closes.
   ========================================================= */
import { gsap, ScrollTrigger, initSite, initReveals, initContact, revealLines,
         getTeam, portraitHTML, profileURL, esc, pad, reduceMotion, isMobile } from './site.js';
import { createLogoStage } from './logo3d.js';

initSite();

/* 3D logo in the hero (right side), lifts away on scroll */
const { rig } = createLogoStage(document.getElementById('stage'));
const pose = () => isMobile() ? { x: 0.16, y: 0.02, size: 0.3 } : { x: 0.25, y: 0.04, size: 0.5 };
Object.assign(rig, pose(), { rz: 0.28 });
if (!reduceMotion) gsap.from(rig, { y: -0.6, opacity: 0, rx: 0.6, duration: 2.2, ease: 'expo.out', delay: .2 });
gsap.timeline({ scrollTrigger: { trigger: '.team-hero', start: 'top top', end: 'bottom top', scrub: 1 } })
  .fromTo(rig, { y: pose().y, opacity: 1, rx: 0 }, { y: 0.5, opacity: 0, rx: -0.5, ease: 'none', immediateRender: false });

revealLines(document.getElementById('teamTitle'), .2);

const grid = document.getElementById('teamGrid');

function cardHTML(m, i) {
  const list = (m.expertise || []).map(x => `<li>${esc(x)}</li>`).join('');
  return `
  <article class="tm" data-reveal data-id="${esc(m.id)}">
    <div class="tm__media">
    <button class="tm__photo" type="button" aria-expanded="false" aria-controls="reveal-${esc(m.id)}" aria-label="Afficher le rôle de ${esc(m.name)}">
      ${portraitHTML(m)}
      <span class="tm__hint" aria-hidden="true"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 0v10M0 5h10"/></svg></span>
    </button>
    <div class="tm__reveal glass" id="reveal-${esc(m.id)}" role="region" aria-label="Rôle de ${esc(m.name)}">
      <span class="index">${pad(i + 1)} — Rôle</span>
      <span class="role">${esc(m.position)}</span>
      <span class="who">${esc(m.name)}</span>
      <span class="inst">${esc(m.institution)}</span>
      <a class="link-arrow" href="${profileURL(m)}"><span class="dot"></span>Voir le profil</a>
    </div>
    </div>
    <div class="tm__head">
      <span class="index">${pad(i + 1)}</span>
      <h2 class="tm__name">${esc(m.name)}</h2>
      <span class="tm__pos">${esc(m.position)}</span>
      <span class="tm__inst">${esc(m.institution)}</span>
    </div>
    <p class="tm__bio">${esc(m.bio)}</p>
    ${list ? `<div><span class="eyebrow">${esc(m.listLabel || 'Domaines d’expertise')}</span><ul class="tm__exp" style="margin-top:8px">${list}</ul></div>` : ''}
    <a class="link-arrow" href="${profileURL(m)}"><span class="dot"></span>Voir le profil</a>
  </article>`;
}

/* ---------- reveal panel ---------- */
let openCard = null;
function panelOf(card) { return card.querySelector('.tm__reveal'); }

function open(card) {
  if (openCard && openCard !== card) close(openCard);
  openCard = card;
  card.classList.add('is-open');
  const btn = card.querySelector('.tm__photo');
  btn.setAttribute('aria-expanded', 'true');
  btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Afficher', 'Masquer'));
  const panel = panelOf(card);
  gsap.killTweensOf(panel);
  gsap.set(panel, { visibility: 'visible' });
  gsap.to(panel, { opacity: 1, y: 0, duration: reduceMotion ? 0 : .7, ease: 'expo.out' });
  if (!reduceMotion) gsap.fromTo(panel.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, stagger: .05, ease: 'expo.out', delay: .1 });
  card.querySelector('.portrait img, .portrait__ph') && gsap.to(card.querySelector('.portrait img, .portrait__ph'), { scale: 1.06, duration: 1.2, ease: 'expo.out' });
}
function close(card) {
  if (!card) return;
  card.classList.remove('is-open');
  const btn = card.querySelector('.tm__photo');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Masquer', 'Afficher'));
  const panel = panelOf(card);
  gsap.killTweensOf(panel);
  gsap.to(panel, { opacity: 0, y: 24, duration: reduceMotion ? 0 : .45, ease: 'expo.in', onComplete: () => gsap.set(panel, { visibility: 'hidden' }) });
  const img = card.querySelector('.portrait img, .portrait__ph');
  img && gsap.to(img, { scale: 1, duration: .8, ease: 'expo.out' });
  if (openCard === card) openCard = null;
}

grid.addEventListener('click', e => {
  const btn = e.target.closest('.tm__photo');
  if (!btn) return;
  const card = btn.closest('.tm');
  card.classList.contains('is-open') ? close(card) : open(card);
});
document.addEventListener('click', e => {
  if (openCard && !openCard.contains(e.target)) close(openCard);
});
addEventListener('keydown', e => {
  if (e.key === 'Escape' && openCard) {
    const btn = openCard.querySelector('.tm__photo');
    close(openCard);
    btn.focus();
  }
});

/* ---------- render ---------- */
getTeam().then(team => {
  document.querySelector('[data-team-intro]').textContent = team.intro || '';
  document.getElementById('teamCount').textContent = `${pad(team.members.length)} membres`;
  grid.innerHTML = team.members.map(cardHTML).join('');
  gsap.set(grid.querySelectorAll('.tm__reveal'), { visibility: 'hidden', opacity: 0, y: 24 });
  initReveals();
  ScrollTrigger.refresh();
}).catch(err => {
  console.error(err);
  grid.innerHTML = '<p>Impossible de charger l’équipe.</p>';
});

initContact();
