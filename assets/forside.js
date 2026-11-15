// Forside v2, everything the front page does. Shared helpers (grid, tokens, title reveal, menu) come from site.js.
// One scroll loop sets the live colour tokens and the hero's exit; reveals are started by IntersectionObserver;
// calendar hints reveal on scroll; newsletter cells and the bean pile animate in their sections.
// Card surfaces and the intro box reveal with clip-path; their content uses transform and opacity.

// ------------------------------------------------------------------ themes
// bg = page, grid = grid lines, hdr = logo and selected menu item, pill / pillFg = menu items
const T = (bg, grid, hdr, pill, pillFg) => ({ bg, grid, hdr, pill, pillFg });
const C = n => tok(n);
const blend = (a, b, t) => mix(C(a), C(b), t);
const THEMES = {
  'natt':       T(C('--night-950'), blend('--night-950', '--grid-cream', .07), C('--pink-200'), C('--night-900'), C('--pink-200')),
  'gronn':      T(C('--green-900'), blend('--green-900', '--green-100', .07), C('--green-300'), C('--green-950'), C('--green-300')),
  'rosa':       T(C('--pink-300'), blend('--pink-300', '--magenta-600', .22), C('--magenta-600'), blend('--pink-300', '--magenta-500', .2), C('--night-950')),
  'bla':        T(C('--blue-950'), blend('--blue-950', '--blue-100', .07), C('--blue-100'), blend('--blue-950', '--blue-500', .5), C('--blue-100')),
  'oransje':    T(C('--orange-500'), blend('--orange-500', '--orange-900', .1), C('--cream-50'), blend('--orange-500', '--orange-900', .45), C('--cream-50')),
  'natt-gronn': T(C('--night-950'), blend('--night-950', '--green-300', .05), C('--green-100'), C('--green-950'), C('--green-100')),
  'fot':        T(C('--night-950'), C('--night-950'), C('--cream-50'), C('--night-900'), C('--cream-50')),
};
const KEYS = ['bg', 'grid', 'hdr', 'pill', 'pillFg'];
const VARS = { bg: '--bg', grid: '--grid', hdr: '--hdr', pill: '--pill-bg', pillFg: '--pill-fg' };

const secs = [...document.querySelectorAll('.sec')];
const hero = document.querySelector('.hero');
const heroInner = document.getElementById('heroInner');
const heroTittel = document.getElementById('heroTittel');
const heroRad = document.getElementById('heroRad');
const heroPil = document.getElementById('heroPil');
const heroFade = document.querySelector('.hero-fade');
const introBox = document.getElementById('introBox');
const fx = el => getComputedStyle(el);

// ------------------------------------------------------------------ header: cell-by-cell background
// The header has no background of its own until it scrolls in: the grid behind it is cleared one cell at a
// time as section 2 arrives, the same way other backed content blocks out the grid. Each cell's delay is
// picked once (stable), so scrolling back up reverses the reveal without reshuffling.
const headerCeller = document.getElementById('headerCeller');
let headerCells = [];
function layoutHeaderCeller() {
  const g = PG, hh = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || g.gy;
  const cols = Math.max(1, g.C), rows = Math.max(1, Math.round(hh / g.gy));
  if (headerCells.length !== cols * rows) {
    headerCeller.textContent = ''; headerCells = [];
    const f = document.createDocumentFragment();
    for (let i = 0; i < cols * rows; i++) {
      const cell = document.createElement('i'); cell.className = 'h-cel'; f.append(cell);
      headerCells.push({ cell, delay: Math.random() * .7 });
    }
    headerCeller.append(f);
  }
  headerCells.forEach(({ cell }, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    cell.style.cssText = `left:${c * g.gx + 1}px;top:${r * g.gy + 1}px;width:${g.gx - 1}px;height:${g.gy - 1}px`;
  });
}

