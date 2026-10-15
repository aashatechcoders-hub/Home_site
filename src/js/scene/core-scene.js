// The ATC "digital core": one WebGL scene shared by the hero and the final CTA.
// It is purely decorative — every piece of content it depicts also exists in HTML.
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Euler,
  FogExp2,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  ACESFilmicToneMapping,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const QUALITY = {
  high: { dpr: 1.75, dust: 900, antialias: true },
  mid: { dpr: 1.5, dust: 450, antialias: false },
  low: { dpr: 1, dust: 220, antialias: false },
};

// Two tilted orbital planes; each capability node rides one of them.
const ORBITS = [
  { radius: 2.9, tilt: new Euler(0.42, 0, 0.2), speed: 0.09 },
  { radius: 3.45, tilt: new Euler(-0.55, 0, -0.38), speed: -0.06 },
];
const NODES = [
  { label: 'Web', orbit: 0, phase: 0 },
  { label: 'AI', orbit: 0, phase: Math.PI * 0.5 },
  { label: 'Cloud', orbit: 0, phase: Math.PI },
  { label: 'Data', orbit: 0, phase: Math.PI * 1.5 },
  { label: 'Mobile', orbit: 1, phase: Math.PI * 0.25 },
  { label: 'Automation', orbit: 1, phase: Math.PI * 0.75 },
  { label: 'APIs', orbit: 1, phase: Math.PI * 1.25 },
  { label: 'Infrastructure', orbit: 1, phase: Math.PI * 1.75 },
];

