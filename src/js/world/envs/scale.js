// 16 SCALE — traffic grows and the system grows with it: 1 → 2 → 4 → 8
// servers behind a load balancer that spreads requests across them.
export default function scale(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const lb = K.moduleBox(2.6, 0.6, 0.7, { edge: K.C.cyan, text: 'LOAD BALANCER', labelH: 0.22, labelY: 0 });
  lb.tag.position.z = 0.36;
  lb.group.position.set(0, 2.1, 0);
  group.add(lb.group);

  const servers = Array.from({ length: 8 }, () => {
    const m = K.moduleBox(0.9, 1.3, 0.8, { edge: K.C.blue });
    for (let k = 0; k < 4; k++) {
      const led = K.glow(K.C.cyan, 0.16, 0.9);
      led.position.set(-0.28, -0.4 + k * 0.28, 0.42);
      m.group.add(led);
    }
    m.group.visible = false;
    group.add(m.group);
    return { m, x: 0, show: 0 };
  });

  const count = K.label('1 SERVER', { h: 0.4 });
  const labels = { 1: count };
  [2, 4, 8].forEach((n) => {
    labels[n] = K.label(`${n} SERVERS`, { h: 0.4 });
  });
  Object.values(labels).forEach((lab) => {
    lab.position.set(0, -2.4, 0.4);
    lab.material.opacity = 0;
    group.add(lab);
  });
  const WORDS = ['SCALE', 'RELIABILITY', 'PERFORMANCE'];
  const words = WORDS.map((w, i) => {
    const lab = K.label(w, { h: 0.34, color: '#2fd4ef' });
    lab.position.set(-3.2 + i * 3.2, 3.4, -0.5);
    lab.material.opacity = 0;
    group.add(lab);
    return lab;
  });

  const linkGeo = new THREE.BufferGeometry();
  const linkPos = new Float32Array(8 * 6);
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  const links = new THREE.LineSegments(linkGeo, K.lineMat(K.C.cyan, 0.35));
  group.add(links);

  const pool = Array.from({ length: 24 }, () => {
    const p = K.packet(K.C.cyan, 0.45);
    p.visible = false;
    group.add(p);
    return { p, t: 0, target: 0, alive: false, x0: 0 };
  });
  let rr = 0;
  let spawnAcc = 0;
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();

  return {
    group,
    update(dt, t, l) {
      const p = K.clamp01((l - 0.1) / 0.75);
      const n = [1, 2, 4, 8][Math.min(3, Math.floor(p * 4))];
      const spread = Math.min(8.4, n * 1.15);
      servers.forEach((s, i) => {
        const on = i < n;
        s.show += ((on ? 1 : 0) - s.show) * Math.min(1, dt * 5);
        s.m.group.visible = s.show > 0.02;
        const tx = n === 1 ? 0 : -spread / 2 + (i / Math.max(1, n - 1)) * spread;
        s.x += ((on ? tx : 0) - s.x) * Math.min(1, dt * 5);
        s.m.group.position.set(s.x, -0.6, 0);
        s.m.group.scale.setScalar(Math.max(0.001, s.show));
        linkPos.set(on ? [0, 1.8, 0, s.x, 0.05, 0] : [0, 1.8, 0, 0, 1.8, 0], i * 6);
      });
      linkGeo.attributes.position.needsUpdate = true;
      Object.entries(labels).forEach(([k, lab]) => {
        lab.material.opacity += ((+k === n ? 1 : 0) - lab.material.opacity) * Math.min(1, dt * 6);
      });
      words.forEach((w, i) => (w.material.opacity = K.range(p, 0.6 + i * 0.1, 0.75 + i * 0.1)));

      // Traffic grows with scroll; round-robin across live servers.
      spawnAcc += dt * (1.2 + p * 7);
      while (spawnAcc > 1) {
        spawnAcc -= 1;
        const slot = pool.find((s) => !s.alive);
        if (!slot) break;
        Object.assign(slot, { alive: true, t: 0, target: rr++ % n, x0: (Math.random() - 0.5) * 3 });
        slot.p.visible = true;
      }
      pool.forEach((s) => {
        if (!s.alive) return;
        s.t += dt * 0.9;
        const srv = servers[s.target];
        if (s.t < 0.5) {
          A.set(s.x0, 4.6, 0);
          B.set(0, 2.1, 0);
          s.p.position.lerpVectors(A, B, s.t / 0.5);
        } else {
          A.set(0, 2.1, 0);
          B.set(srv.x, -0.6, 0);
          s.p.position.lerpVectors(A, B, (s.t - 0.5) / 0.5);
        }
        if (s.t >= 1) {
          s.alive = false;
          s.p.visible = false;
          srv.m.group.userData.setGlow(0.9);
        }
      });
      servers.forEach((s) => s.m.group.userData.setGlow(Math.max(0.15, s.m.group.userData.glow - dt * 1.5)));
      lb.group.userData.setGlow(0.3 + p * 0.5);
    },
  };
}
