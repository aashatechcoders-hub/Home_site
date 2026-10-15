// 15 SECURITY — layered protection around a server core. Legitimate requests
// pass through; malformed or unauthorised ones are stopped at the outer layer.
// Each layer is a real practice, labelled — no "military-grade" theatrics.
export default function security(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const server = K.moduleBox(1.1, 1.1, 1.1, { edge: K.C.cyan });
  server.group.userData.setGlow(0.5);
  group.add(server.group);

  const inner = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.7, 1)), K.lineMat(K.C.cyan, 0.35));
  const glass = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 3), K.glassMaterial({ color: K.C.blue, opacity: 0.8 }));
  const outer = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.1, 0)), K.lineMat(K.C.violet, 0.3));
  group.add(inner, glass, outer);

  const PRACTICES = ['AUTHENTICATION', 'AUTHORISATION', 'INPUT VALIDATION', 'SECRETS', 'HTTPS', 'ACCESS CONTROL', 'BACKUPS', 'MONITORING'];
  const tags = PRACTICES.map((p, i) => {
    const lab = K.label(p, { h: 0.2 });
    const a = (i / PRACTICES.length) * Math.PI * 2;
    lab.userData.a = a;
    group.add(lab);
    return lab;
  });

  const shots = Array.from({ length: 7 }, (_, i) => {
    const p = K.packet(K.C.cyan, 0.55);
    group.add(p);
    return { p, t: Math.random(), dir: new THREE.Vector3(), bad: i % 3 === 0 };
  });
  const aim = (s) => {
    s.dir.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.7, Math.random() - 0.5).normalize();
    s.t = 0;
    s.bad = Math.random() < 0.3;
    s.p.userData.setColor(K.C.cyan);
  };
  shots.forEach(aim);

  const ripple = K.glow(K.C.red, 0.1, 0);
  group.add(ripple);
  let rippleT = 1;

  return {
    group,
    update(dt, t, l) {
      inner.rotation.y += dt * 0.12;
      outer.rotation.y -= dt * 0.06;
      outer.rotation.x += dt * 0.03;
      glass.rotation.y += dt * 0.04;
      tags.forEach((lab, i) => {
        const a = lab.userData.a + t * 0.08;
        lab.position.set(Math.cos(a) * 4.3, Math.sin(i * 1.3) * 1.3, Math.sin(a) * 2.2);
        lab.material.opacity = K.range(l, 0.05 + i * 0.04, 0.2 + i * 0.04) * (0.45 + 0.55 * K.clamp01((lab.position.z + 2.2) / 4.4));
      });
      shots.forEach((s) => {
        s.t += dt * 0.35;
        const r = 7 - s.t * 7;
        if (s.bad && r <= 3.1) {
          // Blocked at the outer layer.
          s.p.position.copy(s.dir).multiplyScalar(3.1);
          ripple.position.copy(s.p.position);
          ripple.material.opacity = 0.8;
          rippleT = 0;
          aim(s);
          return;
        }
        if (r <= 0.6) return aim(s);
        s.p.position.copy(s.dir).multiplyScalar(r);
        if (s.bad) s.p.userData.setColor(r < 4.2 ? K.C.red : K.C.amber);
      });
      rippleT = Math.min(1, rippleT + dt * 1.6);
      ripple.scale.setScalar(0.4 + rippleT * 1.8);
      ripple.material.opacity = (1 - rippleT) * 0.8;
    },
  };
}