const lerp = MathUtils.lerp;
const smooth = (e0, e1, x) => {
  const t = MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function glowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function createCoreScene({ canvas, labelsRoot, quality = 'mid', onReady }) {
  const q = QUALITY[quality] || QUALITY.mid;

  const renderer = new WebGLRenderer({ canvas, antialias: q.antialias, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dpr));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  scene.fog = new FogExp2(0x07080c, 0.04);

  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  // Lighting: cool key, cyan + violet rims.
  scene.add(new AmbientLight(0x8899cc, 0.35));
  const key = new DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rimCyan = new PointLight(0x2fd4ef, 16, 22);
  rimCyan.position.set(-4, 1.5, 3);
  scene.add(rimCyan);
  const rimViolet = new PointLight(0x8b7cf6, 12, 22);
  rimViolet.position.set(4, -2.2, 2);
  scene.add(rimViolet);

  const glowTex = glowTexture();

  // rig: pointer + scroll transforms; system: slow idle rotation.
  const rig = new Group();
  const system = new Group();
  rig.add(system);
  scene.add(rig);

  /* ---- Core ---- */
  const core = new Group();
  system.add(core);

  const gem = new Mesh(
    new IcosahedronGeometry(0.62, 0),
    new MeshStandardMaterial({ color: 0x1d2c5c, metalness: 0.9, roughness: 0.22, flatShading: true, emissive: 0x0b1d52, emissiveIntensity: 0.7 })
  );
  core.add(gem);

  const shellGeo = new IcosahedronGeometry(1.15, 1);
  const shell = new Mesh(
    shellGeo,
    new MeshPhysicalMaterial({ color: 0x8fb4ff, metalness: 0.15, roughness: 0.06, transparent: true, opacity: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, depthWrite: false })
  );
  core.add(shell);
  const shellEdges = new LineSegments(
    new EdgesGeometry(shellGeo),
    new LineBasicMaterial({ color: 0x6f9bff, transparent: true, opacity: 0.38, blending: AdditiveBlending, depthWrite: false })
  );
  core.add(shellEdges);

  const cage = new LineSegments(
    new EdgesGeometry(new IcosahedronGeometry(1.75, 0)),
    new LineBasicMaterial({ color: 0x8b7cf6, transparent: true, opacity: 0.14, blending: AdditiveBlending, depthWrite: false })
  );
  core.add(cage);

  const coreGlow = new Sprite(new SpriteMaterial({ map: glowTex, color: 0x4f7dff, transparent: true, opacity: 0.6, blending: AdditiveBlending, depthWrite: false }));
  coreGlow.scale.setScalar(4.6);
  core.add(coreGlow);

  // Metallic ring + a thin light ring give the core a sense of scale.
  const metalRing = new Mesh(
    new TorusGeometry(2.05, 0.022, 12, 220),
    new MeshStandardMaterial({ color: 0xb4c2e0, metalness: 1, roughness: 0.25 })
  );
  metalRing.rotation.set(1.2, 0.2, 0);
  system.add(metalRing);
  const lightRing = new Mesh(
    new TorusGeometry(2.3, 0.006, 6, 240),
    new MeshBasicMaterial({ color: 0x2fd4ef, transparent: true, opacity: 0.45, blending: AdditiveBlending, depthWrite: false })
  );
  lightRing.rotation.set(1.35, -0.35, 0.3);
  system.add(lightRing);

  /* ---- Orbits + nodes ---- */
  const orbitQuats = ORBITS.map((o) => new Quaternion().setFromEuler(o.tilt));
  const flatToXZ = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0));
  const orbitRings = ORBITS.map((o, i) => {
    const ring = new Mesh(
      new TorusGeometry(o.radius, 0.005, 6, 256),
      new MeshBasicMaterial({ color: i ? 0x8b7cf6 : 0x6f9bff, transparent: true, opacity: 0.28, blending: AdditiveBlending, depthWrite: false })
    );
    ring.quaternion.copy(orbitQuats[i]).multiply(flatToXZ);
    system.add(ring);
    return ring;
  });

  const nodeGeo = new OctahedronGeometry(0.12, 0);
  const nodeMat = new MeshStandardMaterial({ color: 0xd6e2ff, metalness: 0.85, roughness: 0.18, emissive: 0x2a5bff, emissiveIntensity: 0.55 });
  const nodes = NODES.map((def) => {
    const g = new Group();
    const m = new Mesh(nodeGeo, nodeMat);
    const glow = new Sprite(new SpriteMaterial({ map: glowTex, color: def.orbit ? 0x8b7cf6 : 0x2fd4ef, transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(0.8);
    g.add(m, glow);
    system.add(g);
    return { ...def, group: g, mesh: m };
  });

  // Connections: core→node for every node, plus a spoke between paired nodes on the two orbits.
  const PAIRS = [[0, 4], [1, 5], [2, 6], [3, 7]];
  const segCount = NODES.length + PAIRS.length;
  const linePos = new Float32Array(segCount * 2 * 3);
  const lineCol = new Float32Array(segCount * 2 * 3);
  const cCore = new Color(0x7aa0ff).multiplyScalar(0.9);
  const cNode = new Color(0x2fd4ef).multiplyScalar(0.45);
  const cPair = new Color(0x8b7cf6).multiplyScalar(0.3);
  for (let s = 0; s < segCount; s++) {
    const a = s < NODES.length ? cCore : cPair;
    const b = s < NODES.length ? cNode : cPair;
    lineCol.set([a.r, a.g, a.b, b.r, b.g, b.b], s * 6);
  }
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', new BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new BufferAttribute(lineCol, 3));
  const lines = new LineSegments(lineGeo, new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false }));
  system.add(lines);

  // Data packets travelling along the core→node connections (both directions).
  const packetCount = NODES.length * 2;
  const packetPos = new Float32Array(packetCount * 3);
  const packetGeo = new BufferGeometry();
  packetGeo.setAttribute('position', new BufferAttribute(packetPos, 3));
  const packets = new Points(packetGeo, new PointsMaterial({ map: glowTex, color: 0xbfefff, size: 0.16, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false }));
  system.add(packets);

  /* ---- Ambient dust ---- */
  const dustPos = new Float32Array(q.dust * 3);
  for (let i = 0; i < q.dust; i++) {
    const r = 4 + Math.random() * 11;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.6, r * Math.cos(ph)], i * 3);
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
  const dust = new Points(dustGeo, new PointsMaterial({ map: glowTex, color: 0x8fb0ff, size: 0.07, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  /* ---- HTML labels (projected each frame) ---- */
  const labels = NODES.map((n) => {
    const el = document.createElement('span');
    el.className = 'scene__label';
    el.textContent = n.label;
    labelsRoot.appendChild(el);
    return el;
  });
  const labelWidths = new Array(labels.length).fill(0);
  document.fonts?.ready.then(() => labelWidths.fill(0));

  /* ---- State ---- */
  const target = { hero: 0, approach: 0, px: 0, py: 0 };
  const cur = { hero: 0, approach: 0, px: 0, py: 0 };
  let base = { x: 0, y: 0, s: 1 };
  let width = 1;
  let height = 1;
  let visible = true;
  let running = false;
  let raf = 0;
  let last = 0;
  let time = 0;
  let firstFrame = true;

  const tmp = new Vector3();
  const tmpB = new Vector3();
  const coreWorld = new Vector3();

  function layout() {
    const aspect = width / height;
    const halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * aspect;
    if (aspect >= 1.05) {
      base = { x: Math.min(halfW * 0.5, 4.9), y: 0.1, s: MathUtils.clamp(halfW / 7.6, 0.72, 0.98) };
    } else {
      base = { x: 0, y: halfH * 0.44, s: MathUtils.clamp(halfW / 3.9, 0.5, 0.85) };
    }
  }

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    layout();
    if (!running) render(0);
  }

  function nodePosition(n, spread, out) {
    const o = ORBITS[n.orbit];
    const th = n.phase + time * o.speed;
    out.set(Math.cos(th) * o.radius * spread, 0, Math.sin(th) * o.radius * spread);
    return out.applyQuaternion(orbitQuats[n.orbit]);
  }

  function render(dt) {
    time += dt;
    const k = Math.min(1, dt * 5);
    cur.hero += (target.hero - cur.hero) * k;
    cur.approach += (target.approach - cur.approach) * k;
    cur.px += (target.px - cur.px) * Math.min(1, dt * 3);
    cur.py += (target.py - cur.py) * Math.min(1, dt * 3);

    const p = smooth(0, 1, cur.hero);
    const a = cur.approach;

    // Hero → recede into the page; CTA → return to centre, brighter.
    rig.position.set(lerp(base.x, 0, p), lerp(base.y, 0.15, p), -p * 9 + a * 6.6);
    rig.scale.setScalar(base.s * (1 + a * 0.08));
    rig.rotation.x = cur.py * 0.16 + p * 0.5;
    rig.rotation.y = cur.px * 0.26;
    camera.position.x = cur.px * 0.35;
    camera.position.y = -cur.py * 0.25;
    camera.lookAt(0, 0, -2);

    system.rotation.y += dt * (0.06 + a * 0.12);
    gem.rotation.x -= dt * 0.25;
    gem.rotation.y -= dt * 0.35;
    shell.rotation.y += dt * 0.05;
    shellEdges.rotation.y = shell.rotation.y;
    cage.rotation.y -= dt * 0.03;
    cage.rotation.z += dt * 0.02;
    lightRing.rotation.z += dt * 0.1;
    metalRing.rotation.z -= dt * 0.05;

    const spread = 1 + p * 0.9 - a * 0.35;
    orbitRings.forEach((r) => r.scale.setScalar(spread));

    // Nodes, connections, packets.
    let v = 0;
    nodes.forEach((n, i) => {
      nodePosition(n, spread, tmp);
      n.group.position.copy(tmp);
      n.mesh.rotation.y += dt * 0.8;
      linePos.set([0, 0, 0, tmp.x, tmp.y, tmp.z], v);
      v += 6;
      const t1 = (time * 0.32 + i * 0.137) % 1;
      const t2 = 1 - ((time * 0.22 + i * 0.29) % 1);
      packetPos.set([tmp.x * t1, tmp.y * t1, tmp.z * t1], i * 6);
      packetPos.set([tmp.x * t2, tmp.y * t2, tmp.z * t2], i * 6 + 3);
    });
    PAIRS.forEach(([i, j]) => {
      const A = nodes[i].group.position;
      const B = nodes[j].group.position;
      linePos.set([A.x, A.y, A.z, B.x, B.y, B.z], v);
      v += 6;
    });
    lineGeo.attributes.position.needsUpdate = true;
    packetGeo.attributes.position.needsUpdate = true;

    // Energy rises as the visitor approaches the CTA.
    coreGlow.material.opacity = 0.55 + a * 0.4;
    coreGlow.scale.setScalar(4.6 + a * 2.2);
    rimCyan.intensity = 16 * (1 + a * 1.4);
    rimViolet.intensity = 12 * (1 + a * 0.8);
    lines.material.opacity = 0.7 - a * 0.35; // keep the CTA headline clean
    dust.scale.setScalar(1 - a * 0.42);
    dust.rotation.y += dt * (0.012 + a * 0.05);

    renderer.render(scene, camera);

    // Labels follow their nodes; fade as the core recedes and in the CTA.
    const labelAlpha = MathUtils.clamp(1 - p * 1.8, 0, 1) * (1 - a);
    rig.updateMatrixWorld();
    core.getWorldPosition(coreWorld);
    labels.forEach((el, i) => {
      if (labelAlpha <= 0.01) {
        if (el.style.opacity !== '0') el.style.opacity = '0';
        return;
      }
      nodes[i].group.getWorldPosition(tmpB);
      const depth = MathUtils.clamp((tmpB.z - coreWorld.z + 3.5) / 7, 0, 1);
      tmp.copy(tmpB).project(camera);
      // Keep labels fully on screen; widths are measured once (fonts settle after load).
      if (!labelWidths[i]) labelWidths[i] = el.offsetWidth;
      const half = labelWidths[i] / 2 + 8;
      const x = MathUtils.clamp((tmp.x * 0.5 + 0.5) * width, half, width - half);
      const y = (-tmp.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -190%)`;
      el.style.opacity = (labelAlpha * (0.3 + 0.7 * depth)).toFixed(3);
    });

    if (firstFrame) {
      firstFrame = false;
      onReady?.();
    }
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    render(dt);
  }

  function start() {
    if (running || !visible || document.hidden) return;
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
  start();

  return {
    update({ hero, approach, visible: vis }) {
      target.hero = hero;
      target.approach = approach;
      // Snap smoothing when the scene wakes so it doesn't animate from stale state.
      if (!visible && vis) {
        cur.hero = hero;
        cur.approach = approach;
      }
      visible = vis;
      if (visible) start();
      else stop();
    },
    setPointer(x, y) {
      target.px = x;
      target.py = y;
    },
  };
}
