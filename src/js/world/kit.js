// Shared building blocks for every environment in the ATC engineering world:
// a consistent material language (dark metal, emissive edges, fresnel glass,
// holographic panels), canvas-texture labels and glowing data packets.
import * as THREE from 'three';

export { THREE };

export const C = {
  blue: 0x4f7dff,
  cyan: 0x2fd4ef,
  violet: 0x8b7cf6,
  white: 0xdfe8ff,
  red: 0xff5d6c,
  amber: 0xffb547,
  metal: 0x121a2e,
};

export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const range = (v, a, b) => clamp01((v - a) / (b - a));

/* ---------- Textures ---------- */
let glowTex = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

/* ---------- Shader materials (fog-aware) ---------- */
const fogUniforms = () => THREE.UniformsUtils.clone(THREE.UniformsLib.fog);

// Fresnel "glass": bright rim, near-transparent face.
export function glassMaterial({ color = C.blue, opacity = 1, power = 2.2 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...fogUniforms(), uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform vec3 uColor; uniform float uOpacity; uniform float uPower;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(vN, vV)), uPower);
        gl_FragColor = vec4(uColor * (0.35 + f * 1.8), (0.04 + f * 0.9) * uOpacity);
        #include <fog_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
}

// Holographic panel: texture + scanlines + edge glow + gentle flicker.
export function holoMaterial({ map, color = C.cyan, opacity = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...fogUniforms(),
      uMap: { value: map },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform sampler2D uMap; uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        float scan = 0.9 + 0.1 * sin(vUv.y * 380.0 - uTime * 3.0);
        vec2 e = min(vUv, 1.0 - vUv);
        float edge = 1.0 - smoothstep(0.0, 0.012, min(e.x, e.y));
        vec3 col = tex.rgb * scan + uColor * edge * 0.8;
        float a = max(tex.a * 0.92, edge * 0.7) * uOpacity * (0.97 + 0.03 * sin(uTime * 7.0));
        gl_FragColor = vec4(col, a);
        #include <fog_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
  });
}

export function metal({ color = C.metal, emissive = C.blue, rough = 0.32 } = {}) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: rough, emissive, emissiveIntensity: 0 });
}

export function lineMat(color = C.cyan, opacity = 0.5) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

/* ---------- Canvas labels ---------- */
const labelCache = new Map();
export function label(text, { h = 0.34, color = '#dfe8ff', bg = 'rgba(10,12,18,0.78)', border = 'rgba(160,190,255,0.28)', mono = true, weight = 500, pill = true } = {}) {
  const key = [text, h, color, bg, border, mono, weight, pill].join('|');
  let entry = labelCache.get(key);
  if (!entry) {
    const px = 44;
    const pad = pill ? px * 0.7 : 4;
    const font = `${weight} ${px}px ${mono ? '"JetBrains Mono", ui-monospace, monospace' : 'Manrope, system-ui, sans-serif'}`;
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = font;
    const w = Math.ceil(g.measureText(text).width + pad * 2);
    const hh = Math.ceil(px * 1.7);
    c.width = w;
    c.height = hh;
    g.font = font;
    if (pill) {
      g.fillStyle = bg;
      g.strokeStyle = border;
      g.lineWidth = 3;
      const r = hh / 2 - 2;
      g.beginPath();
      g.roundRect(2, 2, w - 4, hh - 4, r);
      g.fill();
      g.stroke();
    }
    g.fillStyle = color;
    g.textBaseline = 'middle';
    g.fillText(text, pad, hh / 2 + 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    entry = { tex, aspect: w / hh };
    labelCache.set(key, entry);
  }
  const mat = new THREE.MeshBasicMaterial({ map: entry.tex, transparent: true, depthWrite: false, fog: true });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(h * entry.aspect, h), mat);
  mesh.renderOrder = 5;
  return mesh;
}

