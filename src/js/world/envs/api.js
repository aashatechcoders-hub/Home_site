// 06 API — endpoint cards float above a request pipeline. Each request flies
// through six gates; failed auth stops at AUTH, bad input at VALIDATION, and
// every response ends with a status code.
export default function api(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const GATES = ['REQUEST', 'AUTH', 'VALIDATION', 'LOGIC', 'DATABASE', 'RESPONSE'];
  const gx = (i) => -4.5 + i * 1.8;
  const gates = GATES.map((name, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 10, 64), K.metal({ emissive: K.C.cyan }));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(gx(i), -0.6, 0);
    const lab = K.label(name, { h: 0.2 });
    lab.position.set(gx(i), -1.55, 0);
    group.add(ring, lab);
    return ring;
  });
  group.add(K.line([new THREE.Vector3(gx(0) - 0.8, -0.6, 0), new THREE.Vector3(gx(5) + 0.8, -0.6, 0)], K.C.blue, 0.3));

  const ENDPOINTS = [['GET', '/users'], ['POST', '/projects'], ['GET', '/projects/:id'], ['POST', '/orders']];
  const cards = ENDPOINTS.map(([m, p], i) => {
    const panel = K.canvasPanel(2.1, 0.6, { res: 90 });
    panel.draw((g, w, h) => {
      g.fillStyle = 'rgba(10,14,24,0.92)';
      g.fillRect(0, 0, w, h);
      g.font = '600 30px "JetBrains Mono", monospace';
      g.fillStyle = m === 'GET' ? '#2fd4ef' : '#8b7cf6';
      g.fillText(m, 16, h / 2 + 10);
      g.fillStyle = '#eef1f7';
      g.font = '500 30px "JetBrains Mono", monospace';
      g.fillText(p, 16 + (m.length + 1) * 19, h / 2 + 10);
    });
    const a = -0.9 + i * 0.6;
    panel.mesh.position.set(Math.sin(a) * 4.2, 1.6 + (i % 2) * 0.45, -Math.cos(a) * 1.6);
    panel.mesh.rotation.y = -a * 0.6;
    group.add(panel.mesh);
    return panel;
  });

  const STATUS = { 200: ['200 OK', '#2fd4ef'], 201: ['201 CREATED', '#2fd4ef'], 400: ['400 BAD REQUEST', '#ffb547'], 401: ['401 UNAUTHORIZED', '#ffb547'], 500: ['500 ERROR', '#ff5d6c'] };
  const statusLabels = {};
  Object.entries(STATUS).forEach(([code, [text, color]]) => {
    const lab = K.label(text, { h: 0.3, color });
    lab.position.set(gx(5) + 0.2, 0.35, 0);
    lab.material.opacity = 0;
    group.add(lab);
    statusLabels[code] = lab;
  });

  // Request pool driven by the HTML widget's traffic log (falls back to a local cycle).
  const pool = Array.from({ length: 6 }, () => {
    const p = K.packet(K.C.cyan, 0.6);
    p.visible = false;
    group.add(p);
    return { p, t: 0, status: 200, alive: false };
  });
  const cycle = [200, 201, 200, 400, 401, 201, 200, 500];
  let ci = 0;
  let sinceSpawn = 0;
  let external = false;
  const spawn = (status) => {
    const slot = pool.find((s) => !s.alive);
    if (!slot) return;
    Object.assign(slot, { t: 0, status, alive: true });
    slot.p.visible = true;
    slot.p.userData.setColor(K.C.cyan);
  };
  K.bus?.addEventListener('api:response', (e) => {
    external = true;
    spawn(e.detail);
  });
  let shown = null;
  let shownT = 0;
  const gateGlow = new Float32Array(gates.length);

  return {
    group,
    update(dt, t, l, active) {
      sinceSpawn += dt;
      if ((!external || !active) && sinceSpawn > 1.1) {
        sinceSpawn = 0;
        spawn(cycle[ci++ % cycle.length]);
      }
      pool.forEach((s) => {
        if (!s.alive) return;
        s.t += dt * 0.42;
        const stopAt = s.status === 401 ? 1 : s.status === 400 ? 2 : 99;
        const x = gx(0) - 0.8 + s.t * (gx(5) - gx(0) + 1.6);
        const gate = Math.round((x - gx(0)) / 1.8);
        if (gate >= stopAt && x >= gx(stopAt)) {
          // Rejected: stop at the gate, turn amber and fall away.
          s.p.userData.setColor(K.C.amber);
          s.p.position.set(gx(stopAt), s.p.position.y - dt * 1.8, 0);
          gateGlow[stopAt] = 1;
          if (s.p.position.y < -2.6) finish(s);
          return;
        }
        if (s.status === 500 && gate === 3) s.p.userData.setColor(K.C.red);
        else if (s.status === 500 && gate > 3) s.p.userData.setColor(K.C.cyan); // retried
        s.p.position.set(x, -0.6, 0);
        if (gate >= 0 && gate < gates.length && Math.abs(x - gx(gate)) < 0.3) gateGlow[gate] = 1;
        if (x > gx(5) + 0.8) finish(s);
      });
      gates.forEach((g, i) => {
        gateGlow[i] *= 1 - Math.min(1, dt * 3);
        g.material.emissiveIntensity = 0.15 + gateGlow[i] * 0.9;
      });
      shownT -= dt;
      Object.entries(statusLabels).forEach(([code, lab]) => {
        const on = shown === code && shownT > 0;
        lab.material.opacity += ((on ? 1 : 0) - lab.material.opacity) * Math.min(1, dt * 8);
      });
      cards.forEach((c, i) => {
        c.tick(t);
        c.mesh.position.y += Math.sin(t + i) * 0.0015;
      });
    },
  };

  function finish(s) {
    s.alive = false;
    s.p.visible = false;
    shown = String(s.status === 500 ? 500 : s.status);
    shownT = 1.2;
  }
}