// ------------------------------------------------------------------ products (six on the front page)
const PRODUKTER = [
  { navn: 'Tjuvstart', tekst: 'Kenya · Nandi County · Medium brent. Sjokolade, sukkerrør og røde bær. 250 gram.', pris: 189, bilde: 'assets/produkter/tjuvstart-250.webp', alt: 'Kaffepose med Tjuvstart, 250 g' },
  { navn: 'Karamell med salt', tekst: 'Håndlaget melkesjokolade med karamell og flaksalt fra Heimdal.', pris: 99, bilde: 'assets/produkter/karamell-salt.webp', alt: 'Pose med saltkaramell fra Heimdal' },
  { navn: 'Drømmestart', tekst: 'Guatemala · Hacienda El Guarsin · Medium brent. Vasket. 250 gram.', pris: 179, bilde: 'assets/produkter/drommestart-250.webp', alt: 'Kaffepose med Drømmestart, 250 g' },
  { navn: 'Tjuvstart Drip', tekst: 'Én kopp, ferdig dosert. 12 g filtermalt Tjuvstart i en drip-pose.', pris: 25, bilde: 'assets/produkter/tjuvstart-drip.webp', alt: 'Tjuvstart drip-pose foran en kopp med drip-filter' },
  { navn: 'Moccabønner', tekst: 'Kaffebønner dyppet i mørk håndverkssjokolade fra Heimdal.', pris: 99, bilde: 'assets/produkter/moccabonner.webp', alt: 'Pose med moccabønner fra Heimdal' },
  { navn: 'Konfekt hjertemix', tekst: 'Blandede konfekthjerter i hvit, lys og mørk sjokolade fra Heimdal.', pris: 99, bilde: 'assets/produkter/konfekt-hjertemix.webp', alt: 'Pose med konfekthjerter fra Heimdal' },
];
const IKON_KURV = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
const IKON_PIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
document.getElementById('kortListe').innerHTML = PRODUKTER.map((p, i) => `
  <li class="pkort" style="--i:${i}">
    <h3>${p.navn}</h3>
    <p class="pk-tekst">${p.tekst}</p>
    <p class="pk-pris">${p.pris} kr</p>
    <div class="pk-bilde">
      <img class="sky sky-v" src="${p.bilde}" alt="" aria-hidden="true" loading="lazy">
      <img class="sky sky-h" src="${p.bilde}" alt="" aria-hidden="true" loading="lazy">
      <img src="${p.bilde}" alt="${p.alt}" loading="lazy">
    </div>
    <div class="pk-knapper">
      <a class="knapp knapp--svart" href="#">${IKON_KURV}Legg i handlekurv</a>
      <a class="knapp knapp--svart rund" href="#" aria-label="Les mer om ${p.navn}"><span class="pk-les-mer">Les mer</span>${IKON_PIL}</a>
    </div>
  </li>`).join('');
document.querySelectorAll('.egenskap').forEach((e, i) => e.style.setProperty('--i', i));

// ------------------------------------------------------------------ layout on the grid
const px = v => v + 'px';
let H = innerHeight, W = innerWidth;

// a box: whole columns wide (from its own left edge), whole rows high, the text 24 px in
function snapBox(box, { full = false } = {}) {
  const g = PG;
  box.style.width = ''; box.style.height = '';
  // Panel children inherit their width from the grid-aligned outer surface.
  if (box.parentElement.classList.contains('kort-panel')) {
    const r = contentRect(box), style = fx(box);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    // Geometry stays on the grid; CSS insets the background, not the container.
    box.style.height = px(Math.ceil((r.bottom - r.top + padding + 1) / g.gy) * g.gy);
    return;
  }
  const b = box.getBoundingClientRect(), r = contentRect(box);
  const maxW = Math.max(g.gx, Math.floor((box.parentElement.getBoundingClientRect().right - b.left) / g.gx + .02) * g.gx);
  const w = full ? maxW : Math.min(maxW, Math.ceil((r.right - b.left + PAD) / g.gx - .02) * g.gx);
  box.style.width = px(w);
  const r2 = contentRect(box);
  box.style.height = px(Math.max(1, Math.ceil((r2.bottom - r2.top + 2 * PAD) / g.gy - .02)) * g.gy);
}