/* ---------- Canvas-backed panels ---------- */
export function canvasPanel(w, h, { res = 256, holo = true, color = C.cyan } = {}) {
  const c = document.createElement('canvas');
  c.width = Math.round(res * (w / h));
  c.height = res;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = holo ? holoMaterial({ map: tex, color }) : new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  return {
    mesh,
    ctx,
    canvas: c,
    draw(fn) {
      ctx.clearRect(0, 0, c.width, c.height);
      fn(ctx, c.width, c.height);
      tex.needsUpdate = true;
    },
    tick(t) {
      if (mat.uniforms?.uTime) mat.uniforms.uTime.value = t;
    },
  };
}

// Abstract "code" lines drawn onto a panel.
export function drawCodeLines(g, w, h, { lines = 12, seed = 1, reveal = 1, colors = ['#6d93ff', '#2fd4ef', '#a7afc0', '#8b7cf6'] } = {}) {
  g.fillStyle = 'rgba(8,10,16,0.9)';
  g.fillRect(0, 0, w, h);
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const lh = h / (lines + 2);
  const shown = Math.floor(lines * reveal);
  for (let i = 0; i < shown; i++) {
    let x = w * 0.08 + Math.floor(rnd() * 3) * w * 0.05;
    const y = lh * (i + 1.2);
    const tokens = 1 + Math.floor(rnd() * 4);
    for (let k = 0; k < tokens; k++) {
      const tw = w * (0.06 + rnd() * 0.18);
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.globalAlpha = 0.85;
      g.fillRect(x, y, tw, lh * 0.42);
      x += tw + w * 0.02;
    }
  }
  g.globalAlpha = 1;
}

/* ---------- Geometry helpers ---------- */
// A "module": dark metal box with emissive edges and an optional label.
export function moduleBox(w, h, d, { edge = C.cyan, text, labelH = 0.28, labelY } = {}) {
  const group = new THREE.Group();
  const mat = metal({ emissive: edge });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const edgeMat = lineMat(edge, 0.35);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMat);
  group.add(mesh, edges);
  let tag = null;
  if (text) {
    tag = label(text, { h: labelH });
    tag.position.set(0, labelY ?? h / 2 + labelH * 0.9, d / 2 * 0.2);
    group.add(tag);
  }
  group.userData.glow = 0;
  group.userData.setGlow = (v) => {
    group.userData.glow = v;
    mat.emissiveIntensity = v * 0.9;
    edgeMat.opacity = 0.3 + v * 0.7;
  };
  return { group, mesh, edges, tag, mat, edgeMat };
}

export function glow(color = C.cyan, scale = 1, opacity = 0.8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(scale);
  return s;
}

export function packet(color = C.cyan, scale = 0.6) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale / 0.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const halo = glow(color, scale, 0.95);
  g.add(core, halo);
  g.userData.halo = halo;
  g.userData.setColor = (c) => halo.material.color.set(c);
  return g;
}

export function line(points, color = C.cyan, opacity = 0.45) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geo, lineMat(color, opacity));
}

// Evaluate a point at t∈[0,1] along a polyline by arc length.
export function polyline(points) {
  const lens = [0];
  for (let i = 1; i < points.length; i++) lens.push(lens[i - 1] + points[i].distanceTo(points[i - 1]));
  const total = lens[lens.length - 1];
  return {
    total,
    at(t, out = new THREE.Vector3()) {
      const d = clamp01(t) * total;
      let i = 1;
      while (i < lens.length - 1 && lens[i] < d) i++;
      const seg = (d - lens[i - 1]) / Math.max(1e-6, lens[i] - lens[i - 1]);
      return out.copy(points[i - 1]).lerp(points[i], seg);
    },
    // index of the segment start the point at t has passed
    segment(t) {
      const d = clamp01(t) * total;
      let i = 0;
      while (i < lens.length - 1 && lens[i + 1] <= d) i++;
      return i;
    },
  };
}

// Faint reference grid under an environment.
export function floorGrid(size = 16, div = 16, color = C.blue, opacity = 0.12) {
  const grid = new THREE.GridHelper(size, div, color, color);
  grid.material.transparent = true;
  grid.material.opacity = opacity;
  grid.material.depthWrite = false;
  grid.material.fog = true;
  return grid;
}

export function disposeGroup(group) {
  group.traverse((o) => {
    o.geometry?.dispose?.();
    const m = o.material;
    (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => mm.dispose?.());
  });
}
