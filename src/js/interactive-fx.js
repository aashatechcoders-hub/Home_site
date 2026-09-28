/* ==========================================================================
   INTERACTIVE FX
   Preloader, scroll progress bar, hero entrance, cursor spotlight and
   magnetic card tilt. All effects respect prefers-reduced-motion and
   are skipped on touch / coarse-pointer devices where relevant.
   ========================================================================== */

const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initPreloader(onHide) {
  const pre = document.getElementById('atc-preloader');

  if (!pre) {
    onHide && onHide();
    return;
  }

  let hidden = false;
  function hide() {
    if (hidden) return;
    hidden = true;
    pre.classList.add('is-hidden');
    onHide && onHide();
    setTimeout(() => {
      if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    }, 700);
  }

  const minVisibleMs = 600;
  const startedAt = performance.now();

  if (document.readyState === 'complete') {
    setTimeout(hide, minVisibleMs);
  } else {
    window.addEventListener(
      'load',
      () => {
        const elapsed = performance.now() - startedAt;
        setTimeout(hide, Math.max(0, minVisibleMs - elapsed));
      },
      { once: true }
    );
  }

  // Safety net in case 'load' is delayed by slow third-party assets or network
  setTimeout(hide, 2500);
}

export function initHeroEntrance() {
  const targets = document.querySelectorAll('.hero-anim');
  if (!targets.length) return;

  targets.forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${0.15 + i * 0.12}s`);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      targets.forEach((el) => el.classList.add('is-visible'));
    });
  });
}

export function initScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? Math.min(scrollTop / height, 1) : 0;
    bar.style.transform = `scaleX(${pct})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

export function initCursorSpotlight() {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  const spot = document.createElement('div');
  spot.className = 'cursor-spotlight';
  document.body.appendChild(spot);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;
  let active = false;

  window.addEventListener(
    'mousemove',
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!active) {
        active = true;
        spot.classList.add('is-active');
      }
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', () => spot.classList.remove('is-active'));

  function raf() {
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    spot.style.left = `${x}px`;
    spot.style.top = `${y}px`;
    requestAnimationFrame(raf);
  }
  raf();
}

const TILT_MAX_DEG = 5;

function applyTilt(card, clientX, clientY) {
  const rect = card.getBoundingClientRect();
  const px = (clientX - rect.left) / rect.width - 0.5;
  const py = (clientY - rect.top) / rect.height - 0.5;
  card.style.transition = 'transform 0.08s linear';
  card.style.transform = `perspective(1000px) rotateX(${(-py * TILT_MAX_DEG).toFixed(2)}deg) rotateY(${(px * TILT_MAX_DEG).toFixed(2)}deg) translateY(-6px)`;
}

function resetTilt(card) {
  card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  card.style.transform = '';
}

function initStaticTilt(selector) {
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener('mousemove', (e) => applyTilt(card, e.clientX, e.clientY));
    card.addEventListener('mouseleave', () => resetTilt(card));
  });
}

function initDelegatedTilt(containerId, cardSelector) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let activeCard = null;

  container.addEventListener('mousemove', (e) => {
    const card = e.target.closest(cardSelector);
    if (card !== activeCard) {
      if (activeCard) resetTilt(activeCard);
      activeCard = card;
    }
    if (card) applyTilt(card, e.clientX, e.clientY);
  });

  container.addEventListener('mouseleave', () => {
    if (activeCard) {
      resetTilt(activeCard);
      activeCard = null;
    }
  });
}

export function initCardTilt() {
  if (!FINE_POINTER || REDUCED_MOTION) return;

  initStaticTilt('.pillar-card, .team-card, .pricing-card');
  initDelegatedTilt('services-grid', '.service-card');
  initDelegatedTilt('projects-grid', '.project-card');
  initDelegatedTilt('related-projects-grid', '.project-card');
}
