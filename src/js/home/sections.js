import { reducedMotion, clamp, inView } from '../site.js';
import { TECH_DOMAINS } from '../data/tech.js';

// Pause CSS loops in a section while it is offscreen.
export function initInViewFlags() {
  document.querySelectorAll('.services, .tech, .eco').forEach((section) => {
    inView(section, (on) => section.classList.toggle('is-inview', on), { rootMargin: '10% 0px' });
  });
}

/* ---------- Services: Explore toggles the engineering flow ---------- */
export function initServices() {
  document.querySelectorAll('.svc').forEach((card) => {
    const btn = card.querySelector('.svc__explore');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
}

/* ---------- Keyboard support for role=tablist ---------- */
function tablistKeys(tabs, select) {
  tabs.forEach((tab, i) => {
    tab.addEventListener('keydown', (e) => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next = null;
      if (e.key in map) next = (i + map[e.key] + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next);
      tabs[next].focus();
    });
  });
}

/* ---------- What we actually build: orbiting product ecosystem ---------- */
export function initEcosystem() {
  const stage = document.querySelector('[data-eco]');
  const ring = stage?.querySelector('[data-eco-ring]');
  if (!ring) return;
  const items = [...ring.querySelectorAll('[data-eco-item]')];
  const entries = [...document.querySelectorAll('[data-eco-entry]')];
  const step = 360 / items.length;

  const mark = (i) => {
    items.forEach((b, j) => {
      b.setAttribute('aria-pressed', String(j === i));
      b.classList.toggle('is-on', j === i);
    });
    entries.forEach((e, j) => e.classList.toggle('is-on', j === i));
  };
  const select = (i) => {
    mark(i);
    if (reducedMotion) return;
    // Bring the chosen product to the front, taking the shortest way round.
    const current = parseFloat(getComputedStyle(ring).getPropertyValue('--ring')) || 0;
    ring.style.animation = 'none';
    ring.style.setProperty('--ring', `${current}deg`);
    let target = -i * step;
    target += Math.round((current - target) / 360) * 360;
    void ring.offsetWidth;
    ring.classList.add('is-steering');
    ring.style.setProperty('--ring', `${target}deg`);
  };
  items.forEach((b, i) => b.addEventListener('click', () => select(i)));
  // Show the first product's details; the ring keeps orbiting until a click.
  document.documentElement.classList.add('eco-ready');
  mark(0);
}

/* ---------- Technology constellation ---------- */
export function initConstellation() {
  const root = document.querySelector('[data-constellation]');
  const panel = document.getElementById('cn-panel');
  if (!root || !panel) return;

  const tabs = [...root.querySelectorAll('.cn-node')];
  const links = [...root.querySelectorAll('[data-link]')];
  const satsGroup = root.querySelector('[data-sats]');
  const kicker = panel.querySelector('[data-cn-kicker]');
  const title = panel.querySelector('[data-cn-title]');
  const desc = panel.querySelector('[data-cn-desc]');
  const list = panel.querySelector('[data-cn-list]');
  const svgNS = 'http://www.w3.org/2000/svg';
  let active = -1;

  const drawSatellites = (i, count) => {
    satsGroup.replaceChildren();
    const line = links[i];
    const nx = +line.getAttribute('x2');
    const ny = +line.getAttribute('y2');
    const base = Math.atan2(ny - 340, nx - 500);
    const spread = Math.PI * 0.8;
    for (let k = 0; k < count; k++) {
      const a = base - spread / 2 + (spread * (k + 0.5)) / count;
      const sx = nx + Math.cos(a) * 80;
      const sy = ny + Math.sin(a) * 62;
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', nx);
      l.setAttribute('y1', ny);
      l.setAttribute('x2', sx);
      l.setAttribute('y2', sy);
      l.style.animationDelay = `${k * 60}ms`;
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', sx);
      c.setAttribute('cy', sy);
      c.setAttribute('r', 4);
      c.style.animationDelay = `${k * 60 + 80}ms`;
      satsGroup.append(l, c);
    }
  };

  const select = (i) => {
    if (i === active) return;
    active = i;
    const d = TECH_DOMAINS[i];
    tabs.forEach((t, j) => {
      const on = j === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    links.forEach((l, j) => l.classList.toggle('is-active', j === i));
    panel.setAttribute('aria-labelledby', tabs[i].id);
    kicker.textContent = `Domain ${String(i + 1).padStart(2, '0')} / ${String(TECH_DOMAINS.length).padStart(2, '0')}`;
    title.textContent = d.title;
    desc.textContent = d.desc;
    list.replaceChildren(
      ...d.items.map(([name, use], k) => {
        const li = document.createElement('li');
        li.style.setProperty('--i', k);
        const strong = document.createElement('strong');
        strong.textContent = name;
        const span = document.createElement('span');
        span.textContent = use;
        li.append(strong, span);
        return li;
      })
    );
    drawSatellites(i, d.items.length);
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  tablistKeys(tabs, select);
  select(0);
}

/* ---------- Counters (real, ATC-provided numbers only) ---------- */
export function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (reducedMotion) return;
  nums.forEach((el) => {
    const target = +el.dataset.count;
    if (!target) return;
    el.textContent = '0';
    const io = inView(el, (on) => {
      if (!on) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const t = clamp((now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
  });
}
