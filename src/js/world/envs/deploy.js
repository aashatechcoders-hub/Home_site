// 13 DEPLOYMENT — a tunnel of light. The v2.4.0 release package travels
// LOCAL → STAGING → PRODUCTION as the visitor scrolls, with the camera riding
// behind it; production wakes up when it arrives.
export default function deploy(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const LEN = 24;
  const ringCount = Math.round(40 * Math.max(0.6, K.q.instances));
  const ringGeo = new THREE.TorusGeometry(2.3, 0.018, 6, 72);
  const rings = Array.from({ length: ringCount }, (_, i) => {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: K.C.blue, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.z = 2 - (i / (ringCount - 1)) * LEN;
    m.rotation.z = i * 0.2;
    group.add(m);
    return m;
  });

  // Longitudinal rails give the tunnel speed lines.
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    group.add(K.line([new THREE.Vector3(Math.cos(a) * 2.3, Math.sin(a) * 2.3, 2), new THREE.Vector3(Math.cos(a) * 2.3, Math.sin(a) * 2.3, 2 - LEN)], K.C.cyan, 0.12));
  }

  const GATES = [['LOCAL', 0], ['STAGING', -9.5], ['PRODUCTION', -19]];
  const gates = GATES.map(([name, z]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.06, 12, 96), K.metal({ emissive: K.C.cyan }));
    ring.position.z = z;
    const lab = K.label(name, { h: 0.34 });
    lab.position.set(0, 2.9, z);
    group.add(ring, lab);
    return { ring, z };
  });

  const pkg = K.moduleBox(0.7, 0.7, 0.7, { edge: K.C.cyan });
  pkg.group.userData.setGlow(1);
  const pkgGlow = K.glow(K.C.cyan, 2.4, 0.7);
  pkg.group.add(pkgGlow);
  const ver = K.label('v2.4.0', { h: 0.26, color: '#2fd4ef' });
  ver.position.set(0, 0.7, 0);
  pkg.group.add(ver);
  group.add(pkg.group);

  const screen = K.canvasPanel(4.4, 2.6, { res: 240 });
  screen.mesh.position.set(0, 0, -LEN + 0.5);
  group.add(screen.mesh);
  let drawnLive = null;
  const paint = (live) => screen.draw((g, w, h) => {
    g.fillStyle = live ? 'rgba(12,16,28,0.95)' : 'rgba(8,10,14,0.9)';
    g.fillRect(0, 0, w, h);
    if (!live) return;
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.fillRect(0, 0, w, h * 0.12);
    g.fillStyle = '#eef1f7';
    g.fillRect(w * 0.07, h * 0.22, w * 0.4, h * 0.1);
    g.fillStyle = '#4f7dff';
    g.fillRect(w * 0.07, h * 0.38, w * 0.2, h * 0.08);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = 'rgba(79,125,255,0.25)';
      g.fillRect(w * (0.07 + i * 0.3), h * 0.56, w * 0.26, h * 0.3);
    }
  });
  const success = K.label('DEPLOYMENT SUCCESSFUL', { h: 0.4, color: '#2fd4ef' });
  success.position.set(0, 1.9, -LEN + 0.6);
  group.add(success);

  const prog = (l) => K.clamp01((l - 0.1) / 0.72);
  const pz = (l) => 1 - K.ease(prog(l)) * (LEN - 4);

  return {
    group,
    mobileScale: 1,
    frame(l, mobile) {
      const z = pz(l);
      return mobile ? { pos: [0, 0.9, z + 7.5], target: [0, -1.4, z - 6] } : { pos: [0.6, 0.8, z + 7], target: [-1.3, 0, z - 6] };
    },
    update(dt, t, l) {
      const z = pz(l);
      pkg.group.position.set(0, Math.sin(t * 3) * 0.06, z);
      pkg.group.rotation.set(t * 0.6, t * 0.9, 0);
      ver.quaternion.copy(pkg.group.quaternion).invert();
      rings.forEach((r) => {
        const d = Math.abs(r.position.z - z);
        r.material.opacity = 0.14 + Math.max(0, 1 - d / 6) * 0.6;
        r.material.color.setHex(d < 2 ? K.C.cyan : K.C.blue);
      });
      gates.forEach((g) => (g.ring.material.emissiveIntensity = z <= g.z + 0.3 ? 0.9 : 0.15));
      const live = prog(l) > 0.97;
      if (live !== drawnLive) {
        drawnLive = live;
        paint(live);
      }
      screen.tick(t);
      success.material.opacity += ((live ? 1 : 0) - success.material.opacity) * Math.min(1, dt * 5);
    },
  };
}
