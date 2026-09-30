// Shared behaviour for every page: navigation, reveal, micro-interactions.
import Lenis from 'lenis';

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Smooth wheel scrolling for the camera-driven story. Touch keeps native
// scrolling, and reduced-motion users get the browser's own behaviour.
export const lenis = reducedMotion
  ? null
  : new Lenis({
      autoRaf: true,
      lerp: 0.11,
      prevent: (node) => node.closest?.('dialog, [data-lenis-prevent]') != null,
    });
if (lenis) document.documentElement.classList.add('has-lenis');

export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -80, immediate });
  else el.scrollIntoView({ behavior: reducedMotion || immediate ? 'auto' : 'smooth' });
}

// Same-page hash links (including "/#services" from the shared header).
function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash || url.hash === '#') return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    scrollToTarget(el);
    history.pushState(null, '', url.hash);
    // Move focus for keyboard and screen-reader users without a second jump.
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  });
}

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// One rAF-throttled scroll/resize bus instead of a listener per feature.
const scrollHandlers = new Set();
let scrollQueued = false;
function flushScroll() {
  scrollQueued = false;
  const y = window.scrollY;
  scrollHandlers.forEach((fn) => fn(y));
}
function queueScroll() {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(flushScroll);
  }
}
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });

export function onScroll(fn) {
  scrollHandlers.add(fn);
  fn(window.scrollY);
}

export function inView(el, cb, options = {}) {
  if (!el) return null;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e)), options);
  io.observe(el);
  return io;
}

/* ---------- Navigation ---------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastY = window.scrollY;
  onScroll((y) => {
    const delta = y - lastY;
    nav.classList.toggle('is-scrolled', y > 24);
    const menuOpen = document.body.classList.contains('menu-open');
    const focusInside = nav.contains(document.activeElement);
    if (y > 160 && delta > 6 && !menuOpen && !focusInside) nav.classList.add('is-hidden');
    else if (delta < -6 || y <= 160) nav.classList.remove('is-hidden');
    lastY = y;
  });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));

  initActiveIndicator(nav);
  initMobileMenu(nav);
}

// Maps page sections onto the five primary nav items.
const SECTION_TO_NAV = {
  journey: 'journey',
  services: 'services',
  solutions: 'solutions',
  technology: 'solutions',
  work: 'work',
  about: 'about',
  faq: 'about',
  start: 'contact',
  contact: 'contact',
};

function initActiveIndicator(nav) {
  const linksWrap = nav.querySelector('.nav__links');
  const indicator = nav.querySelector('.nav__indicator');
  const links = [...nav.querySelectorAll('[data-nav-link]')];
  const sections = Object.keys(SECTION_TO_NAV).map((id) => document.getElementById(id)).filter(Boolean);
  if (!linksWrap || !indicator || !sections.length) return;

  let current = null;
  const setActive = (key) => {
    if (key === current) return;
    current = key;
    const link = links.find((l) => l.dataset.navLink === key);
    links.forEach((l) => {
      l.classList.toggle('is-active', l === link);
      if (l === link) l.setAttribute('aria-current', 'location');
      else l.removeAttribute('aria-current');
    });
    if (!link) {
      indicator.classList.remove('is-on');
      return;
    }
    indicator.style.setProperty('--ix', `${link.offsetLeft}px`);
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.classList.add('is-on');
  };

  // A thin detection band at ~35% of the viewport decides the active section.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(SECTION_TO_NAV[e.target.id]);
      });
    },
    { rootMargin: '-35% 0px -64% 0px' }
  );
  sections.forEach((s) => io.observe(s));

  onScroll((y) => {
    const first = sections[0];
    if (first && y + window.innerHeight * 0.35 < first.offsetTop) setActive(null);
  });

  window.addEventListener('resize', () => {
    const key = current;
    current = null;
    setActive(key);
  });
}

function initMobileMenu(nav) {
  const toggle = nav.querySelector('.nav__toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const focusables = () => [toggle, ...menu.querySelectorAll('a, button')];

  const open = () => {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    document.body.classList.add('menu-open');
    lenis?.stop();
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    nav.classList.remove('is-hidden');
    menu.querySelector('a')?.focus({ preventScroll: true });
  };
  const close = (returnFocus = true) => {
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    lenis?.start();
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    setTimeout(() => {
      if (!menu.classList.contains('is-open')) menu.hidden = true;
    }, reducedMotion ? 0 : 350);
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close(false);
  });
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const items = focusables();
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) close(false);
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (!finePointer || reducedMotion) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
      el.style.setProperty('--bx', `${clamp(x, -10, 10)}px`);
      el.style.setProperty('--by', `${clamp(y, -8, 8)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--bx', '0px');
      el.style.setProperty('--by', '0px');
    });
  });
}

/* ---------- Pointer-reactive surfaces ---------- */
export function initTilt(selector = '[data-tilt]', max = 5) {
  if (!finePointer) return;
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      if (!reducedMotion) {
        el.style.setProperty('--rx', `${(0.5 - py) * max}deg`);
        el.style.setProperty('--ry', `${(px - 0.5) * max}deg`);
      }
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/* ---------- Cursor ---------- */
function initCursor() {
  if (!finePointer || reducedMotion || window.innerWidth < 1024) return;
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  const interactive = 'a, button, summary, label, input, textarea, [data-tilt], [data-work-track]';

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX;
    ty = e.clientY;
    dot.classList.add('is-on');
    dot.classList.toggle('is-hover', !!e.target.closest?.(interactive));
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('is-on'));
}

/* ---------- Sticky mobile CTA ---------- */
function initStickyCta() {
  const bar = document.querySelector('[data-sticky-cta]');
  if (!bar) return;
  const link = bar.querySelector('a');
  const blockers = ['start', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  const hiddenBy = new Set();
  blockers.forEach((el) => inView(el, (on) => (on ? hiddenBy.add(el) : hiddenBy.delete(el))));

  const footer = document.querySelector('.footer');
  if (footer) inView(footer, (on) => (on ? hiddenBy.add(footer) : hiddenBy.delete(footer)));

  onScroll((y) => {
    const show = y > window.innerHeight * 0.75 && hiddenBy.size === 0 && !document.body.classList.contains('menu-open');
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
    link.tabIndex = show ? 0 : -1;
  });
}

/* ---------- Footer ---------- */
function initFooter() {
  const footer = document.querySelector('.footer');
  if (footer) inView(footer, (on) => footer.classList.toggle('is-offscreen', !on));
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
}

export function initSite() {
  const run = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.warn(`[ATC] ${name} failed`, err);
    }
  };
  run('anchors', initAnchors);
  run('nav', initNav);
  run('reveal', initReveal);
  run('magnetic', initMagnetic);
  run('cursor', initCursor);
  run('sticky-cta', initStickyCta);
  run('footer', initFooter);
}
