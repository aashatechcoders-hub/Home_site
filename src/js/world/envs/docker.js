// 10 DOCKER — containers drop onto a host one by one, start up, then connect
// into a running application with traffic flowing between them.
export default function docker(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const host = K.moduleBox(6.4, 0.16, 3.2, { edge: K.C.blue, text: 'DOCKER HOST', labelH: 0.22, labelY: -0.3 });
  host.tag.position.z = 1.7;
  host.group.position.y = -2.1;
  host.group.userData.setGlow(0.25);
  group.add(host.group);

  const NAMES = ['FRONTEND', 'BACKEND', 'POSTGRES', 'REDIS', 'WORKER'];
  const H = 0.66;
  const containers = NAMES.map((name, i) => {
    const m = K.moduleBox(2.6, H, 1.3, { edge: i === 2 ? K.C.violet : K.C.cyan, text: name, labelH: 0.22, labelY: 0 });
    m.tag.position.z = 0.66;
    // Corrugated sides, like a shipping container.
    for (let k = -5; k <= 5; k++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.02, H * 0.86, 1.32), new THREE.MeshBasicMaterial({ color: 0x2a3a66 }));
      rib.position.x = k * 0.22;
      if (Math.abs(k) > 1) m.group.add(rib);
    }
    const y = -1.7 + i * (H + 0.12);
    m.group.position.set(-0.8, y + 6, 0);
    group.add(m.group);
    return { m, y, started: false, t: 0 };
  });

  // Network links on the right-hand side once everything is up.
  const railX = 1.0;
  const pts = containers.map((c) => new THREE.Vector3(railX, c.y, 0));
  const net = K.line([pts[0], pts[1], pts[2], pts[1], pts[3], pts[4], pts[1]], K.C.cyan, 0);
  group.add(net);
  const flow = K.polyline([pts[0], pts[1], pts[2], pts[1], pts[3], pts[4]]);
  const pkt = K.packet(K.C.cyan, 0.6);
  pkt.visible = false;
  group.add(pkt);

  const CMDS = ['docker build', 'docker image', 'docker compose up', 'container start'];
  const cmdLabels = CMDS.map((c, i) => {
    const lab = K.label(`$ ${c}`, { h: 0.22 });
    lab.position.set(3.4, 1.2 - i * 0.55, 0.2);
    lab.material.opacity = 0;
    group.add(lab);
    return lab;
  });

  K.bus?.addEventListener('docker:start', (e) => {
    const c = containers[e.detail];
    if (c) c.started = true;
  });

  return {
    group,
    update(dt, t, l) {
      containers.forEach((c, i) => {
        if (l > 0.12 + i * 0.08) c.started = true;
        if (c.started) c.t = Math.min(1, c.t + dt * 1.6);
        const e = K.ease(c.t);
        c.m.group.position.y = c.y + (1 - e) * 6;
        c.m.group.userData.setGlow(c.started ? 0.25 + (1 - e) * 0.8 : 0);
        c.m.group.visible = c.t > 0;
      });
      const all = containers.every((c) => c.t >= 1);
      net.material.opacity += ((all ? 0.7 : 0) - net.material.opacity) * Math.min(1, dt * 4);
      pkt.visible = all;
      if (all) flow.at((t * 0.25) % 1, pkt.position);
      cmdLabels.forEach((lab, i) => (lab.material.opacity = Math.min(1, lab.material.opacity + (l > 0.08 + i * 0.1 ? dt * 3 : 0))));
      group.rotation.y = -0.2 + Math.sin(t * 0.2) * 0.05;
    },
  };
}
