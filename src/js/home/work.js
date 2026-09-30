import { reducedMotion, finePointer } from '../site.js';

// Horizontal project track: native scroll-snap for touch/trackpad/keyboard,
// buttons + drag for mouse users. Vertical page scroll is never hijacked.
export function initWork() {
  const track = document.querySelector('[data-work-track]');
  if (!track) return;
  const cards = [...track.children];
  const prev = document.querySelector('[data-work-prev]');
  const next = document.querySelector('[data-work-next]');
  const current = document.querySelector('[data-work-current]');
  const total = document.querySelector('[data-work-total]');
  const progress = document.querySelector('[data-work-progress]');

  if (total) total.textContent = String(cards.length).padStart(2, '0');

  const step = () => {
    if (cards.length < 2) return track.clientWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  };
  const maxScroll = () => track.scrollWidth - track.clientWidth;

  const update = () => {
    const x = track.scrollLeft;
    const i = Math.min(cards.length - 1, Math.round(x / step()));
    const atEnd = x >= maxScroll() - 4;
    const shown = atEnd ? cards.length - 1 : i;
    if (current) current.textContent = String(shown + 1).padStart(2, '0');
    if (prev) prev.disabled = x <= 4;
    if (next) next.disabled = atEnd;
    if (progress) progress.style.setProperty('--wp', ((x + track.clientWidth) / track.scrollWidth).toFixed(3));
  };

  const go = (dir) => {
    track.scrollBy({ left: dir * step(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));

  let queued = false;
  track.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  if (finePointer) initDrag(track);
}

function initDrag(track) {
  let startX = 0;
  let startScroll = 0;
  let dragging = false;
  let moved = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      track.style.scrollSnapType = 'none';
      track.style.cursor = 'grabbing';
    }
    if (moved) track.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    track.style.cursor = '';
    if (moved) {
      // Re-enable snapping and let it settle on the nearest card.
      const left = track.scrollLeft;
      track.style.scrollSnapType = '';
      track.scrollLeft = left;
    }
  });
  // A drag should not also count as a click on the card link underneath.
  track.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());
}
