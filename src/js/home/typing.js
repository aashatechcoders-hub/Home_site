// Typing that feels like a person at a keyboard, not a ticker: uneven cadence,
// short pauses at punctuation and word boundaries, and a block caret.
// Every script already exists as text in the HTML — this only replays it.
import { reducedMotion } from '../site.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function charDelay(ch, base) {
  let d = base * (0.55 + Math.random() * 0.9);
  if (ch === ' ') d += base * 0.4;
  if (/[,;:!?)]/.test(ch)) d += base * 2;
  if (ch === '.') d += base * 0.6; // ellipses and paths shouldn't crawl
  if (Math.random() < 0.04) d += base * 6; // the occasional "thinking" pause
  return d;
}

export function makeCaret() {
  const c = document.createElement('span');
  c.className = 'caret';
  c.setAttribute('aria-hidden', 'true');
  return c;
}

// Types `text` into `el` (plain text). Resolves when done.
export async function typeInto(el, text, { speed = 32, caret, signal } = {}) {
  el.textContent = '';
  const node = document.createTextNode('');
  el.appendChild(node);
  if (caret) el.appendChild(caret);
  for (const ch of text) {
    if (signal?.aborted) break;
    node.data += ch;
    await sleep(charDelay(ch, speed));
  }
  node.data = text;
}

/**
 * Terminal script player. Lines are <p data-k="cmd|out|ok|warn|err">.
 * Commands are typed; output appears the way real output does — all at once
 * after a short, variable delay.
 */
export function createScript(root, { speed = 17, onLine } = {}) {
  const body = root.querySelector('.term__body') || root;
  const prompt = root.dataset.prompt || '$';
  const lines = [...body.querySelectorAll('[data-k]')].map((el) => ({ el, kind: el.dataset.k, text: el.textContent }));
  lines.forEach(({ el, kind }) => kind === 'cmd' && el.setAttribute('data-prompt', prompt));
  let played = false;
  let controller = null;

  const showAll = () => lines.forEach(({ el, text }) => {
    el.textContent = text;
    el.classList.remove('is-pending');
  });

  async function play() {
    if (played || reducedMotion) return showAll();
    played = true;
    controller = new AbortController();
    const { signal } = controller;
    const caret = makeCaret();
    lines.forEach(({ el }) => {
      el.classList.add('is-pending');
      el.textContent = '';
    });
    for (const [i, line] of lines.entries()) {
      if (signal.aborted) break;
      onLine?.(i, line);
      line.el.classList.remove('is-pending');
      if (line.kind === 'cmd') {
        await sleep(160 + Math.random() * 180);
        await typeInto(line.el, line.text, { speed, caret, signal });
        await sleep(160);
      } else {
        await sleep(110 + Math.random() * 240);
        line.el.textContent = line.text;
        line.el.appendChild(caret);
      }
    }
    caret.remove();
    showAll();
    root.dispatchEvent(new CustomEvent('script:done'));
  }

  function reset() {
    controller?.abort();
    played = false;
    showAll();
  }

  // Blank the terminal (e.g. while the code that produces its output is typed).
  function clear() {
    lines.forEach(({ el }) => {
      el.classList.add('is-pending');
      el.textContent = '';
    });
  }

  // Leaving mid-sequence: jump to the final state rather than freezing half-typed.
  function finish() {
    controller?.abort();
    showAll();
  }

  return { play, reset, clear, showAll, finish, get played() { return played; } };
}

// A heading that resolves from random glyphs into its text — used once per stage.
const GLYPHS = '01<>/{}[]=+*#_$%';
export function decode(el, { duration = 700 } = {}) {
  if (reducedMotion || el.dataset.decoded) return;
  el.dataset.decoded = '1';
  const text = el.textContent;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const revealed = Math.floor(t * text.length);
    let out = text.slice(0, revealed);
    for (let i = revealed; i < text.length; i++) {
      out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = text;
  };
  requestAnimationFrame(step);
}

/**
 * Hero headline: the full text is painted immediately as faint "ghost" text
 * (fast LCP, readable without JS), then typed over in full colour.
 */
export async function typeHeadline(h1) {
  const lines = [...h1.querySelectorAll('.hero__txt')];
  const split = lines.map((line) => {
    const text = line.textContent;
    line.textContent = '';
    const chars = [...text].map((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      line.appendChild(s);
      return s;
    });
    return { line, chars };
  });

  // Gradient lines: give each glyph its slice of one continuous gradient.
  const paintGradient = () => split.forEach(({ line, chars }) => {
    if (!line.classList.contains('hero__txt--grad')) return;
    const w = line.offsetWidth;
    chars.forEach((c) => {
      c.style.backgroundSize = `${w}px 100%`;
      c.style.backgroundPosition = `${line.offsetLeft - c.offsetLeft}px 0`;
    });
  });
  paintGradient();
  window.addEventListener('resize', paintGradient, { passive: true });
  document.fonts?.ready.then(paintGradient);

  if (reducedMotion) {
    split.forEach(({ chars }) => chars.forEach((c) => c.classList.add('on')));
    return;
  }

  h1.classList.add('is-typing');
  const caret = makeCaret();
  await sleep(700);
  for (const { chars } of split) {
    for (const c of chars) {
      c.classList.add('on');
      c.after(caret);
      await sleep(charDelay(c.textContent, 34));
    }
    await sleep(380);
  }
  await sleep(500);
  caret.classList.add('caret--idle');
  h1.classList.remove('is-typing');
}
