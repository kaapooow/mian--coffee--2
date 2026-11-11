// Om MIAN: the one module that draws the story page and runs everything that follows the scroll.
// Content comes from om-mian-data.js. Grid, title boxes, title reveal, colour helpers: site.js.
//
// How it runs: layout() measures everything once (on load, resize and when fonts arrive) and caches
// the numbers. update() runs at most once per frame after a scroll, reads only scrollY, and writes
// only custom properties, classes and text. Movement is CSS transitions on transform and opacity.
(() => {
  const D = window.OM_MIAN;
  const main = document.getElementById('main'), klokke = document.getElementById('klokke');
  const reduce = REDUCE_MOTION;
  const ROOT = document.currentScript.dataset.root ?? '../';          // path from the page to the site root
  const light = matchMedia('(max-width: 768px)').matches;             // small screens: stills, not the frame sequence
  const px = v => v + 'px';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // ---------------------------------------------------------------- draw the chapters
  const kap = D.kapitler.map((k, i) => {
    const sec = el('section', `kap kap-${k.id}`);
    sec.id = `kap-${k.id}`;
    sec.setAttribute('aria-labelledby', `tittel-${k.id}`);
    const hole = el('div', 'hole'); hole.setAttribute('aria-hidden', 'true');
    const cont = el('div', 'container');
    const head = el('header', 'kap-head');
    const nr = el('p', 'kap-nr', k.nr); nr.setAttribute('aria-hidden', 'true');
    const h = el(i ? 'h2' : 'h1', '', k.tittel); h.id = `tittel-${k.id}`;
    head.append(nr, h, el('p', 'kap-lead', k.lead));
    cont.append(head); sec.append(hole, cont); main.append(sec);
    return { ...k, sec, hole, cont, head, h, sky: k.himmel.map(tok), top: 0, height: 1 };
  });
  const byId = id => kap.find(k => k.id === id);

  // ---------------------------------------------------------------- 00: the light comes on
  // One big bean in the dark. Scrolling turns the light on, the bean starts to turn, then it shrinks and
  // travels down to land on day 1 of the calendar in chapter 01. Small beans float around it in depth layers.
  const k00 = byId('00');
  const lop0 = el('div', 'k00-lop'), pin0 = el('div', 'k00-pin');
  const scene = el('div', 'k00-scene'); scene.setAttribute('aria-hidden', 'true');
  const BEANS = [                                   // left %, top %, width %, speed (px over the scroll), blur px, rotation, picture
    [14, 8, 5, 150, 3, -30, 1],  [30, -4, 3.5, 90, 4, 60, 2],  [62, 2, 6, 240, 1.5, 40, 2],  [86, 10, 4, 130, 3, -70, 3],
    [96, 34, 9, 420, 0, 15, 3],  [100, 62, 4, 160, 2.5, 100, 1], [88, 84, 7, 300, .5, -20, 1], [64, 96, 3.5, 110, 4, 30, 2],
    [40, 92, 6, 260, 1, 80, 3],  [16, 86, 4, 140, 3, -50, 2],  [2, 66, 8, 380, 0, -65, 2],   [-4, 40, 3.5, 100, 4, 20, 1],
    [6, 24, 6, 230, 1.5, 55, 3], [76, 26, 2.5, 70, 5, -10, 2], [26, 70, 2.5, 80, 5, 140, 1],
  ];
  scene.innerHTML = `
    <div class="k00-lys"></div><div class="k00-glod"></div>
    <div class="k00-bonner">${BEANS.map(([l, t, w, v, b, r, n]) =>
      `<img class="k00-bonne" src="${ROOT}assets/om-mian/bonne-${n}.webp" alt="" draggable="false"
        style="left:${l}%;top:${t}%;width:${w}%;--v:${v};--rot:${r}deg;${b ? `filter:blur(${b}px);` : ''}">`).join('')}</div>`;
  // the big bean: lit picture (the turning sequence on big screens, a still on small ones) with the night picture on top
  const still = light || reduce;
  const stor = el('div', 'k00-stor' + (reduce ? ' fast' : ''), `
    ${still ? `<img class="k00-lag" src="${ROOT}frames/bonne-800/bonne_001.webp" alt="" draggable="false">`
            : `<canvas class="k00-lag" width="800" height="800"></canvas>`}
    <img class="k00-lag k00-natt" src="${ROOT}assets/om-mian/bonne-natt.webp" alt="" draggable="false">`);
  stor.setAttribute('aria-hidden', 'true');
  const P0 = { lys: scene.querySelector('.k00-lys'), glod: scene.querySelector('.k00-glod'), bonner: scene.querySelector('.k00-bonner'),
               natt: stor.querySelector('.k00-natt'), lead: k00.head.querySelector('.kap-lead') };
  // "Se filmen": button in the title box, film in a dialog
  const cta = el('p', 'kap-cta', `<button class="btn btn--morgen" type="button">${D.film.knapp}
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 8 5.5z"/></svg></button>`);
  k00.head.append(cta);
  const film = el('dialog', 'film', `
    <div class="film-topp"><h2 id="filmTittel">${D.film.tittel}</h2><button class="film-lukk" type="button">Lukk</button></div>
    ${D.film.src ? `<video src="${ROOT}${D.film.src}" ${D.film.poster ? `poster="${ROOT}${D.film.poster}"` : ''} controls playsinline preload="none"></video>`
                 : `<div class="film-ph"><p>Filmen kommer her.<br>Plassholder til kortfilmen er klar.</p></div>`}`);
  film.setAttribute('aria-labelledby', 'filmTittel');
  document.body.append(film);
  const video = film.querySelector('video');
  cta.querySelector('button').addEventListener('click', () => { film.showModal(); video && video.play().catch(() => {}); });
  film.querySelector('.film-lukk').addEventListener('click', () => film.close());
  film.addEventListener('click', e => { if (e.target === film) film.close(); });      // click on the backdrop
  film.addEventListener('close', () => video && video.pause());

  pin0.append(k00.hole, scene, k00.cont);
  reduce ? pin0.append(stor) : document.body.append(stor);   // the bean is fixed to the screen so it can travel between the chapters
  lop0.append(pin0);
  k00.sec.append(lop0);
  const S00 = { top: 0, dist: 1, cx: 0, cy: 0, size: 1, frame: -1, last: {} };

  // the turning bean (big screens only): the first frame at once, the rest when the browser is idle
  const N0 = 150, frames0 = [];
  const cv0 = stor.querySelector('canvas'), ctx0 = cv0 ? cv0.getContext('2d') : null;
  function loadFrames() {
    const load = i => { const im = new Image(); im.decoding = 'async'; im.src = `${ROOT}frames/bonne-800/bonne_${String(i + 1).padStart(3, '0')}.webp`;
                        im.onload = () => { frames0[i] = im; if (i === 0 || i === S00.want) { S00.frame = -1; queue(); } }; };
    load(0);
    const rest = () => { for (let i = 1; i < N0; i++) load(i); };
    'requestIdleCallback' in window ? requestIdleCallback(rest, { timeout: 2500 }) : setTimeout(rest, 800);
  }
  function drawFrame(i) {
    S00.want = i;
    while (i > 0 && !frames0[i]) i--;                 // nearest loaded frame before this one
    if (!frames0[i] || i === S00.frame) return;
    S00.frame = i;
    ctx0.clearRect(0, 0, 800, 800); ctx0.drawImage(frames0[i], 0, 0, 800, 800);
  }

  function layout00() {
    const g = PG, stacked = g.C < 12 || innerHeight > innerWidth, head = k00.head;   // narrow or upright: bean under the title
    // title box: wide enough for the longest word pair of the headline at its font-size (7 columns on desktop)
    const fs = parseFloat(getComputedStyle(k00.h).fontSize);
    const headCols = Math.min(g.C, Math.max(4, Math.ceil((fs * 7.6 + 2 * PAD) / g.gx)));
    head.style.width = px(headCols * g.gx); head.style.marginTop = '0px'; P0.lead.style.maxWidth = '';
    let rows0 = headBox(pin0, head, k00.hole), size, cx, cy;
    if (stacked) {
      const free = (g.rows - 1 - rows0 - 1) * g.gy;                       // between the title box and the clock's row
      size = Math.min(innerWidth * 1.3, free * 1.45);
      cx = innerWidth / 2; cy = (1 + rows0) * g.gy + free / 2;
    } else {
      // the picture is a square with air around the bean: the bean itself is about 60 % of it.
      // It sits to the right and reaches in over the title box, so the lead gets a shorter line to make room.
      size = Math.min(g.rows * g.gy, (g.C - headCols + 4) * g.gx);
      cx = (g.m + g.C - 3.2) * g.gx; cy = g.rows * g.gy * .56;
      P0.lead.style.maxWidth = px(Math.max(220, cx - size * .3 - 16 - (g.c0 + PAD)));
      rows0 = headBox(pin0, head, k00.hole);
      if (!reduce) { head.style.marginTop = px(Math.max(0, Math.floor((g.rows - 1 - rows0) / 2) - 1) * g.gy); rows0 = headBox(pin0, head, k00.hole); }
    }
    const box = { left: px(cx - size / 2), top: px(cy - size / 2), width: px(size), height: px(size) };
    Object.assign(scene.style, box); Object.assign(stor.style, box);
    Object.assign(P0.lys.style, { top: px(-(cy - size / 2) - g.gy), height: px(cy + size * .3 + g.gy) });   // from above the screen to below the bean, so no edge shows
    const stageRows = reduce ? Math.max(Math.ceil((cy + size * .36) / g.gy), 1 + rows0) + 1 : g.rows;
    pin0.style.height = px(stageRows * g.gy);
    const dist = reduce ? 0 : Math.round(g.rows * 2.2) * g.gy;
    lop0.style.height = px(stageRows * g.gy + dist);
    Object.assign(S00, { dist, cx, cy, size, last: {} });
  }

  // write an opacity or transform only when it changed
  const set0 = (key, node, prop, val) => { if (S00.last[key] !== val) { S00.last[key] = val; node.style[prop] = val; } };
  function light00(y) {
    if (reduce) { set0('natt', P0.natt, 'opacity', '0'); set0('lys', P0.lys, 'opacity', '1'); set0('glod', P0.glod, 'opacity', '1'); set0('bonner', P0.bonner, 'opacity', '1'); return; }
    const p = clamp((y - S00.top) / S00.dist);
    const lamp = E.io(clamp((p - .05) / .3));                             // the light comes on
    // the journey to day 1: starts while the stage is still pinned, ends exactly when the calendar's stage pins
    const y0 = S00.top + S00.dist * .6, t = clamp((y - y0) / Math.max(1, S01.top - y0)), e = E.io(t);
    const gone = y - (S00.top + S00.dist);                                // how far the opening stage has scrolled away
    const bx = S00.cx, by = S00.cy - Math.max(0, gone);                   // where the big bean belongs right now
    const tx = S01.cx, ty = S01.cy + (S01.top - y);                       // where day 1 is right now
    const sc = lerp(1, S01.cell * .9 / S00.size, e);
    set0('t', stor, 'transform', `translate3d(${(lerp(bx, tx, e) - S00.cx).toFixed(1)}px, ${(lerp(by, ty, e) - S00.cy).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`);
    const landed = y >= S01.top;                                          // from here the bean in the calendar cell takes over
    set0('o', stor, 'opacity', landed ? '0' : '1');
    if (S00.last.landed !== landed) { S00.last.landed = landed; kal.classList.toggle('har-bonne', landed); }
    if (ctx0) drawFrame(Math.round(clamp((y - (S00.top + S00.dist * .3)) / Math.max(1, S01.top - (S00.top + S00.dist * .3))) * (N0 - 1)));
    set0('natt', P0.natt, 'opacity', (1 - lamp).toFixed(3));
    set0('lys', P0.lys, 'opacity', (lamp * (1 - e)).toFixed(3));
    set0('glod', P0.glod, 'opacity', (lamp * (1 - e)).toFixed(3));
    set0('bonner', P0.bonner, 'opacity', clamp((p - .12) / .25).toFixed(3));
    if (S00.last.pv !== p) { S00.last.pv = p; scene.style.setProperty('--p00', p.toFixed(4)); }
  }

  // ---------------------------------------------------------------- 01: the calendar
  const k01 = byId('01');
  const lop = el('div', 'k01-lop'), pin = el('div', 'k01-pin');
  const pinHole = el('div', 'hole'), pinCont = el('div', 'container');
  const kal = el('div', 'kal'); kal.setAttribute('aria-hidden', 'true');
  const merker = new Set(D.milepaeler.map(m => m.dag));
  const dager = Array.from({ length: D.dager }, (_, i) => {
    const d = el('div', 'kal-dag' + (merker.has(i + 1) ? ' merke' : ''), `<i data-n="${i + 1}"></i>`);
    d.dataset.n = i + 1; kal.append(d); return d;
  });
  dager[0].insertAdjacentHTML('beforeend', `<img class="kal-bonne" src="${ROOT}assets/om-mian/bonne-dag1.webp" alt="" draggable="false">`);   // the bean from the opening lands here
  if (reduce) kal.classList.add('har-bonne');
  const teller = el('div', 'teller',
    `<span class="teller-tall">0</span><span class="teller-tekst"><b>av ${D.dager} dager</b><span class="teller-siste"></span></span>`);
  teller.setAttribute('aria-hidden', 'true');           // the headline already says 45 days; the list below has the milestones
  const tall = teller.querySelector('.teller-tall'), siste = teller.querySelector('.teller-siste');
  const lapper = el('ol', 'lapper'); lapper.setAttribute('aria-label', 'Milepæler på veien');
  const lappEls = D.milepaeler.map((m, i) => {
    const li = el('li', 'lapp');
    li.style.setProperty('--r', [-3, 2, -1.5, 3, -2.5, 1.5][i % 6] + 'deg');
    li.innerHTML = (m.bilde ? `<div class="lapp-bilde"><img src="${ROOT}${m.bilde}" alt="" loading="lazy"></div>`
                            : `<div class="lapp-bilde ph" aria-hidden="true">Bilde</div>`) + `<p>${m.tekst}</p>`;
    lapper.append(li); return li;
  });
  pinHole.setAttribute('aria-hidden', 'true');
  pin.append(pinHole, pinCont, kal, teller);
  lop.append(pin);
  const listCont = el('div', 'container');             // holds the notes when they are a list under the stage
  k01.sec.append(lop, listCont);
  const S01 = { top: 0, dist: 1, day: -1, cx: 0, cy: 0, cell: 1 };

  // 45 cells on whole columns and rows. u = cell size in page cells (1, or a half when the screen is low).
  function pickCalendar(maxCols, maxRows, units) {
    for (const u of units) {
      let best = null;
      for (let n = Math.floor(maxCols / u); n >= 3; n--) {
        const r = Math.ceil(D.dager / n);
        if ((n * u) % 1 || (r * u) % 1 || r * u > maxRows) continue;
        const score = (n * r - D.dager) * 10 + Math.abs(n - 9);
        if (!best || score < best.score) best = { u, n, r, score };
      }
      if (best) return best;
    }
    return null;
  }

  function layout01() {
    const g = PG, sec = k01.sec;
    const stacked = g.C < 12;                         // narrow: counter above the calendar, notes as a list below
    const pinRows = g.rows - 2;                       // rows in the pinned stage: not the header row, not the clock's row
    const Lc = stacked ? 0 : 4, cRows = 2;            // counter: 4 columns by 2 rows (full width when stacked)
    const maxCols = stacked ? g.C : g.C - Lc - 1;
    sec.classList.toggle('stablet', stacked);

    // headline inside the pinned stage if the calendar still fits at full cell size, otherwise above it
    let headIn = !stacked && !reduce, headRows = 0, cal = null;
    const placeHead = inside => {
      sec.classList.toggle('hode-ute', !inside);
      if (inside) { pinCont.append(k01.head); k01.hole.style.display = 'none'; pinHole.style.display = ''; }
      else { k01.cont.append(k01.head); k01.hole.style.display = ''; pinHole.style.display = 'none'; }
      return inside ? headBox(pin, k01.head, pinHole) : headBox(sec, k01.head, k01.hole);
    };
    if (headIn) {
      headRows = placeHead(true);
      cal = pickCalendar(maxCols, pinRows - headRows, [1]);
      if (!cal) headIn = false;
    }
    if (!headIn) {
      headRows = placeHead(false);
      cal = pickCalendar(maxCols, pinRows - (stacked ? cRows : 0), [1, .5]) || { u: .5, n: 10, r: 5 };
    }
    const row0 = 1 + (headIn ? headRows : 0);         // first free row in the stage
    const ux = cal.u * g.gx, uy = cal.u * g.gy;

    // counter
    const tw = (stacked ? g.C : Lc) * g.gx, th = cRows * g.gy;
    Object.assign(teller.style, { left: px(g.c0 + 1), top: px(row0 * g.gy + 1), width: px(tw - 1), height: px(th - 1) });
    teller.style.setProperty('--teller-h', px(th));

    // calendar: right-aligned to the last content column on wide screens, under the counter when stacked
    const calCols = cal.n * cal.u, calRows = cal.r * cal.u;
    const calLeft = stacked ? g.m : g.m + g.C - calCols, calTop = row0 + (stacked ? cRows : 0);
    Object.assign(kal.style, { left: px(calLeft * g.gx), top: px(calTop * g.gy) });
    Object.assign(S01, { cx: calLeft * g.gx + ux / 2, cy: calTop * g.gy + uy / 2, cell: Math.min(ux, uy) });   // day 1, in the pinned stage
    kal.style.setProperty('--n', cal.n); kal.style.setProperty('--ux', px(ux)); kal.style.setProperty('--uy', px(uy));

    // notes: a pile under the counter if there is room for at least 2 rows, otherwise a list after the stage
    const rest = (g.rows - 1) - (row0 + cRows);
    const pile = !stacked && !reduce && rest >= 2;
    lapper.classList.toggle('bunke', pile); lapper.classList.toggle('liste', !pile);
    if (pile) {
      pin.append(lapper);
      const lr = Math.min(3, rest), inset = 12;
      Object.assign(lapper.style, { left: px(g.c0 + inset), top: px((row0 + cRows) * g.gy + inset),
                                    width: px(Lc * g.gx - 2 * inset), height: px(lr * g.gy - 2 * inset) });
    } else {
      listCont.append(lapper);                        // after the stage in the DOM
      Object.assign(lapper.style, { left: '', top: '', width: '', height: '' });
      // list cards: whole columns wide (about 440 px), one column of space between them
      lapper.style.setProperty('--lapp-w', px(Math.min(g.C, Math.max(4, Math.round(440 / g.gx))) * g.gx));
    }

    // heights: pinned for about 2.5 screens while the days run; with reduced motion just the stage
    const stageRows = reduce ? Math.max(calTop + calRows, row0 + cRows) + 1 : g.rows;
    pin.style.height = px(stageRows * g.gy);
    const dist = reduce ? 0 : Math.round(g.rows * 2.5) * g.gy;
    lop.style.height = px(stageRows * g.gy + dist);
    S01.dist = dist;
    S01.day = -1;
  }

  function days01(y) {
    const day = reduce ? D.dager : Math.min(D.dager, Math.max(0, Math.floor((y - S01.top) / S01.dist * (D.dager + 3))));
    if (day === S01.day) return;
    S01.day = day;
    dager.forEach((d, i) => d.classList.toggle('pa', i < day));
    tall.textContent = day;
    let last = '';
    D.milepaeler.forEach((m, i) => { const on = day >= m.dag; lappEls[i].classList.toggle('pa', on); if (on) last = m.tekst; });
    siste.textContent = last;
  }

  // ---------------------------------------------------------------- morning: sky, text and line colours
  const LIGHT = tok('--pink-200'), DARK = tok('--brown-800');
  const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };
  let skyKey = '';
  function morning(mid) {
    let k = kap[0];
    for (const c of kap) if (mid >= c.top) k = c;
    const t = clamp((mid - k.top) / k.height), n = k.sky.length - 1;
    const i = Math.min(n - 1, Math.floor(t * n));
    const bg = mix(k.sky[i], k.sky[i + 1], t * n - i);
    const key = bg.join();
    if (key === skyKey) return;
    skyKey = key;
    const day = contrast(bg, DARK) > contrast(bg, LIGHT), fg = day ? DARK : LIGHT;
    root.style.setProperty('--morning-bg', rgb(bg));
    root.style.setProperty('--morning-fg', rgb(fg));
    root.style.setProperty('--morning-line', rgb(mix(bg, fg, .09)));
    document.body.classList.toggle('er-dag', day);
  }

  // ---------------------------------------------------------------- clock
  const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const T0 = mins(D.klokke.start), T1 = mins(D.klokke.slutt);
  let clockText = '';
  function clock(p) {
    const t = Math.round(lerp(T0, T1, p));
    const s = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
    if (s !== clockText) klokke.textContent = clockText = s;
  }

  // ---------------------------------------------------------------- layout and the scroll loop
  let H = innerHeight, maxY = 1, queued = false;
  function layout() {
    const g = gridCells();
    H = innerHeight;
    root.style.setProperty('--vh', px(g.rows * g.gy));
    Object.assign(klokke.style, { left: px((g.m + g.C - 2) * g.gx + 1), top: px((g.rows - 1) * g.gy + 1),
                                  width: px(2 * g.gx - 1), height: px(g.gy - 1), fontSize: px(Math.min(g.gy * .4, g.gx * .5)) });
    for (const k of kap) if (k !== k01 && k !== k00) headBox(k.sec, k.head, k.hole);
    layout00();
    layout01();
    // cache positions (document coordinates) for the scroll loop
    const y = scrollY;
    for (const k of kap) { const r = k.sec.getBoundingClientRect(); k.top = r.top + y; k.height = r.height || 1; }
    S01.top = lop.getBoundingClientRect().top + y;
    S00.top = lop0.getBoundingClientRect().top + y;
    maxY = Math.max(1, document.documentElement.scrollHeight - H);
    update();
  }
  function update() {
    queued = false;
    const y = scrollY;
    morning(y + H / 2);
    clock(clamp(y / maxY));
    light00(y);
    days01(y);
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', layout);
  document.fonts && document.fonts.ready.then(layout);

  // titles fly in letter by letter the first time a chapter comes into view (as on the front page)
  for (const k of kap) hideTitle(k.h);
  if (reduce || !('IntersectionObserver' in window)) kap.forEach(k => revealTitle(k.h));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { revealTitle(e.target); io.unobserve(e.target); }
    }), { threshold: .6 });
    kap.forEach(k => io.observe(k.h));
  }

  if (ctx0) loadFrames();
  layout();
})();
