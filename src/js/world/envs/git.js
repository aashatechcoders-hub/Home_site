// 08 GIT — a 3D branch graph. main runs straight; feature branches split off,
// carry commits and merge back. Commits travel along the branches.
export default function git(K) {
  const { THREE } = K;
  const group = new THREE.Group();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const main = new THREE.CatmullRomCurve3([V(-5.5, 0, 0), V(5.5, 0, 0)]);
  const auth = new THREE.CatmullRomCurve3([V(-4, 0, 0), V(-2.8, 1.5, 0.6), V(0, 1.8, 0.8), V(1.6, 1.3, 0.6), V(2.4, 0, 0)]);
  const pay = new THREE.CatmullRomCurve3([V(-1.6, 0, 0), V(-0.4, -1.5, -0.8), V(2.2, -1.7, -1), V(3.6, -1.1, -0.6), V(4.4, 0, 0)]);
  const tubes = [
    [main, 0.05, K.C.cyan],
    [auth, 0.035, K.C.blue],
    [pay, 0.035, K.C.violet],
  ].map(([curve, r, color]) => {
    const geo = new THREE.TubeGeometry(curve, 160, r, 8, false);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    group.add(mesh);
    return { curve, mesh, total: geo.index.count };
  });

  const commit = (curve, t, color, big) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(big ? 0.17 : 0.12, 20, 14), K.metal({ emissive: color }));
    m.material.emissiveIntensity = 0.7;
    curve.getPointAt(t, m.position);
    const halo = K.glow(color, big ? 0.9 : 0.6, 0.6);
    halo.position.copy(m.position);
    group.add(m, halo);
    return m;
  };
  [0.05, 0.2, 0.35, 0.85, 0.97].forEach((t) => commit(main, t, K.C.cyan));
  [0.3, 0.55].forEach((t) => commit(auth, t, K.C.blue));
  [0.35, 0.6].forEach((t) => commit(pay, t, K.C.violet));
  commit(main, 0.72, K.C.cyan, true); // merge feature/auth
  commit(main, 0.9, K.C.cyan, true); // merge feature/payments

  const L = (text, pos, color) => {
    const lab = K.label(text, { h: 0.24, color });
    lab.position.copy(pos);
    group.add(lab);
  };
  L('main', V(-5.5, -0.45, 0), '#2fd4ef');
  L('feature/auth', V(-0.2, 2.35, 0.8), '#6d93ff');
  L('feature/payments', V(1.2, -2.3, -1), '#8b7cf6');
  const MSGS = [['feat: add authentication', V(-2.2, 2.9, 0.4)], ['fix: resolve API validation', V(3.6, 1.2, 0)], ['test: add order coverage', V(3.2, -2.9, -0.8)], ['refactor: improve service layer', V(-3.4, -1.3, 0.2)]];
  const msgLabels = MSGS.map(([m, p]) => {
    const lab = K.label(m, { h: 0.2 });
    lab.position.copy(p);
    group.add(lab);
    return lab;
  });

  const movers = [[main, 0.12, K.C.cyan], [auth, 0.18, K.C.blue], [pay, 0.15, K.C.violet]].map(([curve, speed, color]) => {
    const p = K.packet(color, 0.55);
    group.add(p);
    return { p, curve, speed };
  });

  return {
    group,
    update(dt, t, l) {
      const grow = K.ease(K.range(l, 0, 0.45));
      tubes.forEach((tb, i) => tb.mesh.geometry.setDrawRange(0, Math.floor(tb.total * K.clamp01(grow * 1.4 - i * 0.2))));
      movers.forEach((m, i) => m.curve.getPointAt((t * m.speed + i * 0.3) % 1, m.p.position));
      msgLabels.forEach((lab, i) => (lab.material.opacity = K.range(l, 0.2 + i * 0.08, 0.35 + i * 0.08)));
      group.rotation.y = Math.sin(t * 0.18) * 0.12 - 0.1;
    },
  };
}
