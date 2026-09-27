/* ==========================================================================
   SCROLL REVEAL SYSTEM
   Staggered fade/slide-in for cards and section headers as they enter
   the viewport. Groups siblings by parent so grids reveal in sequence.
   ========================================================================== */

const REVEAL_SELECTOR = '.section-header, .glass-card, .cloud-metric-card, .stat-block';
const MAX_STAGGER_STEPS = 6;
const STAGGER_STEP_SECONDS = 0.08;

export function initScrollReveal() {
  const elements = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
  if (!elements.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    elements.forEach((el) => el.classList.add('reveal-item', 'is-visible'));
    return;
  }

  // Group by parent so grid children stagger relative to their siblings.
  const groups = new Map();
  elements.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach((group) => {
    group.forEach((el, index) => {
      const delay = Math.min(index, MAX_STAGGER_STEPS) * STAGGER_STEP_SECONDS;
      el.style.setProperty('--reveal-delay', `${delay}s`);
      el.classList.add('reveal-item');
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

export function initStatCounters() {
  const nums = document.querySelectorAll('.stat-number[data-count]');
  if (!nums.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);

        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';

        if (prefersReduced || Number.isNaN(target)) {
          el.textContent = `${Number.isNaN(target) ? el.textContent : target}${suffix}`;
          return;
        }

        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );

  nums.forEach((el) => observer.observe(el));
}
