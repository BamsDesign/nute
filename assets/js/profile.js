/* =========================================================
   NUTE — individual profile page (profil.html?id=<member-id>)
   ========================================================= */
import { gsap, initSite, initReveals, initContact, revealLines,
         getTeam, portraitHTML, profileURL, esc, pad, reduceMotion } from './site.js';

initSite();

const root = document.getElementById('profile');
const nav = document.getElementById('profileNav');
const id = new URLSearchParams(location.search).get('id');

getTeam().then(team => {
  const list = team.members;
  const i = id ? list.findIndex(m => m.id === id) : 0;
  const m = list[i];
  if (!m) {
    root.innerHTML = '<div class="profile__body"><h1 class="profile__name">Profil introuvable</h1><a class="link-arrow" href="equipe.html"><span class="dot"></span>Retour à l’équipe</a></div>';
    return;
  }

  document.title = `${m.name} — ${m.position} — NUTE`;
  const nameParts = m.name.split(/\s+/);
  const nameLines = nameParts.length > 2 ? [nameParts[0], nameParts.slice(1).join(' ')] : nameParts;
  const exp = (m.expertise || []).map(x => `<li>${esc(x)}</li>`).join('');
  const links = (m.links || []).filter(l => l && l.url)
    .map(l => `<a class="cta-pill" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="ico"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10 10 2M4 2h6v6"/></svg></span>${esc(l.label || l.url)}</a>`).join('');

  root.innerHTML = `
    <div class="profile__media">
      ${portraitHTML(m, { eager: true })}
    </div>
    <div class="profile__body">
      <div class="profile__title">
        <a class="tag" href="equipe.html">← Notre équipe</a>
        <span class="tag tag--orange">${pad(i + 1)} / ${pad(list.length)}</span>
      </div>
      <h1 class="profile__name">${nameLines.map(l => `<span class="line"><span>${esc(l)}</span></span>`).join('')}</h1>
      <dl class="profile__grid" data-reveal>
        <dt>Poste</dt><dd>${esc(m.position)}</dd>
        ${m.mainExpertise ? `<dt>Expertise principale</dt><dd>${esc(m.mainExpertise)}</dd>` : ''}
        <dt>Formation académique</dt><dd>${esc(m.institution)}</dd>
      </dl>
      <p class="profile__bio" data-reveal>${esc(m.bio)}</p>
      ${exp ? `<div data-reveal><span class="eyebrow">${esc(m.listLabel || 'Domaines d’expertise')}</span><ul class="profile__list" style="margin-top:12px">${exp}</ul></div>` : ''}
      ${links ? `<div data-reveal><span class="eyebrow">Liens professionnels</span><div class="profile__links" style="margin-top:12px">${links}</div></div>` : ''}
    </div>`;

  if (list.length > 1) {
    const prev = list[(i - 1 + list.length) % list.length];
    const next = list[(i + 1) % list.length];
    nav.innerHTML = `
      <a href="${profileURL(prev)}"><span class="eyebrow">← Précédent</span><strong>${esc(prev.name)}</strong></a>
      <a href="${profileURL(next)}"><span class="eyebrow">Suivant →</span><strong>${esc(next.name)}</strong></a>`;
  }

  revealLines(root.querySelector('.profile__name'), .15);
  if (!reduceMotion) {
    gsap.from(root.querySelector('.profile__media .portrait'), { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut' });
    gsap.from(root.querySelector('.profile__media .portrait > *'), { scale: 1.25, duration: 1.8, ease: 'expo.out' });
  }
  initReveals();
}).catch(err => { console.error(err); root.innerHTML = '<p>Impossible de charger le profil.</p>'; });

initContact();
