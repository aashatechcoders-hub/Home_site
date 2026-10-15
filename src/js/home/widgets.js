// Per-stage HTML widgets for the engineering journey. Each widget exposes
// enter()/leave() (time-based sequences, played when the stage is reached)
// and/or progress(local) (scrubbed directly by scroll).
// All simulated output is illustrative; none of it is client data.
import { reducedMotion, lenis } from '../site.js';
import { emit } from '../bus.js';
import { createScript, makeCaret } from './typing.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const stageEl = (key) => document.querySelector(`[data-stage="${key}"]`);

// Light list items one after another (once).
function stagger(items, cls = 'on', gap = 260) {
  if (reducedMotion) return items.forEach((el) => el.classList.add(cls));
  items.forEach((el, i) => setTimeout(() => el.classList.add(cls), i * gap));
}

// A loop that only runs while its stage is active.
function loop(fn, ms) {
  let id = 0;
  return {
    start() {
      if (id || reducedMotion) return;
      fn();
      id = setInterval(fn, ms);
    },
    stop() {
      clearInterval(id);
      id = 0;
    },
  };
}

function scriptWidget(key) {
  const el = stageEl(key);
  const term = el && $('[data-script]', el);
  const script = term ? createScript(term) : null;
  const chains = el ? $$('[data-chain] li, .chain:not(.chain--steps) li', el) : [];
  return {
    enter() {
      script?.play();
      stagger(chains);
    },
    leave() {
      script?.finish();
    },
  };
}

/* ---------- 02 Architecture ---------- */
const ARCH = [
  ['The browser or mobile app in the user’s hands.', 'Every request starts here.', 'Web · iOS · Android'],
  ['Renders the interface and talks to the API.', 'Keeps the experience separate from business rules.', 'React · Next.js · Flutter'],
  ['One controlled entry point: routing, rate limits, auth checks.', 'A single door is easier to secure and observe.', 'Nginx · managed API gateways'],
  ['Business rules and workflows.', 'The product’s actual behaviour lives here.', 'Python · Django · FastAPI · Node.js'],
  ['The durable source of truth.', 'Data must survive restarts and stay consistent.', 'PostgreSQL · MySQL'],
  ['Keeps frequently used data in memory.', 'Faster reads and less load on the database.', 'Redis'],
  ['Holds work to be done later.', 'Slow tasks never block the user.', 'Redis queues · message brokers'],
  ['Process background jobs from the queue.', 'Emails, reports and AI tasks run out of band.', 'Python workers · scheduled jobs'],
];
function architecture() {
  const root = $('[data-arch]');
  if (!root) return {};
  const tabs = $$('[role="tab"]', root);
  const what = $('[data-arch-what]', root);
  const why = $('[data-arch-why]', root);
  const tech = $('[data-arch-tech]', root);
  const trace = $$('[data-trace] li', root);
  const select = (i, focus) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    [what.textContent, why.textContent, tech.textContent] = ARCH[i];
    if (focus) tabs[i].focus();
    emit('arch:focus', i);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('mouseenter', () => select(i));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      select((i + d + tabs.length) % tabs.length, true);
    });
  });
  let step = 0;
  const tick = loop(() => {
    trace.forEach((li, j) => li.classList.toggle('on', j === step));
    emit('arch:trace', step);
    step = (step + 1) % trace.length;
  }, 700);
  return { enter: tick.start, leave: tick.stop };
}

/* ---------- 03 UI/UX ---------- */
function uiux() {
  const el = stageEl('uiux');
  const mock = $('[data-mock]', el);
  const steps = $$('[data-mock-steps] li', el);
  const words = $$('[data-words] span', el);
  let i = 0;
  const tick = loop(() => {
    mock.dataset.step = i;
    steps.forEach((s, j) => s.classList.toggle('on', j <= i));
    words.forEach((w, j) => w.classList.toggle('on', j === Math.min(i, words.length - 1)));
    emit('uiux:step', i);
    i = (i + 1) % steps.length;
  }, 1500);
  if (reducedMotion) {
    mock.dataset.step = 4;
    steps.forEach((s) => s.classList.add('on'));
  }
  return { enter: tick.start, leave: tick.stop };
}

/* ---------- 04 Development ---------- */
// Wrap every character of a code block (keeping syntax spans) for typing.
function splitCode(root) {
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of child.data) {
          const s = document.createElement('span');
          s.className = 'cc';
          s.textContent = ch;
          frag.appendChild(s);
          chars.push(s);
        }
        child.replaceWith(frag);
      } else walk(child);
    });
  };
  walk(root);
  return chars;
}

