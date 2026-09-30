// ATC ENGINEERING CORE — the hero object. Thousands of particles assemble into
// the structure on load; ten capability nodes orbit and exchange data; the
// connections nearest the cursor light up.
import * as K from './kit.js';
import logoUrl from '../../assets/logo-atc-core.jpg';

const { THREE } = K;

const NODES = [
  ['Web', 0], ['AI', 0], ['Database', 0], ['DevOps', 0], ['Security', 0],
  ['Mobile', 1], ['Backend', 1], ['API', 1], ['Automation', 1], ['Cloud', 1],
];
const ORBITS = [
  { r: 3.0, tilt: new THREE.Euler(0.42, 0, 0.22), speed: 0.085 },
  { r: 3.65, tilt: new THREE.Euler(-0.55, 0, -0.36), speed: -0.055 },
];

// The ATC logo, drawn additively: its black background disappears and only
// the artwork glows inside the glass core.
function logoTexture() {
  const tex = new THREE.TextureLoader().load(logoUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function assemblyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uP: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 0.035 }, // world units
      uScale: { value: 1 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color(0x9cc4ff) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aStart; attribute float aSeed;
      uniform float uP, uTime, uSize, uScale;
      varying float vA;
      void main() {
        float k = clamp((uP - aSeed * 0.45) / 0.55, 0.0, 1.0);
        k = k * k * (3.0 - 2.0 * k);
        vec3 p = mix(aStart, position, k);
        p += 0.035 * vec3(sin(uTime * 0.8 + aSeed * 40.0), cos(uTime * 0.7 + aSeed * 31.0), sin(uTime * 0.6 + aSeed * 23.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = min(uSize * uScale * (0.6 + aSeed * 0.8) / -mv.z, 6.0);
        gl_Position = projectionMatrix * mv;
        // Fade anything close to the lens so particles never flood the screen.
        vA = mix(0.15, 1.0, k) * smoothstep(2.0, 6.0, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * vA * uOpacity * 0.85);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createCore(kit, { labelsRoot, particles = 3000 }) {
  const group = new THREE.Group();
  const rig = new THREE.Group();
  group.add(rig);

  /* Particle structure: targets on the edges of a geodesic frame + the two orbits */
  const frameGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.75, 1));
  const ep = frameGeo.attributes.position.array;
  const segs = ep.length / 6;
  const target = new Float32Array(particles * 3);
  const startP = new Float32Array(particles * 3);
  const seeds = new Float32Array(particles);
  const v = new THREE.Vector3();
  const qA = new THREE.Quaternion().setFromEuler(ORBITS[0].tilt);
  const qB = new THREE.Quaternion().setFromEuler(ORBITS[1].tilt);
  for (let i = 0; i < particles; i++) {
    const r = Math.random();
    if (r < 0.62) {
      const s = (Math.random() * segs) | 0;
      const t = Math.random();
      v.set(ep[s * 6] + (ep[s * 6 + 3] - ep[s * 6]) * t, ep[s * 6 + 1] + (ep[s * 6 + 4] - ep[s * 6 + 1]) * t, ep[s * 6 + 2] + (ep[s * 6 + 5] - ep[s * 6 + 2]) * t);
    } else {
      const o = r < 0.81 ? 0 : 1;
      const a = Math.random() * Math.PI * 2;
      v.set(Math.cos(a) * ORBITS[o].r, (Math.random() - 0.5) * 0.04, Math.sin(a) * ORBITS[o].r).applyQuaternion(o ? qB : qA);
    }
    target.set([v.x, v.y, v.z], i * 3);
    const rr = 6 + Math.random() * 9;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    // Start in a shell around the core but behind the camera plane (camera sits at z≈13–19).
    startP.set([rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th) * 0.7, Math.min(4, rr * Math.cos(ph))], i * 3);
    seeds[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(target, 3));
  pGeo.setAttribute('aStart', new THREE.BufferAttribute(startP, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const pMat = assemblyMaterial();
  const cloud = new THREE.Points(pGeo, pMat);
  cloud.frustumCulled = false;
  rig.add(cloud);

  /* Core body: dark faceted metal, fresnel glass shell, geodesic frame, ATC mark */
  const body = new THREE.Group();
  rig.add(body);
  const gem = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 0),
    new THREE.MeshStandardMaterial({ color: 0x1d2c5c, metalness: 0.9, roughness: 0.2, flatShading: true, emissive: 0x0b1d52, emissiveIntensity: 0.7 })
  );
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 3), K.glassMaterial({ color: 0x6f9bff, opacity: 0.9 }));
  const frame = new THREE.LineSegments(frameGeo, K.lineMat(0x6f9bff, 0.3));
  const mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: logoTexture(), transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
  mark.scale.set(2.7, 1.8, 1); // logo is 3:2
  mark.renderOrder = 10;
  gem.visible = false; // the logo is the heart of the core now
  const coreGlow = K.glow(K.C.blue, 4.2, 0.35);
  body.add(gem, shell, frame, mark, coreGlow);

  const metalRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.02, 12, 220), new THREE.MeshStandardMaterial({ color: 0xb4c2e0, metalness: 1, roughness: 0.25 }));
  metalRing.rotation.set(1.2, 0.2, 0);
  const lightRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.006, 6, 240), new THREE.MeshBasicMaterial({ color: K.C.cyan, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  lightRing.rotation.set(1.35, -0.35, 0.3);
  rig.add(metalRing, lightRing);

  const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  ORBITS.forEach((o, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(o.r, 0.005, 6, 256), new THREE.MeshBasicMaterial({ color: i ? K.C.violet : 0x6f9bff, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.quaternion.copy(i ? qB : qA).multiply(flat);
    rig.add(ring);
  });

  /* Holographic code panels orbiting the core */
  const holos = [0, 1, 2].map((i) => {
    const p = K.canvasPanel(1.5, 0.95, { res: 160 });
    p.draw((g, w, h) => K.drawCodeLines(g, w, h, { lines: 7, seed: i * 17 + 3 }));
    p.mesh.material.uniforms.uOpacity.value = 0.75;
    rig.add(p.mesh);
    return { p, a: (i / 3) * Math.PI * 2, y: [0.9, -1.1, 0.2][i], r: [2.6, 2.9, 3.3][i] };
  });

  /* Capability nodes */
  const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xd6e2ff, metalness: 0.85, roughness: 0.18, emissive: 0x2a5bff, emissiveIntensity: 0.55 });
  const nodes = NODES.map(([name, orbit], i) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(nodeGeo, nodeMat);
    const halo = K.glow(orbit ? K.C.violet : K.C.cyan, 0.8, 0.7);
    g.add(m, halo);
    rig.add(g);
    const el = document.createElement('span');
    el.className = 'scene__label';
    el.textContent = name;
    labelsRoot?.appendChild(el);
    const idx = orbit ? i - 5 : i;
    return { name, orbit, phase: (idx / 5) * Math.PI * 2 + orbit * 0.6, g, m, halo, el, w: 0, sx: 0, sy: 0 };
  });

  // Connections: core→node, ring neighbours, and cross-orbit pairs.
  const pairs = [];
  nodes.forEach((_, i) => pairs.push([-1, i]));
  for (let o = 0; o < 2; o++) for (let k = 0; k < 5; k++) pairs.push([o * 5 + k, o * 5 + ((k + 1) % 5)]);
  for (let k = 0; k < 5; k++) pairs.push([k, 5 + k]);
  const lp = new Float32Array(pairs.length * 6);
  const lc = new Float32Array(pairs.length * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  lGeo.setAttribute('color', new THREE.BufferAttribute(lc, 3));
  const lines = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  rig.add(lines);
  const cBase = new THREE.Color(0x3d64c8);
  const cRing = new THREE.Color(0x3a3470);
  const cHot = new THREE.Color(0x7fe6ff);
  const cTmp = new THREE.Color();

  // Packets: every core↔node spoke plus the cross pairs.
  const packetPairs = pairs.filter(([a]) => a === -1).concat(pairs.slice(-5));
  const pp = new Float32Array(packetPairs.length * 3);
  const pGeo2 = new THREE.BufferGeometry();
  pGeo2.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const packets = new THREE.Points(pGeo2, new THREE.PointsMaterial({ map: K.glowTexture(), color: 0xbfefff, size: 0.2, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  rig.add(packets);

  let assemble = 0;
  let hot = -1;
  const heat = new Float32Array(nodes.length);
  const P = (i, out) => (i < 0 ? out.set(0, 0, 0) : out.copy(nodes[i].g.position));
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const W = new THREE.Vector3();
  const camPos = new THREE.Vector3();

  function update(dt, time, { heroP, cta, px, py }, camera, width, height, mobile) {
    assemble = Math.min(1, assemble + dt / 3.4);
    const ap = K.ease(assemble);
    pMat.uniforms.uP.value = ap;
    pMat.uniforms.uTime.value = time;
    // Pixels per world unit at distance 1 (same maths as the camera projection).
    pMat.uniforms.uScale.value = (height * renderer_dpr()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    mark.material.opacity = K.range(assemble, 0.55, 1) * 0.95;

    const spread = 1 + heroP * 0.8 - cta * 0.25;
    rig.rotation.y += dt * (0.06 + cta * 0.1);
    rig.rotation.x = py * 0.12;
    gem.rotation.x -= dt * 0.25;
    gem.rotation.y -= dt * 0.35;
    frame.rotation.y -= dt * 0.04;
    lightRing.rotation.z += dt * 0.1;
    metalRing.rotation.z -= dt * 0.05;
    coreGlow.material.opacity = 0.28 + cta * 0.15 + ap * 0.07;
    coreGlow.scale.setScalar(4.6 + cta * 1.2);
    // In the final CTA the headline sits on top of the core: keep structure, drop clutter.
    lines.material.opacity = 0.85 - cta * 0.55;
    // Fade as the camera passes through the core on the way into the journey.
    camera.getWorldPosition(camPos);
    const near = K.clamp01((camPos.distanceTo(group.position) - 2) / 5);
    pMat.uniforms.uOpacity.value = near;
    body.visible = near > 0.05;

    nodes.forEach((n) => {
      const o = ORBITS[n.orbit];
      const th = n.phase + time * o.speed;
      n.g.position.set(Math.cos(th) * o.r * spread, 0, Math.sin(th) * o.r * spread).applyQuaternion(n.orbit ? qB : qA);
      n.m.rotation.y += dt * 0.8;
      n.g.scale.setScalar(ap);
    });

    holos.forEach((h, i) => {
      const a = h.a + time * 0.07 * (i % 2 ? -1 : 1);
      h.p.mesh.position.set(Math.cos(a) * h.r * spread, h.y, Math.sin(a) * h.r * spread);
      h.p.mesh.quaternion.copy(camera.quaternion);
      h.p.tick(time);
      h.p.mesh.material.uniforms.uOpacity.value = 0.65 * ap * (1 - cta);
      h.p.mesh.visible = !mobile; // phones: keep the core legible
    });

    // Screen-space positions → labels + nearest node to the cursor.
    rig.updateMatrixWorld();
    const labelAlpha = K.clamp01(1 - heroP * 2) * (1 - cta) * K.range(assemble, 0.7, 1);
    let best = -1;
    let bestD = 170;
    const mx = (px * 0.5 + 0.5) * width;
    const my = (py * 0.5 + 0.5) * height;
    nodes.forEach((n, i) => {
      n.g.getWorldPosition(W);
      const depth = K.clamp01((W.z - group.position.z + 3.6) / 7.2);
      A.copy(W).project(camera);
      n.sx = (A.x * 0.5 + 0.5) * width;
      n.sy = (-A.y * 0.5 + 0.5) * height;
      const dd = Math.hypot(n.sx - mx, n.sy - my);
      if (dd < bestD && depth > 0.35) {
        bestD = dd;
        best = i;
      }
      if (!labelsRoot) return;
      if (labelAlpha <= 0.01) {
        if (n.el.style.opacity !== '0') n.el.style.opacity = '0';
        return;
      }
      if (!n.w) n.w = n.el.offsetWidth;
      const half = n.w / 2 + 8;
      const x = Math.min(width - half, Math.max(half, n.sx));
      n.el.style.transform = `translate3d(${x.toFixed(1)}px, ${n.sy.toFixed(1)}px, 0) translate(-50%, -190%)`;
      n.el.style.opacity = (labelAlpha * (0.3 + 0.7 * depth)).toFixed(3);
    });
    if (best !== hot) {
      if (hot >= 0) nodes[hot].el.classList.remove('is-hot');
      hot = best;
      if (hot >= 0) nodes[hot].el.classList.add('is-hot');
    }
    nodes.forEach((n, i) => {
      heat[i] += ((i === hot ? 1 : 0) - heat[i]) * Math.min(1, dt * 6);
      n.halo.scale.setScalar(0.8 + heat[i] * 0.7);
    });

    pairs.forEach(([a, b], k) => {
      P(a, A);
      P(b, B);
      lp.set([A.x, A.y, A.z, B.x, B.y, B.z], k * 6);
      const h = Math.max(a >= 0 ? heat[a] : 0, heat[b]);
      cTmp.copy(a < 0 || b - a === 5 ? cBase : cRing).lerp(cHot, h).multiplyScalar(ap);
      lc.set([cTmp.r, cTmp.g, cTmp.b, cTmp.r, cTmp.g, cTmp.b], k * 6);
    });
    lGeo.attributes.position.needsUpdate = true;
    lGeo.attributes.color.needsUpdate = true;

    packetPairs.forEach(([a, b], k) => {
      P(a, A);
      P(b, B);
      const t = (time * (0.28 + (k % 3) * 0.05) + k * 0.137) % 1;
      const tt = k % 2 ? 1 - t : t;
      A.lerp(B, tt);
      pp.set([A.x, A.y, A.z], k * 3);
    });
    pGeo2.attributes.position.needsUpdate = true;
    packets.material.opacity = 0.95 * ap;
  }

  let dprCache = window.devicePixelRatio || 1;
  function renderer_dpr() {
    return Math.min(dprCache, 1.75);
  }

  return {
    group,
    update,
    hideLabels() {
      nodes.forEach((n) => {
        if (n.el.style.opacity !== '0') n.el.style.opacity = '0';
      });
    },
  };
}
