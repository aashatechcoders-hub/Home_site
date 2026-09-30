// The ATC engineering world: one WebGL scene, one camera, sixteen environments
// placed along a path. Scroll position (from journey.js) drives the camera from
// the hero core through each environment; environments are code-split and only
// built as the camera approaches them.
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as K from './kit.js';
import { createCore } from './core.js';

const { THREE } = K;
const ENV_LOADERS = import.meta.glob('./envs/*.js');

const QUALITY = {
  high: { dpr: 1.75, antialias: true, dust: 2600, particles: 5200, instances: 1 },
  mid: { dpr: 1.5, antialias: false, dust: 1400, particles: 2800, instances: 0.7 },
  low: { dpr: 1.1, antialias: false, dust: 700, particles: 1400, instances: 0.45 },
};

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function stageCenter(i) {
  return V(Math.sin(i * 0.9) * 7, Math.cos(i * 0.65) * 2.4 - 0.4, -48 - i * 38);
}

export function createWorld({ canvas, labelsRoot, quality = 'mid', stages, bus, onReady }) {
  const q = QUALITY[quality] || QUALITY.mid;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: q.antialias, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dpr));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080c, 0.026);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 160);
  scene.add(camera);
  // Lights travel with the camera so every environment is lit the same way.
  scene.add(new THREE.AmbientLight(0x8899cc, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 6, 5);
  camera.add(key);
  const rimC = new THREE.PointLight(0x2fd4ef, 14, 26);
  rimC.position.set(-6, 2, -2);
  camera.add(rimC);
  const rimV = new THREE.PointLight(0x8b7cf6, 10, 26);
  rimV.position.set(6, -3, -4);
  camera.add(rimV);

  let mobile = false;
  const kit = { ...K, q, bus, get mobile() { return mobile; } };

  /* ---- Hero core ---- */
  const core = createCore(kit, { labelsRoot, particles: q.particles });
  scene.add(core.group);

  /* ---- Journey backbone: a faint path with data flowing ahead of the camera ---- */
  const centers = stages.map((_, i) => stageCenter(i));
  const spine = new THREE.CatmullRomCurve3([V(0, 0, 0), ...centers, stageCenter(stages.length).add(V(0, 0, -20))]);
  const spinePts = spine.getSpacedPoints(600);
  scene.add(K.line(spinePts, K.C.blue, 0.14));
  const flowCount = 18;
  const flowPos = new Float32Array(flowCount * 3);
  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  scene.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({ map: K.glowTexture(), color: 0xa9e9ff, size: 0.5, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));

  /* ---- Ambient dust along the whole route ---- */
  const dustPos = new Float32Array(q.dust * 3);
  const endZ = centers[centers.length - 1].z - 20;
  for (let i = 0; i < q.dust; i++) {
    const t = Math.random();
    const p = spine.getPoint(t);
    const r = 5 + Math.random() * 16;
    const a = Math.random() * Math.PI * 2;
    dustPos.set([p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.6, p.z + (Math.random() - 0.5) * 12], i * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: K.glowTexture(), color: 0x7f9fff, size: 0.09, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })));
  void endZ;

  /* ---- Environments (lazy) ---- */
  const slots = stages.map((key, i) => ({ key, i, center: centers[i], env: null, loading: false }));
  function ensure(slot) {
    if (slot.env || slot.loading) return;
    const loader = ENV_LOADERS[`./envs/${slot.key}.js`];
    if (!loader) return;
    slot.loading = true;
    loader()
      .then((m) => {
        const env = m.default(kit);
        env.group.position.copy(slot.center);
        env.group.visible = false;
        if (mobile) env.group.scale.setScalar(env.mobileScale ?? 0.72);
        scene.add(env.group);
        slot.env = env;
      })
      .catch((err) => console.warn(`[ATC] environment ${slot.key} failed`, err))
      .finally(() => (slot.loading = false));
  }

  /* ---- Camera framing ---- */
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const heroFrame = (p) => {
    const d = mobile
      ? { pos: V(0, 0.4, 19), target: V(0, -4, 0) }
      : { pos: V(0.4, 0.4, 15), target: V(-3.6, 0, 0) };
    // Scrolling out of the hero dollies the camera into and through the core.
    const e = K.ease(p);
    d.pos.z -= e * 13;
    d.pos.y += e * 0.4;
    d.target.lerp(V(0, -0.5, -30), e);
    return d;
  };
  const ctaFrame = () => (mobile ? { pos: V(0, 0.2, 17), target: V(0, 0, 0) } : { pos: V(0, 0.3, 13), target: V(0, 0, 0) });

  function stageFrame(i, l) {
    const slot = slots[i];
    const c = slot.center;
    const custom = slot.env?.frame?.(l, mobile);
    const off = custom || (mobile ? { pos: [0, 3.4, 19], target: [0, -3.8, 0] } : { pos: [0.4, 2.2, 16.5], target: [-2.5, 0.1, 0] });
    const s = slot.env?.group.scale.x ?? 1;
    return {
      pos: V(off.pos[0] * s, off.pos[1] * s, off.pos[2] * s).add(c),
      target: V(off.target[0] * s, off.target[1] * s, off.target[2] * s).add(c),
    };
  }

  const state = { index: -1, local: 0, heroP: 0, cta: 0, visible: true, px: 0, py: 0 };
  const cam = { pos: V(0.4, 0.4, 15), target: V(-3.6, 0, 0) };
  let firstFrame = true;

  function desiredFrame() {
    const n = slots.length;
    if (state.cta > 0.02 && state.index >= n) return ctaFrame();
    if (state.index < 0) return heroFrame(state.heroP);
    if (state.index >= n) {
      const f = stageFrame(n - 1, 1);
      f.pos.z += state.local * 6;
      return f;
    }
    const i = state.index;
    const l = state.local;
    const h = stageHeights[i] || 1;
    const T = Math.min(0.42, 0.36 / h); // transition fills ~the first third of a viewport
    const cur = stageFrame(i, l);
    if (l >= T) return cur;
    const prev = i === 0 ? heroFrame(1) : stageFrame(i - 1, 1);
    const e = K.ease(l / T);
    const arc = Math.sin(Math.PI * e);
    return {
      pos: prev.pos.lerp(cur.pos, e).add(V(Math.sin(i * 1.7) * arc * 2.5, arc * 2.6, 0)),
      target: prev.target.lerp(cur.target, e),
    };
  }
  let stageHeights = stages.map(() => 1);

  /* ---- Sizing ---- */
  let width = 1;
  let height = 1;
  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width / height < 0.8 ? 50 : 40;
    camera.updateProjectionMatrix();
    const wasMobile = mobile;
    mobile = width / height < 0.9 || width < 760;
    if (wasMobile !== mobile) slots.forEach((s) => s.env?.group.scale.setScalar(mobile ? s.env.mobileScale ?? 0.72 : 1));
    if (!running) render(0);
  }

  /* ---- Loop ---- */
  let running = false;
  let raf = 0;
  let last = 0;
  let time = 0;

  function render(dt) {
    time += dt;
    const n = slots.length;
    const s = state.index < 0 ? -1 + state.heroP : state.index >= n ? n : state.index + state.local;

    // Camera: critically-damped follow of the scroll-derived frame + pointer parallax.
    const want = desiredFrame();
    const k = firstFrame ? 1 : 1 - Math.exp(-dt * 7);
    cam.pos.lerp(want.pos, k);
    cam.target.lerp(want.target, k);
    camera.position.copy(cam.pos).add(tmpA.set(state.px * 0.5, -state.py * 0.35, 0));
    camera.lookAt(tmpB.copy(cam.target).add(tmpA.set(state.px * 0.8, -state.py * 0.5, 0)));

    // Core: fully present in the hero and the final CTA.
    const coreOn = s < 0.4 || state.cta > 0.02;
    core.group.visible = coreOn;
    if (coreOn) core.update(dt, time, { heroP: state.index < 0 ? state.heroP : 1, cta: state.index >= n ? state.cta : 0, px: state.px, py: state.py }, camera, width, height, mobile);
    else core.hideLabels();

    // Environments: build ahead, show nearby, update only what is visible.
    slots.forEach((slot) => {
      const d = slot.i - s;
      if (d > -1.6 && d < 2.6) ensure(slot);
      const env = slot.env;
      if (!env) return;
      const vis = d > -1.25 && d < 1.7 && state.index < n + 1 && !(state.index >= n && state.cta > 0.02);
      env.group.visible = vis;
      if (vis) {
        const l = slot.i < state.index ? 1 : slot.i > state.index ? 0 : state.local;
        env.update(dt, time, l, slot.i === state.index);
      }
    });

    // Data flowing along the backbone, ahead of the camera.
    for (let i = 0; i < flowCount; i++) {
      const t = ((time * 0.012 + i / flowCount) % 1);
      spine.getPointAt(t, tmpA);
      flowPos.set([tmpA.x, tmpA.y, tmpA.z], i * 3);
    }
    flowGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      onReady?.();
    }
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    // rAF timestamps can predate the performance.now() taken in start(); never go backwards.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    render(dt);
  }
  function start() {
    if (running || !state.visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    document.documentElement.classList.remove('scene-ready');
  });
  new ResizeObserver(resize).observe(canvas);
  resize();

  // Warm the first two environments while the visitor reads the hero.
  const warm = () => slots.slice(0, 2).forEach(ensure);
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2500 });
  else setTimeout(warm, 1200);

  start();

  return {
    update(next) {
      Object.assign(state, next);
      if (state.visible) start();
      else stop();
    },
    setStageHeights(h) {
      stageHeights = h;
    },
    setPointer(x, y) {
      state.px = x;
      state.py = y;
    },
  };
}