// perTick > 1 reveals several characters per timer tick — browsers clamp short
// timers to ~4ms, so this is how fast "auto-typing" stays fast.
async function typeCode(chars, { speed = 22, perTick = 1, onProgress, signal } = {}) {
  const caret = makeCaret();
  for (let i = 0; i < chars.length; i += perTick) {
    if (signal?.aborted) return;
    const end = Math.min(chars.length, i + perTick);
    for (let k = i; k < end; k++) chars[k].classList.add('on');
    chars[end - 1].after(caret);
    onProgress?.(end / chars.length);
    const ch = chars[end - 1].textContent;
    await sleep(ch === '\n' ? speed * 4 : ch === ' ' ? speed * 0.3 : speed * (0.4 + Math.random()));
  }
  caret.remove();
}

function development() {
  const el = stageEl('development');
  const code = $('[data-code] code', el);
  const preview = $('[data-preview]', el);
  const steps = $$('[data-dev-steps] li', el);
  const chars = reducedMotion ? [] : splitCode(code);
  let played = false;
  return {
    async enter() {
      if (played || reducedMotion) {
        preview.dataset.stage = 3;
        steps.forEach((s) => s.classList.add('on'));
        return;
      }
      played = true;
      code.classList.add('is-typing');
      steps[0].classList.add('on');
      await typeCode(chars, {
        speed: 26,
        perTick: 2,
        onProgress: (p) => {
          preview.dataset.stage = p < 0.3 ? 0 : p < 0.65 ? 1 : p < 0.95 ? 2 : 3;
        },
      });
      code.classList.remove('is-typing');
      for (let i = 1; i < steps.length; i++) {
        await sleep(450);
        steps[i].classList.add('on');
        emit('dev:step', i);
      }
    },
  };
}

/* ---------- 06 API ---------- */
const API_LOG = [
  ['GET', '/users', 200, 'OK'],
  ['POST', '/projects', 201, 'Created'],
  ['GET', '/projects/42', 200, 'OK'],
  ['POST', '/orders', 400, 'validation failed: quantity'],
  ['GET', '/projects', 401, 'missing token'],
  ['POST', '/orders', 201, 'Created'],
  ['GET', '/users/7', 200, 'OK'],
  ['POST', '/projects', 500, 'upstream timeout → retried → 201'],
];
function api() {
  const el = stageEl('api');
  const log = $('[data-apilog]', el);
  const trace = $$('[data-api-trace] li', el);
  let n = 0;
  let t = 0;
  if (reducedMotion) {
    log.innerHTML = API_LOG.slice(0, 5).map(([m, p, s, msg]) => row(m, p, s, msg)).join('');
  }
  function row(m, p, s, msg) {
    const cls = s >= 500 ? 'c-err' : s >= 400 ? 'c-warn' : 'c-ok';
    return `<p><b class="${m === 'GET' ? 'm-get' : 'm-post'}">${m}</b> ${p} <span class="${cls}">${s}</span> <em>${msg}</em></p>`;
  }
  const tick = loop(() => {
    // Walk the lifecycle; on each "Response" append a log line.
    trace.forEach((li, j) => li.classList.toggle('on', j === t));
    if (t === trace.length - 1) {
      const [m, p, s, msg] = API_LOG[n % API_LOG.length];
      log.insertAdjacentHTML('beforeend', row(m, p, s, msg));
      while (log.children.length > 5) log.firstElementChild.remove();
      emit('api:response', s);
      n++;
    }
    t = (t + 1) % trace.length;
  }, 380);
  return { enter: tick.start, leave: tick.stop };
}

/* ---------- 07 Testing ---------- */
function testing() {
  const el = stageEl('testing');
  const rows = $$('[data-test]', el);
  const note = $('[data-tests-note]', el);
  let played = false;
  return {
    async enter() {
      if (played || reducedMotion) return rows.forEach((r) => r.classList.add('is-pass'));
      played = true;
      note.textContent = 'Running 6 suites…';
      rows.forEach((r) => r.classList.remove('is-pass', 'is-fail'));
      const runs = rows.map(async (r, i) => {
        const dur = 900 + Math.random() * 1400;
        r.style.setProperty('--dur', `${dur}ms`);
        await sleep(i * 180);
        r.classList.add('is-running');
        emit('test:run', i);
        if (r.hasAttribute('data-fails')) {
          await sleep(dur * 0.6);
          r.classList.remove('is-running');
          r.classList.add('is-fail');
          note.textContent = 'Integration failed: order total mismatch';
          emit('test:fail', i);
          await sleep(1600);
          note.textContent = 'Fix applied → re-running integration…';
          r.classList.remove('is-fail');
          r.classList.add('is-running', 'is-rerun');
          await sleep(dur);
        } else {
          await sleep(dur);
        }
        r.classList.remove('is-running');
        r.classList.add('is-pass');
        emit('test:pass', i);
      });
      await Promise.all(runs);
      note.textContent = 'All 6 suites passing — verified';
    },
  };
}