function layoutHero() {
  const g = PG, wide = W >= 1024 || W > H * 1.3;     // landscape phones get the side-by-side row too
  heroRad.classList.toggle('rad', wide);
  hero.style.setProperty('--vh', px(g.rows * g.gy));
  // headline size: as big as the content width allows (the longest line is about 6.3 em), never past 201 px
  let fs = Math.min(201, W >= 640 || wide ? g.cw / 6.35 : g.cw / 3.5);   // three lines like the sketch; phones stack the words, big
  const tTop = Math.max(36, g.gy * .86);                              // no header in the hero: the headline starts near the top
  heroTittel.style.left = px(g.c0); heroTittel.style.top = px(tTop);
  heroTittel.style.width = px(g.cw);
  const lead = heroRad.querySelector('.hero-lead'), cta = heroRad.querySelector('.hero-cta');
  for (let k = 0; k < 30; k++) {
    root.style.setProperty('--hero-fs', px(fs));
    const tb = heroTittel.getBoundingClientRect().height;
    const top = Math.ceil((tTop + tb + fs * .1) / g.gy - .05) * g.gy;      // room for the descenders (line-height .82)
    heroRad.style.left = px(g.c0); heroRad.style.top = px(top);
    // lead box: about half the content columns on wide screens, all of them on narrow ones
    const leadCols = wide ? Math.max(4, Math.min(g.C - 4, Math.round(g.C * .5))) : g.C;
    lead.style.width = px(leadCols * g.gx); lead.style.height = '';
    cta.style.width = ''; cta.style.height = '';
    const lr = contentRect(lead);
    const lh = Math.ceil((lr.bottom - lr.top + 2 * PAD) / g.gy - .02) * g.gy;
    const cr = contentRect(cta);
    const ctaCols = wide ? Math.min(g.C - leadCols, Math.ceil((cr.right - cr.left + 2 * PAD) / g.gx - .02)) : g.C;
    cta.style.width = px(ctaCols * g.gx);
    const cr2 = contentRect(cta);
    const ch = Math.ceil((cr2.bottom - cr2.top + 2 * PAD) / g.gy - .02) * g.gy;
    if (wide) { lead.style.height = cta.style.height = px(Math.max(lh, ch)); }
    else { lead.style.height = px(lh); cta.style.height = px(ch); }
    const rowH = wide ? Math.max(lh, ch) : lh + ch;
    const pilTop = top + rowH, pilC = Math.ceil(44 / g.gx), pilR = Math.ceil(44 / g.gy);   // at least a 44 px tap target
    Object.assign(heroPil.style, { left: px(g.c0), top: px(pilTop), width: px(pilC * g.gx), height: px(pilR * g.gy) });
    heroFade.style.height = px(top);
    if (pilTop + pilR * g.gy <= g.rows * g.gy || fs < 34) break;
    fs *= .93;
  }
  // intro box: 5 columns by 4 rows (fewer on narrow screens), centred on whole cells
  const bc = Math.min(Math.max(5, colsFor(440)), g.cols - 2), br = Math.min(Math.max(4, rowsFor(350)), g.rows - 2);
  const bl = Math.floor((g.cols - bc) / 2) * g.gx, bt = Math.floor((g.rows - br) / 2) * g.gy;
  introBox.style.inset = '0';
  introBox._rect = { l: bl, t: bt, w: bc * g.gx, h: br * g.gy };
  introBox.querySelector('.intro-logo').style.cssText = `position:absolute;left:${bl}px;top:${bt}px;width:${bc * g.gx}px;height:${br * g.gy}px;justify-content:center`;
  if (!introBox._playing) introBox.style.clipPath = insetOf(introBox._rect);
}
const insetOf = r => `inset(${r.t + 1}px ${W - r.l - r.w}px ${H - r.t - r.h}px ${r.l + 1}px)`;

function layoutEgenskaper() {
  const cards = [...document.querySelectorAll('.egenskap')];
  cards.forEach(c => c.style.minHeight = '0');
  const tallest = Math.max(...cards.map(c => c.getBoundingClientRect().height));
  const rows = Math.max(2, Math.ceil(tallest / PG.gy - .02), Math.round(279 / PG.gy));
  cards.forEach(c => c.style.minHeight = '');
  document.getElementById('egenskaper').style.setProperty('--rows-kort', rows);
}

