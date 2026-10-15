// The engineering journey: turns scroll position into { index, local } — which
// stage the visitor is in and how far through it — and shares that with the
// 3D world, the stage rail and each stage's widget.
import { onScroll, clamp } from '../site.js';
import { decode } from './typing.js';

export const STAGE_NAMES = [
  'Discovery', 'Architecture', 'UI/UX', 'Development', 'Database', 'API', 'Testing', 'Git',
  'CI/CD', 'Docker', 'Linux', 'Cloud', 'Deployment', 'Monitoring', 'Security', 'Scale',
];

export function initJourney({ widgets = {}, onState } = {}) {
  const section = document.getElementById('journey');
  if (!section) return null;
  const stages = [...section.querySelectorAll('.stage')];
  const keys = stages.map((s) => s.dataset.stage);
  const rail = document.querySelector('[data-rail]');
  const railLinks = rail ? [...rail.querySelectorAll('a')] : [];
  const railN = rail?.querySelector('[data-rail-n]');
  const railName = rail?.querySelector('[data-rail-name]');

  stages.forEach((s) => s.style.setProperty('--len', s.dataset.len || 1));

  let metrics = [];
  const state = { index: -1, local: 0, heroP: 0, count: stages.length, keys, heights: [] };
  const measure = () => {
    const y = window.scrollY;
    metrics = stages.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + y, h: r.height };
    });
    state.heights = metrics.map((m) => m.h / window.innerHeight);
  };
  measure();
  new ResizeObserver(() => {
    measure();
    update(window.scrollY);
  }).observe(section);

  let active = -1;

  function setActive(i) {
    if (i === active) return;
    const prev = keys[active];
    if (prev) widgets[prev]?.leave?.();
    active = i;
    stages.forEach((s, j) => s.classList.toggle('is-active', j === i));
    if (i >= 0) {
      const el = stages[i];
      const title = el.querySelector('[data-decode]');
      if (title) decode(title);
      widgets[keys[i]]?.enter?.();
    }
    railLinks.forEach((a, j) => {
      a.classList.toggle('is-done', j < i);
      if (j === i) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    if (railN && i >= 0) railN.textContent = String(i + 1).padStart(2, '0');
    if (railName && i >= 0) railName.textContent = STAGE_NAMES[i];
  }

  function update(y) {
    if (!metrics.length) return;
    const vh = window.innerHeight;
    const mid = y + vh * 0.5;
    const first = metrics[0];
    const last = metrics[metrics.length - 1];
    let index;
    let local;
    if (mid < first.top) {
      index = -1;
      local = clamp(y / Math.max(1, first.top - vh * 0.5));
    } else if (mid >= last.top + last.h) {
      index = stages.length;
      local = clamp((mid - (last.top + last.h)) / vh);
    } else {
      index = metrics.findIndex((m) => mid < m.top + m.h);
      const m = metrics[index];
      local = clamp((mid - m.top) / m.h);
    }
    state.index = index;
    state.local = local;
    state.heroP = index === -1 ? local : 1;

    // A stage "activates" once its panel is comfortably on screen.
    const inStage = index >= 0 && index < stages.length;
    setActive(inStage ? index : -1);
    if (inStage) widgets[keys[index]]?.progress?.(local);

    if (rail) {
      const show = inStage;
      rail.hidden = false;
      rail.classList.toggle('is-visible', show);
      rail.style.setProperty('--jp', inStage ? ((index + local) / stages.length).toFixed(4) : index < 0 ? 0 : 1);
    }
    onState?.(state);
  }

  onScroll(update);
  return state;
}