/* ---------- 08 Git ---------- */
function git() {
  const el = stageEl('git');
  const graph = $('[data-gitgraph]', el);
  const log = $$('.gitlog li', el);
  return {
    enter() {
      graph.classList.add('is-drawn');
      stagger(log, 'on', 420);
    },
  };
}

/* ---------- 09 CI/CD (scroll-scrubbed) ---------- */
function cicd() {
  const el = stageEl('cicd');
  const steps = $$('[data-pipe] li', el);
  const summary = $$('[data-pipe-summary] span', el);
  const doneAt = [2, 4, 5, 6, 8, 9]; // build, test, scan, image, deploy, health
  if (reducedMotion) {
    steps.forEach((s) => s.classList.add('done'));
    summary.forEach((s) => s.classList.add('on'));
  }
  return {
    progress(l) {
      if (reducedMotion) return;
      const p = Math.min(1, Math.max(0, (l - 0.12) / 0.76));
      const at = p * steps.length;
      steps.forEach((s, i) => {
        s.classList.toggle('done', i < Math.floor(at));
        s.classList.toggle('active', i === Math.floor(at) && p < 1);
      });
      summary.forEach((s, i) => s.classList.toggle('on', at > doneAt[i] + 1));
    },
  };
}

/* ---------- 10 Docker ---------- */
function docker() {
  const el = stageEl('docker');
  const items = $$('[data-containers] li', el);
  const cmds = $$('.cmds span', el);
  let played = false;
  return {
    async enter() {
      if (played || reducedMotion) return items.forEach((i) => i.classList.add('on'));
      played = true;
      stagger(cmds, 'on', 300);
      for (const [i, item] of items.entries()) {
        await sleep(i ? 520 : 900);
        item.classList.add('on');
        emit('docker:start', i);
      }
    },
  };
}

/* ---------- 13 Deployment (scroll-scrubbed) ---------- */
function deploy() {
  const el = stageEl('deploy');
  const box = $('[data-deploy]', el);
  const stops = $$('.deploy__track li', box);
  const done = $('[data-deploy-done]', el);
  if (reducedMotion) {
    box.style.setProperty('--p', 1);
    stops.forEach((s) => s.classList.add('on'));
    done.classList.add('on');
  }
  return {
    progress(l) {
      if (reducedMotion) return;
      const p = Math.min(1, Math.max(0, (l - 0.1) / 0.72));
      box.style.setProperty('--p', p.toFixed(3));
      stops.forEach((s, i) => s.classList.toggle('on', p >= i / (stops.length - 1) - 0.02));
      done.classList.toggle('on', p >= 0.999);
    },
  };
}

/* ---------- 14 Monitoring ---------- */
function monitoring() {
  const el = stageEl('monitoring');
  const cells = $$('.dash__cell', el);
  const incident = $('[data-incident]', el);
  const incSteps = $$('span, b', incident);
  const N = 30;
  const series = cells.map((c, i) => ({
    cell: c,
    path: $('path', c),
    spike: c.hasAttribute('data-spike'),
    base: [0.55, 0.4, 0.5, 0.3, 0.12, 0.92][i] ?? 0.5,
    data: Array.from({ length: N }, () => 0),
  }));
  series.forEach((s) => (s.data = s.data.map(() => s.base + (Math.random() - 0.5) * 0.12)));
  const draw = () =>
    series.forEach(({ path, data }) => {
      const d = data.map((v, i) => `${i ? 'L' : 'M'}${((i / (N - 1)) * 120).toFixed(1)} ${(34 - Math.min(1, Math.max(0, v)) * 32).toFixed(1)}`).join(' ');
      path.setAttribute('d', d);
    });
  draw();
  if (reducedMotion) incSteps.forEach((s) => s.classList.add('on'));

  let t = 0;
  const tick = loop(() => {
    t++;
    const phase = t % 70; // ~8.4s cycle at 120ms
    const inSpike = phase > 18 && phase < 30;
    series.forEach((s) => {
      let v = s.base + (Math.random() - 0.5) * 0.12;
      if (s.spike && inSpike) v = s.base + 0.55 + Math.random() * 0.1;
      s.data.shift();
      s.data.push(v);
      s.cell.classList.toggle('is-alert', s.spike && phase > 19 && phase < 44);
    });
    draw();
    // Incident response walk-through, then back to normal.
    const stepAt = [20, 26, 32, 38, 44];
    incSteps.forEach((s, i) => s.classList.toggle('on', phase >= stepAt[i] && phase < 62));
    if (phase === 20) emit('mon:anomaly', true);
    if (phase === 44) emit('mon:anomaly', false);
  }, 120);
  return { enter: tick.start, leave: tick.stop };
}