function layout() {
  W = innerWidth; H = innerHeight;
  if (W < 50 || H < 50) return false;          // hidden or not sized yet (e.g. a preview panel): wait for a resize
  gridCells();
  root.style.setProperty('--vh', px(PG.rows * PG.gy));
  root.style.setProperty('--rows-produkt', Math.max(4, Math.round((W < 640 ? 440 : 455) / PG.gy)));
  root.style.setProperty('--sec-bunn', px(rowsFor(72) * PG.gy));      // air under each section, in whole rows
  // section 5 starts a couple of columns in on wide screens, like the sketch
  root.style.setProperty('--fersk-inn', W >= 1024 ? Math.min(2, Math.floor((PG.C - 8) / 2)) : 0);
  root.style.setProperty('--dager-cols', W >= 1024 ? Math.max(4, Math.round(PG.C * 5 / 11)) : PG.C);
  layoutHero();
  // product cards: one column on a phone, two on a tablet, three from desktop, coming in left to right within their row
  const kc = W >= 1024 ? 3 : W >= 640 ? 2 : 1;
  root.style.setProperty('--kort-antall', kc);
  document.querySelectorAll('.pkort').forEach((k, i) => k.style.setProperty('--i', i % kc));
  document.querySelectorAll('.egenskap').forEach((k, i) => k.style.setProperty('--i', W < 768 ? 0 : i));
  layoutEgenskaper();
  document.querySelectorAll('.sec:not(.hero) .box').forEach(b => snapBox(b, { full: b.matches('.nyhet .head, .dager .head, .flere') }));
  // Keep every container on whole rows; inset backgrounds expose the grid.
  document.querySelectorAll('.kort-gruppe').forEach(group => {
    group.style.minHeight = '';
    group.style.minHeight = px(Math.ceil((group.getBoundingClientRect().height + 1) / PG.gy) * PG.gy);
  });
  // sections that stand alone on one screen: the box centred on whole rows
  document.querySelectorAll('.sec.midt').forEach(s => {
    s.style.paddingTop = '';
    const box = s.querySelector('.head'), rows = Math.round(box.getBoundingClientRect().height / PG.gy);
    s.style.paddingTop = px(Math.max(1, Math.floor((PG.rows - rows) / 2)) * PG.gy);
  });
  // every section a whole number of rows high, so the grid lines run on unbroken
  dagerSec.style.height = '';
  secs.forEach(s => {
    if (s === hero) return;
    s.style.minHeight = '';
    const h = s.getBoundingClientRect().height;
    s.style.minHeight = px(Math.ceil(h / PG.gy - .02) * PG.gy);
  });
  layoutHeaderCeller();
  layoutCeller();
  layoutHaug();
  layoutDager();
  measure();
  update();
  return true;
}

// ------------------------------------------------------------------ scroll: colours and hero exit
let tops = [];
function measure() { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); }
const last = {};
function setVar(name, c) { const v = rgb(c); if (last[name] !== v) { root.style.setProperty(name, v); last[name] = v; } }
function update() {
  const y = scrollY;
  // colours: each section blends in while its top travels from 70 % to 25 % of the screen height
  let cur = { ...THEMES[secs[0].dataset.tema] };
  for (let i = 1; i < secs.length; i++) {
    const t = E.io(clamp((y + H * .7 - tops[i]) / (H * .45)));
    if (t <= 0) break;
    const th = THEMES[secs[i].dataset.tema];
    KEYS.forEach(k => cur[k] = mix(cur[k], th[k], t));
  }
  KEYS.forEach(k => setVar(VARS[k], cur[k]));
  root.style.setProperty('--hdr-bg', last['--bg']);
  // Stable scattered cells: scrolling backwards reverses the reveal without reshuffling.
  const start = tops[1] - H * .65;
  const end = tops[1] - PG.gy;
  const progress = clamp((y - start) / Math.max(1, end - start));
  const reveal = REDUCE_MOTION ? (progress > 0 ? 1 : 0) : progress;
  headerCells.forEach(({ cell, delay }) => {
    cell.style.opacity = clamp((reveal - delay) / .28).toFixed(3);
  });
  header.style.setProperty('--header-content', clamp((reveal - .55) / .45).toFixed(3));
  header.classList.toggle('visible', reveal >= .85);
  if (reveal < .85 && header.classList.contains('open')) setMenu(false);
  const fast = y >= end;
  if (fast !== header._fast) { header.classList.toggle('fast', fast); header._fast = fast; }
  // hero on the way out: the headline leaves a little faster than the page, the copy dims,
  // the beans keep their light and each one drifts at its own speed
  if (!REDUCE_MOTION && y < H * 1.3) {
    const p = clamp(y / (H * .42));
    hero.style.setProperty('--tdim', (1 - .85 * p).toFixed(3));
    hero.style.setProperty('--hy', Math.round(y));
    heroTittel.style.transform = `translate3d(0, ${(-y * .26).toFixed(1)}px, 0)`;
  }
}
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
// Re-measure on a real resize only: a phone's browser chrome hiding and showing as you scroll fires a resize
// too, but only the height moves, and nothing (least of all the hero title) should change size from that.
let rz, lastW = innerWidth;
addEventListener('resize', () => {
  if (innerWidth === lastW) return;
  lastW = innerWidth;
  clearTimeout(rz); rz = setTimeout(layout, 120);
});

