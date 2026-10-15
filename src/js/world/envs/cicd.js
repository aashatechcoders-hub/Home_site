// 09 CI/CD — the centrepiece: eleven physical pipeline modules. A glowing
// deployment packet travels the whole line as the visitor scrolls, and the
// camera follows it. Every module it passes lights up and reports ✓.
export default function cicd(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const STAGES = ['CODE PUSH', 'GIT', 'BUILD', 'LINT', 'TEST', 'SECURITY SCAN', 'DOCKER BUILD', 'REGISTRY', 'DEPLOY', 'HEALTH CHECK', 'PRODUCTION'];
  const SPACING = 2.7;
  const x0 = -((STAGES.length - 1) * SPACING) / 2;
  const X = (i) => x0 + i * SPACING;

  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, (STAGES.length - 1) * SPACING, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: K.C.blue, transparent: true, opacity: 0.45 })
  );
  pipe.rotation.z = Math.PI / 2;
  group.add(pipe);
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 16), new THREE.MeshBasicMaterial({ color: K.C.cyan }));
  fill.rotation.z = Math.PI / 2;
  group.add(fill);

  const mods = STAGES.map((name, i) => {
    const last = i === STAGES.length - 1;
    const m = K.moduleBox(last ? 1.9 : 1.5, last ? 1.5 : 1.05, 1.05, { edge: last ? K.C.cyan : K.C.blue, text: name, labelH: 0.24 });
    m.group.position.set(X(i), 0, 0);
    const check = K.label('✓', { h: 0.34, color: '#2fd4ef', pill: false });
    check.position.set(0, -0.95, 0.4);
    check.material.opacity = 0;
    m.group.add(check);
    group.add(m.group);
    return { ...m, check, glow: 0 };
  });

  const pkt = K.packet(K.C.cyan, 1.2);
  group.add(pkt);
  const burst = K.glow(K.C.cyan, 0.1, 0.9);
  burst.position.set(X(STAGES.length - 1), 0, 0);
  group.add(burst);

  const floor = K.floorGrid(34, 34, K.C.blue, 0.1);
  floor.position.y = -1.6;
  group.add(floor);

  const prog = (l) => K.clamp01((l - 0.12) / 0.76);
  const px = (l) => X(0) + prog(l) * (X(STAGES.length - 1) - X(0));

  return {
    group,
    mobileScale: 0.8,
    frame(l, mobile) {
      const x = px(l);
      return mobile ? { pos: [x, 2.6, 13], target: [x, -2.2, 0] } : { pos: [x - 0.6, 2.9, 10.5], target: [x - 3.4, 0, 0] };
    },
    update(dt, t, l) {
      const p = prog(l);
      const x = px(l);
      pkt.position.set(x, 0.05 + Math.sin(t * 6) * 0.04, 0);
      fill.scale.y = Math.max(0.001, x - X(0));
      fill.position.x = (X(0) + x) / 2;
      mods.forEach((m, i) => {
        const passed = x >= X(i) - 0.05;
        const near = Math.max(0, 1 - Math.abs(x - X(i)) / 1.2);
        const target = Math.max(near, passed ? 0.35 : 0.06);
        m.glow += (target - m.glow) * Math.min(1, dt * 8);
        m.group.userData.setGlow(m.glow);
        m.group.position.y = near * 0.18;
        m.check.material.opacity += ((passed && i < STAGES.length - 1 ? 1 : 0) - m.check.material.opacity) * Math.min(1, dt * 8);
      });
      const live = K.range(p, 0.97, 1);
      burst.scale.setScalar(0.1 + live * 5 + Math.sin(t * 3) * 0.2 * live);
      burst.material.opacity = live * 0.8;
    },
  };
}