/* ---------- 16 Scale (scroll-scrubbed) ---------- */
function scale() {
  const el = stageEl('scale');
  const nEl = $('[data-scale-n]', el);
  const unit = $('[data-scale-unit]', el);
  const wrap = $('[data-scale-servers]', el);
  const traffic = $('[data-scale-traffic]', el);
  const words = $$('.scale__words span', el);
  wrap.innerHTML = Array.from({ length: 8 }, () => '<span></span>').join('');
  const servers = [...wrap.children];
  let last = -1;
  const set = (l) => {
    const p = Math.min(1, Math.max(0, (l - 0.1) / 0.75));
    const n = [1, 2, 4, 8][Math.min(3, Math.floor(p * 4))];
    traffic.style.setProperty('--t', p.toFixed(3));
    if (n !== last) {
      last = n;
      nEl.textContent = n;
      unit.textContent = n === 1 ? 'server' : 'servers';
      servers.forEach((s, i) => s.classList.toggle('on', i < n));
    }
    words.forEach((w, i) => w.classList.toggle('on', p > 0.55 + i * 0.12));
  };
  set(reducedMotion ? 1 : 0);
  return { progress: (l) => !reducedMotion && set(l) };
}

/* ---------- Developer mode: simulated build ---------- */
export function initDevMode() {
  const dialog = document.getElementById('devmode');
  const openers = $$('[data-devmode-open]');
  if (!dialog || !openers.length) return;
  const code = $('[data-dm-code] code', dialog);
  const app = $('[data-dm-app]', dialog);
  const badge = $('[data-dm-badge]', dialog);
  const chars = splitCode(code);
  const script = createScript($('[data-dm-term]', dialog), {
    speed: 16,
    onLine: (i, line) => {
      if (line.text.startsWith('BUILD SUCCESSFUL')) app.dataset.stage = 1;
      if (line.text.startsWith('API ONLINE')) {
        app.dataset.stage = 2;
        badge.textContent = 'online';
      }
      if (line.text.startsWith('DATABASE CONNECTED')) app.dataset.stage = 3;
    },
  });
  let controller = null;

  const run = async () => {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    app.dataset.stage = 0;
    badge.textContent = 'offline';
    script.reset();
    if (!reducedMotion) script.clear();
    if (reducedMotion) {
      chars.forEach((c) => c.classList.add('on'));
      app.dataset.stage = 3;
      badge.textContent = 'online';
      return;
    }
    chars.forEach((c) => c.classList.remove('on'));
    code.classList.add('is-typing');
    await typeCode(chars, { speed: 14, perTick: 4, signal });
    code.classList.remove('is-typing');
    if (!signal.aborted) script.play();
  };

  let opener = null;
  openers.forEach((b) =>
    b.addEventListener('click', () => {
      opener = b;
      dialog.showModal();
      lenis?.stop();
      run();
    })
  );
  $('[data-devmode-replay]', dialog).addEventListener('click', run);
  $('[data-devmode-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    controller?.abort();
    lenis?.start();
    opener?.focus();
  });
}

export function createWidgets() {
  const make = {
    discovery: () => scriptWidget('discovery'),
    architecture,
    uiux,
    development,
    database: () => scriptWidget('database'),
    api,
    testing,
    git,
    cicd,
    docker,
    linux: () => scriptWidget('linux'),
    cloud: () => scriptWidget('cloud'),
    deploy,
    monitoring,
    security: () => ({ enter: () => stagger($$('.practices > div', stageEl('security')), 'on', 90) }),
    scale,
  };
  const widgets = {};
  Object.entries(make).forEach(([key, fn]) => {
    try {
      if (stageEl(key)) widgets[key] = fn();
    } catch (err) {
      console.warn(`[ATC] widget ${key} failed`, err);
    }
  });
  return widgets;
}