// ------------------------------------------------------------------ intro
// The logo comes calmly in, in its box in the middle. It glides up and out while the box opens into the
// fade behind the headline. Then the headline comes in letter by letter (the same reveal as every title),
// the beans spread out over it from the middle and start to hover, and lead, buttons and arrow follow.
const ease = 'cubic-bezier(.22, 1, .36, 1)';
function intro() {
  const heroBoxes = [...heroRad.children, heroPil];
  const beans = [...heroTittel.querySelectorAll('.hb')];
  if (REDUCE_MOTION) { introBox.classList.add('ferdig'); return; }
  hideTitle(heroTittel);
  heroBoxes.forEach(el => el.style.opacity = 0);
  beans.forEach(el => el.style.opacity = 0);
  heroFade.style.opacity = 0;
  introBox._playing = true;
  const logo = introBox.querySelector('.intro-logo');
  const r = introBox._rect;
  const T_UT = 1900, T_TITTEL = 2600;
  // 1. the logo arrives, calmly
  [...logo.children].forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
    { duration: 1100, delay: 250 + i * 200, easing: ease, fill: 'both' }));
  // 2. it glides up and out, getting smaller and fainter on the way
  logo.animate([{ opacity: 1, transform: 'none' }, { opacity: .25, offset: .7 }, { opacity: 0, transform: `translateY(${-(r.t + r.h * .5 + 40)}px) scale(.5)` }],
    { duration: 950, delay: T_UT, easing: 'cubic-bezier(.6, 0, .3, 1)', fill: 'forwards' });
  // 3. the box opens into the fade behind the headline
  const fadeH = parseFloat(heroFade.style.height) || H * .6;
  introBox.animate([{ clipPath: insetOf(r) }, { clipPath: `inset(0px 0px ${Math.max(0, H - fadeH)}px 0px)` }],
    { duration: 950, delay: T_UT + 50, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
  heroFade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: T_TITTEL - 100, fill: 'forwards' });
  introBox.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: T_TITTEL + 50, fill: 'forwards' });
  // 4. the headline, letter by letter
  setTimeout(() => revealTitle(heroTittel), T_TITTEL);
  // 5. the beans spread out from the middle of the headline to their places, then hover
  const t = heroTittel.getBoundingClientRect(), cx = t.left + t.width / 2, cy = t.top + t.height / 2;
  beans.forEach((el, i) => {
    const b = el.getBoundingClientRect(), dx = cx - (b.left + b.width / 2), dy = cy - (b.top + b.height / 2);
    el.animate([{ opacity: 0, transform: `translate3d(${dx}px, ${dy}px, 0) scale(.2) rotate(-160deg)` },
                { opacity: 1, offset: .3 },
                { opacity: 1, transform: 'translate3d(0, 0, 0) rotate(var(--r0))' }],
      { duration: 1300, delay: T_TITTEL + 350 + i * 130, easing: 'cubic-bezier(.2, 1.15, .4, 1)', fill: 'backwards' });
    setTimeout(() => el.style.opacity = '', T_TITTEL + 350 + i * 130 + 40);
  });
  // 6. lead, buttons and the arrow
  heroBoxes.forEach((el, i) => {
    el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: T_TITTEL + 500 + i * 130, easing: ease, fill: 'backwards' });
    setTimeout(() => el.style.opacity = '', T_TITTEL + 500 + i * 130 + 40);
  });
  setTimeout(() => { heroFade.style.opacity = ''; introBox._playing = false; introBox.classList.add('ferdig'); }, T_TITTEL + 600);
}

// ------------------------------------------------------------------ reveals
// Each part starts when it is on screen itself (sections can be several screens tall on a phone):
// the title box, the groups under it, and every product card on its own.
const once = (fn, opts) => { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { o.unobserve(e.target); fn(e.target); } }), opts); return o; };
const rise = (els, d0 = 350) => { if (!REDUCE_MOTION) els.forEach((el, i) =>
  el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: d0 + i * 110, easing: ease, fill: 'backwards' })); };
