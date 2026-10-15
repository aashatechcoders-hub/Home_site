import { initSite, initTilt, onScroll, reducedMotion, finePointer, clamp } from './site.js';
import { bus } from './bus.js';
import { initJourney } from './home/journey.js';
import { createWidgets, initDevMode } from './home/widgets.js';
import { typeHeadline } from './home/typing.js';
import { initInViewFlags, initServices, initEcosystem, initConstellation, initCounters } from './home/sections.js';
import { initWork } from './home/work.js';
import { initContactForm } from './home/contact.js';

const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

function canUseWebGL() {
  if (reducedMotion) return false;
  if (navigator.connection?.saveData) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function worldQuality() {
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const weak = cores <= 4 || memory <= 4;
  const handheld = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  if (handheld) return weak ? 'low' : 'mid';
  return weak ? 'mid' : 'high';
}

/* ---------- Hero: boot line, typed headline, Idea → Engineering → Product ---------- */
async function initHero() {
  const h1 = document.querySelector('[data-type-title]');
  const boot = document.querySelector('[data-hero-boot] .text-dim');
  const flow = [...document.querySelectorAll('[data-hero-flow] li')];
  if (!h1) return;
  await typeHeadline(h1);
  if (boot) boot.textContent = 'v2026.1 · online';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const li of flow) {
    li.classList.add('on');
    if (!reducedMotion) await sleep(420);
  }
}

/* ---------- Journey + 3D world ---------- */
function initStory() {
  const widgets = createWidgets();
  const sceneEl = document.getElementById('scene');
  const canvas = document.getElementById('scene-canvas');
  const labelsRoot = document.getElementById('scene-labels');
  const cta = document.querySelector('[data-cta]');
  let world = null;
  let journey = null;

  if (reducedMotion && cta) cta.style.setProperty('--a', '0.7');

  const sync = (s) => {
    const vh = window.innerHeight;
    let a = 0;
    if (cta && !reducedMotion) {
      const r = cta.getBoundingClientRect();
      a = smoothstep(0, 1, 1 - Math.abs((r.top + r.height / 2 - vh / 2) / vh) * 1.3);
      cta.style.setProperty('--a', a.toFixed(3));
    }
    // Visible through the hero and the journey; fades out after it; returns for the CTA.
    let o = 1;
    if (s.index >= s.count) o = Math.max(1 - s.local * 1.6, a);
    sceneEl?.style.setProperty('--scene-o', o.toFixed(3));
    document.documentElement.classList.toggle('in-journey', s.index >= 0 && s.index < s.count);
    world?.update({ index: s.index, local: s.local, heroP: s.heroP, cta: a, visible: o > 0.01 });
  };

  journey = initJourney({ widgets, onState: sync });

  if (!canUseWebGL() || !canvas) return;
  const load = () =>
    import('./world/world.js')
      .then(({ createWorld }) => {
        world = createWorld({
          canvas,
          labelsRoot,
          quality: worldQuality(),
          stages: journey.keys,
          bus,
          onReady: () => document.documentElement.classList.add('scene-ready'),
        });
        world.setStageHeights(journey.heights);
        new ResizeObserver(() => world.setStageHeights(journey.heights)).observe(document.getElementById('journey'));
        sync(journey);
        onScroll(() => {}); // ensure a first scroll tick after load
      })
      .catch((err) => console.warn('[ATC] 3D world unavailable, using fallback', err));

  // Fonts first (labels are drawn to canvas), then idle time.
  const kick = () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 300));
  (document.fonts?.ready || Promise.resolve()).then(kick);

  if (finePointer) {
    window.addEventListener('pointermove', (e) => {
      world?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
  }
}

function run() {
  initSite();
  const parts = {
    hero: initHero,
    story: initStory,
    devmode: initDevMode,
    inview: initInViewFlags,
    tilt: () => initTilt('[data-tilt]', 6),
    services: initServices,
    ecosystem: initEcosystem,
    constellation: initConstellation,
    work: initWork,
    counters: initCounters,
    contact: initContactForm,
  };
  Object.entries(parts).forEach(([name, fn]) => {
    try {
      const r = fn();
      if (r?.catch) r.catch((err) => console.warn(`[ATC] ${name} failed`, err));
    } catch (err) {
      console.warn(`[ATC] ${name} failed`, err);
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
else run();
