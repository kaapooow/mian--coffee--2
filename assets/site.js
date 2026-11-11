// MIAN Coffee, shared script: title reveal, helpers, colour tokens, page grid, menu.
// Loaded by every page before the page's own script (classic script, shared globals).

// ------------------------------------------------------------------ title reveal
// Titles come in letter by letter: each letter slides 20 px in from the left while it goes from
// invisible and 10 px blurred to sharp, about 0.7 s each, 28 ms after the one before.
// Words stay unbroken; screen readers get the plain title through aria-label.
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
function splitTitle(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const walk = node => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 1) { if (n.tagName !== 'BR' && !n.classList.contains('baseline')) walk(n); continue; }
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'tw'; w.setAttribute('aria-hidden', 'true');
        for (const c of part) { const sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = c; w.append(sp); }
        frag.append(w);
      });
      n.replaceWith(frag);
    }
  };
  walk(el);
}
function revealTitle(el, delay = 0) {
  splitTitle(el);
  el.classList.remove('reveal-wait');
  if (REDUCE_MOTION) return;
  el._anims = [...el.querySelectorAll('.ch')].map((c, i) => c.animate(
    [{ opacity: 0, filter: 'blur(10px)', transform: 'translateX(-20px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
    { duration: 700, delay: delay + i * 28, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
}
function hideTitle(el) {                      // ready to play again
  splitTitle(el);
  (el._anims || []).forEach(a => a.cancel()); el._anims = null;
  el.classList.add('reveal-wait');
}
// width of the widest line of a heading (its letters are separate boxes, so group them per line)
function widestLine(el) {
  const rg = document.createRange(); rg.selectNodeContents(el);
  const lines = {};
  for (const r of rg.getClientRects()) {
    if (!r.width) continue;
    const k = Math.round(r.top / 4);
    const l = lines[k] || (lines[k] = [Infinity, -Infinity]);
    l[0] = Math.min(l[0], r.left); l[1] = Math.max(l[1], r.right);
  }
  return Math.max(...Object.values(lines).map(([a, b]) => b - a));
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t),
  io: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};
// keys: [[progress, value, ease?], ...]
function tr(p, keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [p1, v1, e = 'io'] = keys[i], [p0, v0] = keys[i - 1];
    if (p <= p1) return lerp(v0, v1, E[e](clamp((p - p0) / (p1 - p0))));
  }
  return keys[keys.length - 1][1];
}
const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
const rgb = c => `rgb(${c.join(',')})`;

// Page grid. Cells are about 88 px on desktop, smaller on narrow screens (a 16th of the width, 48–88 px),
// with a whole number of cells across both the width and the height of the viewport, so they end up as
// square as possible. Content goes from column 2 to the column before the last; on very wide screens
// more columns stay empty on both sides so the content is never wider than about 1280 px.
// The header is the first row.
const root = document.documentElement;
let PG = {};

const PAD = 24;

const TOKENS = getComputedStyle(document.documentElement);
const tok = name => { const h = TOKENS.getPropertyValue(name).trim().replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };

const header = document.getElementById('header');

function gridCells() {
  const W = innerWidth, H = innerHeight;
  const cols = Math.max(6, Math.round(W / Math.max(48, Math.min(88, W / 16))));
  const gx = W / cols, rows = Math.max(4, Math.round(H / gx)), gy = H / rows;
  const m = Math.max(1, Math.ceil((cols - Math.floor(1280 / gx)) / 2));   // empty columns on each side
  const C = cols - 2 * m;
  PG = { gx, gy, cols, rows, m, C, c0: m * gx, cw: C * gx };
  const px = v => v + 'px';
  root.style.setProperty('--gx', px(gx)); root.style.setProperty('--gy', px(gy));
  root.style.setProperty('--c0', px(PG.c0)); root.style.setProperty('--cw', px(PG.cw));
  root.style.setProperty('--header-h', px(gy));
  return PG;
}
gridCells();
// A title box: whole rows high (title and lead plus 24 px padding), starting at the row under the header,
// from column 2 as many columns wide as the text needs. The text sits 24 px in and is centred in the height.
function headBox(sec, head, hole) {
  const g = PG;
  head.style.height = '';
  const r = contentRect(head);
  const rows = Math.max(1, Math.ceil((r.bottom - r.top + 2 * PAD) / g.gy));
  head.style.height = rows * g.gy + 'px';
  const s = sec.getBoundingClientRect(), h = head.getBoundingClientRect(), rr = contentRect(head);
  const c1 = Math.min(g.m + g.C, Math.max(g.m + 1, Math.ceil((rr.right + PAD - s.left) / g.gx - .02)));
  const top = Math.round((h.top - s.top) / g.gy) * g.gy;
  Object.assign(hole.style, { left: g.c0 + 1 + 'px', top: top + 1 + 'px', width: (c1 - g.m) * g.gx - 1 + 'px', height: rows * g.gy - 1 + 'px' });
  return rows;
}
// clear whole cells around an element's content plus 24 px all round; r = its rect, ox/oy = the grid's origin.
// Stays inside the content columns: from column 2, never into the last column.
function snapHole(hole, r, ox, oy, gx, gy) {
  const l = Math.max(PG.m, Math.floor((r.left - PAD - ox) / gx + .02)) * gx;
  const rr = Math.min(PG.m + PG.C, Math.ceil((r.right + PAD - ox) / gx - .02)) * gx;
  const t = Math.floor((r.top - PAD - oy) / gy + .02) * gy, b = Math.ceil((r.bottom + PAD - oy) / gy - .02) * gy;
  Object.assign(hole.style, { left: l + 1 + 'px', top: t + 1 + 'px', width: rr - l - 1 + 'px', height: b - t - 1 + 'px' });
}
// the area the copy really covers: the text itself and the buttons, not the full width of their blocks
function contentRect(el) {
  const rs = [], rg = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 });
  for (let n; (n = walk.nextNode());) { rg.selectNodeContents(n); rs.push(...rg.getClientRects()); }
  el.querySelectorAll('a, button').forEach(b => rs.push(b.getBoundingClientRect()));
  const v = rs.filter(r => r.width && r.height);
  return { left: Math.min(...v.map(r => r.left)), top: Math.min(...v.map(r => r.top)),
           right: Math.max(...v.map(r => r.right)), bottom: Math.max(...v.map(r => r.bottom)) };
}

// mobile menu: toggle, close on Escape, on link click and when the screen gets wide again
const menuBtn = document.getElementById('menuBtn'), menuLabel = document.getElementById('menuLabel');
function setMenu(open) {
  header.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuLabel.textContent = open ? 'Lukk' : 'Meny';
}
menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('open')));
document.getElementById('nav').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// menu hover: one pale pill that slides to the link under the pointer (or with keyboard focus)
{
  const nav = document.getElementById('nav'), pill = document.getElementById('navPill');
  const links = [...nav.querySelectorAll('a')];
  let cur = null;
  const show = a => {
    if (a === cur) return;
    const first = !pill.classList.contains('on');
    pill.classList.toggle('jump', first);              // first hover: appear in place, no slide in from the left
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop + (a.offsetHeight - 44) / 2}px)`;
    if (first) pill.offsetWidth;                       // commit the position before fading in
    pill.classList.add('on'); pill.classList.remove('jump');
    links.forEach(l => l.classList.toggle('is-hover', l === a && !l.hasAttribute('aria-current')));
    cur = a;
  };
  const hide = () => { pill.classList.remove('on'); links.forEach(l => l.classList.remove('is-hover')); cur = null; };
  links.forEach(a => {
    a.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(a); });
    a.addEventListener('focus', () => { if (a.matches(':focus-visible')) show(a); });
    a.addEventListener('blur', hide);
  });
  nav.addEventListener('pointerleave', hide);

  // selected: the link to the page you are on (the links lead to subpages; '#' = page not built yet)
  links.forEach(a => {
    const here = a.getAttribute('href') !== '#' && a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
    if (here) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}