const ioHead = once(head => {
  const s = head.closest('.sec'), t = head.querySelector('.tittel');
  if (s.classList.contains('nyhet')) nyhetInn(); else if (t) revealTitle(t);
  rise([...head.querySelectorAll('.lead, .handlinger, .epost, .liten')].filter(el => !el.matches('.nyhet .epost')));
}, { threshold: .35 });
const ioGroup = once(el => {
  el.classList.add('inne');
  if (el.matches('.egenskaper')) setTimeout(() => el.querySelectorAll('.rom-bonne').forEach(b => b.classList.add('flyter')), 2600);
  if (el.matches('.flere')) rise([...el.children], 100);
}, { threshold: .2 });
// Figma card-stagger-on-load: 100 ms pause, then a 1 s ease-out reveal
// from the bottom edge. Title and body travel an extra 64 / 104 px.
function revealCard(card) {
  card.classList.add('inne');
  if (REDUCE_MOTION) return;
  const timing = { duration: 1000, delay: 100 + Number(fx(card).getPropertyValue('--i')) * 140,
    easing: 'ease-out', fill: 'backwards' };
  const height = card.offsetHeight - 1;
  const animations = [card.animate([
    { opacity: 0, clipPath: 'inset(calc(100% - 1px) 0 0)' },
    { opacity: 1, clipPath: 'inset(0)' },
  ], timing)];
  [...card.children].forEach((child, i) => animations.push(child.animate([
    { opacity: .2, transform: `translateY(${height + (i === 0 ? 64 : 104)}px)` },
    { opacity: 1, transform: 'translateY(0)' },
  ], timing)));
  // Keyboard focus must immediately expose the card's actions.
  const finish = () => animations.forEach(animation => animation.finish());
  card.addEventListener('focusin', finish, { once: true });
  Promise.all(animations.map(animation => animation.finished)).then(() => {
    card.removeEventListener('focusin', finish);
  });
}
const ioKort = once(revealCard, { threshold: .15 });
if (!REDUCE_MOTION) document.querySelectorAll('.sec:not(.hero) .head .tittel').forEach(t => hideTitle(t));
document.querySelectorAll('.sec:not(.hero) .head').forEach(h => ioHead.observe(h));
document.querySelectorAll('.egenskaper, .flere').forEach(g => ioGroup.observe(g));
document.querySelectorAll('.egenskap, .pkort').forEach(k => ioKort.observe(k));
once(() => haugFall(), { threshold: .3 }).observe(document.querySelector('.fot'));

// ------------------------------------------------------------------ 4. calendar positions from Figma 481:15008
const dagerSec = document.querySelector('.dager');
const dagerLag = document.getElementById('dagerCeller');
const DAGER_POSISJONER = [
  [3, 1], [5, 1], [7, 2], [9, 3], [11, 3],
  [7, 5], [8, 5], [10, 5], [7, 6],
  [8, 7], [10, 7], [12, 7], [11, 8],
];
let dagerCeller = [], dagerLayout = '';
function layoutDager() {
  const { gx, gy, cols, m } = PG;
  dagerSec.style.height = '';
  const section = dagerSec.getBoundingClientRect();
  const head = dagerSec.querySelector('.head').getBoundingClientRect();
  const headCols = Math.round(head.width / gx);
  const headTop = Math.round((head.top - section.top) / gy);
  const bottom = Math.round((head.bottom - section.top) / gy);
  const wide = W >= 1024;
  // Anchor the reference's column 1 to the content edge and column 6 to the
  // text box's right edge; the last column remains at the viewport edge.
  const column = c => c <= 6
    ? m + Math.round((c - 1) * headCols / 5)
    : m + headCols + Math.round((c - 6) * (cols - 1 - m - headCols) / 6);
  const chosen = DAGER_POSISJONER.map(([c, r], i) => {
    if (!wide) {
      // On narrow screens the text spans the content width. Keep 1–2 above
      // it and arrange the remaining numbers in fixed rows below it.
      return i < 2
        ? { col: m + Math.round((i + 1) * (PG.C - 1) / 3), row: headTop - 1 }
        : { col: m + (i - 2) % PG.C, row: bottom + Math.floor((i - 2) / PG.C) };
    }
    return { col: column(c), row: r < 7 ? headTop + r - 2 : Math.max(bottom, headTop + 5) + r - 7 };
  });
  const rows = Math.max(...chosen.map(p => p.row)) + 1;
  dagerSec.style.height = px(Math.max(section.height, rows * gy));
  const key = [cols, headTop, bottom, headCols, gx, gy, wide].join(':');
  if (key === dagerLayout) return;
  dagerLayout = key;
  const revealed = new Set(dagerCeller.filter(d => d.el.classList.contains('inne')).map(d => d.day));
  dagerCeller.forEach(({ el }) => ioKort.unobserve(el));
  dagerCeller = chosen.map(({ col, row }, i) => {
    const el = document.createElement('div'), day = i + 1;
    el.className = 'dag-celle';
    el.innerHTML = `<span>${day}</span>`;
    const stagger = chosen.slice(0, i).filter(p => p.row === row).length;
    el.style.cssText = `left:${col * gx + 1}px;top:${row * gy + 1}px;width:${gx - 1}px;height:${gy - 1}px;--i:${stagger}`;
    if (REDUCE_MOTION || revealed.has(day)) el.classList.add('inne');
    return { el, day, row };
  });
  dagerLag.replaceChildren(...dagerCeller.map(d => d.el));
  dagerCeller.forEach(({ el }) => {
    if (!el.classList.contains('inne')) ioKort.observe(el);
  });
}

// ------------------------------------------------------------------ 6. newsletter: lit grid cells, title reveal, opening field
const nyhet = document.querySelector('.nyhet'), celleLag = document.getElementById('nyhetCeller'), skjema = document.getElementById('epost');
let celler = [], cCols = 0, cRows = 0, cx0 = 0, cy0 = 0;
function layoutCeller() {
  // one element per cell, or per block of cells when they are small, so a phone animates a few hundred at most
  const g = PG, h = nyhet.getBoundingClientRect().height || H, step = Math.max(1, Math.round(44 / g.gx));
  cx0 = g.gx * step; cy0 = g.gy * step;
  cCols = Math.ceil(g.cols / step); cRows = Math.ceil(h / cy0);
  if (celler.length !== cCols * cRows) {
    celleLag.textContent = ''; celler = [];
    const f = document.createDocumentFragment();
    for (let r = 0; r < cRows; r++) for (let c = 0; c < cCols; c++) { const d = document.createElement('i'); d.className = 'celle'; f.append(d); celler.push(d); }
    celleLag.append(f);
  }
  celler.forEach((d, i) => { const c = i % cCols, r = Math.floor(i / cCols);
    d.style.cssText = `left:${c * cx0 + 1}px;top:${r * cy0 + 1}px;width:${cx0 - 1}px;height:${cy0 - 1}px`; });
}
function bolge(styrke = .22, fra) {
  if (REDUCE_MOTION) return;
  const s = nyhet.getBoundingClientRect(), f = fra || skjema.getBoundingClientRect();
  const fc = (f.left + f.width / 2 - s.left) / cx0, fr = (f.top + f.height / 2 - s.top) / cy0;
  celler.forEach((d, i) => {
    const c = i % cCols + .5, r = Math.floor(i / cCols) + .5, dist = Math.hypot(c - fc, r - fr);
    d.animate([{ opacity: 0 }, { opacity: styrke * (1 - Math.min(.7, dist / 24)) }, { opacity: 0 }],
      { duration: 900, delay: dist * 55, easing: 'ease-in-out' });
  });
}
function nyhetInn() {
  const t = document.getElementById('nyhetTittel');
  revealTitle(t);
  if (REDUCE_MOTION) return;
  skjema.animate([{ transform: 'scaleX(.09)', opacity: 0 }, { transform: 'scaleX(.09)', opacity: 1, offset: .2 }, { transform: 'scaleX(1.02)', offset: .8 }, { transform: 'scaleX(1)', opacity: 1 }],
    { duration: 1100, delay: 650, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'backwards' });
  skjema.querySelector('input').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1500, fill: 'backwards' });
  setTimeout(() => bolge(.24), 700);
}
// pointer trail: the cell under the pointer lights up and fades
{
  let lastCell = -1;
  if (!REDUCE_MOTION) nyhet.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const s = nyhet.getBoundingClientRect();
    const i = Math.floor((e.clientY - s.top) / cy0) * cCols + Math.floor((e.clientX - s.left) / cx0);
    if (i === lastCell || !celler[i]) return; lastCell = i;
    celler[i].animate([{ opacity: .22 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' });
  });
}
// submit: the arrow flies off and a stronger wave goes out. Success and error states come later.
skjema.addEventListener('submit', e => {
  e.preventDefault();
  skjema.classList.remove('sendt'); void skjema.offsetWidth; skjema.classList.add('sendt');
  bolge(.4);
});

// ------------------------------------------------------------------ 7. footer: a pile of beans falls in
const haug = document.getElementById('haug');
const BONNER = ['bonne-a', 'bonne-b', 'bonne-c', 'bonne-d', 'bonne-e'].map(n => `assets/forside/${n}.webp`);
let haugData = [], haugFalt = false;
function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function layoutHaug() {
  const hw = haug.getBoundingClientRect().width || W, hh = haug.getBoundingClientRect().height || H * .5;
  const n = W < 640 ? 56 : W < 1024 ? 90 : 150, rnd = seeded(7), k = clamp(hw / 1456, .55, 1.2);
  if (haug.children.length !== n) {
    haug.textContent = ''; haugData = [];
    for (let i = 0; i < n; i++) { const im = document.createElement('img'); im.src = BONNER[i % 5]; im.alt = ''; im.decoding = 'async'; haug.append(im); }
  }
  haugData = [];
  for (let i = 0; i < n; i++) {
    const x = (rnd() * 1.08 - .04) * hw;
    const mound = .25 + .55 * Math.pow(Math.sin(Math.PI * clamp(x / hw)), .7) * (.6 + .4 * rnd());   // fuller in the middle
    const up = Math.pow(rnd(), 1.7) * mound * hh;                                                     // most beans near the bottom
    const size = (46 + rnd() * 38) * k * (1 - up / hh * .35);
    haugData.push({ x, y: hh - up - size * .7, size, rot: rnd() * 360, back: up / hh > .45 && rnd() > .5, i });
  }
  haugData.sort((a, b) => a.y - b.y);                     // higher up = further back
  haugData.forEach((d, j) => {
    const im = haug.children[j]; d.el = im;
    im.style.width = px(d.size); im.style.zIndex = j;
    im.style.filter = d.back ? 'brightness(.7) drop-shadow(0 6px 8px rgba(0,0,0,.5))' : '';
    im.style.transform = `translate3d(${d.x - d.size / 2}px, ${d.y}px, 0) rotate(${d.rot}deg)`;
    if (!haugFalt && !REDUCE_MOTION) im.style.opacity = 0;
  });
}
function haugFall() {
  if (haugFalt) return; haugFalt = true;
  if (REDUCE_MOTION) return;
  const hh = haug.getBoundingClientRect().height;
  // the bottom of the pile lands first, the top last, so it builds up
  [...haugData].sort((a, b) => b.y - a.y).forEach((d, j) => {
    const end = `translate3d(${d.x - d.size / 2}px, ${d.y}px, 0) rotate(${d.rot}deg)`;
    const from = `translate3d(${d.x - d.size / 2 + (d.i % 2 ? 30 : -30)}px, ${d.y - hh - 260}px, 0) rotate(${d.rot - 200}deg)`;
    const hop = `translate3d(${d.x - d.size / 2}px, ${d.y - d.size * .35}px, 0) rotate(${d.rot + 12}deg)`;
    d.el.animate([{ transform: from, opacity: 1 }, { transform: end, opacity: 1, offset: .62, easing: 'cubic-bezier(.3, 0, .6, 1)' },
                  { transform: hop, offset: .8, easing: 'ease-out' }, { transform: end, opacity: 1 }],
      { duration: 1000 + (d.i % 5) * 90, delay: j * 16, easing: 'cubic-bezier(.55, 0, 1, .45)', fill: 'backwards' })
      .finished.then(() => d.el.style.opacity = '');
    setTimeout(() => d.el.style.opacity = '', j * 16 + 30);
  });
}
// beans hop out of the way of the pointer
{
  let lastT = 0;
  const fot = document.querySelector('.fot');
  if (!REDUCE_MOTION) fot.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !haugFalt) return;
    const now = performance.now(); if (now - lastT < 40) return; lastT = now;
    const r = haug.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    haugData.forEach(d => {
      const dx = d.x - mx, dy = d.y + d.size / 2 - my, dist = Math.hypot(dx, dy);
      if (dist > 90 || d.el._hop) return;
      d.el._hop = true;
      const push = (90 - dist) / 90, ang = Math.atan2(dy, dx);
      d.el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${Math.cos(ang) * 22 * push}px, ${-Math.abs(Math.sin(ang)) * 26 * push - 8}px) rotate(${dx > 0 ? 14 : -14}deg)` }, { transform: 'translate(0,0)' }],
        { duration: 650, easing: 'cubic-bezier(.3, .7, .4, 1)', composite: 'add' }).finished.then(() => d.el._hop = false);
    });
  });
}

// ------------------------------------------------------------------ go
// start once the window has a real size (a hidden preview panel can report 0 × 0 at first)
(function start() {
  if (!layout()) { requestAnimationFrame(start); return; }
  intro();
})();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
addEventListener('load', () => layout());
