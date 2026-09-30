// 07 TESTING — a quality-control matrix. Hundreds of test cells run
// independently: pending → running → passed. One block fails, gets fixed and
// is re-run — BUILD → TEST → FIX → VERIFY.
export default function testing(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const cols = Math.round(20 * Math.max(0.6, K.q.instances));
  const rows = 6;
  const perRow = cols;
  const count = cols * rows;
  const size = 0.3;
  const gap = 0.1;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshLambertMaterial({ color: 0xffffff }), count);
  const width = cols * (size + gap);
  const m4 = new THREE.Matrix4();
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < perRow; c++) {
      const i = r * perRow + c;
      const x = -width / 2 + c * (size + gap) + 0.9;
      const y = 1.3 - r * (size + gap + 0.14);
      m4.makeTranslation(x, y, 0);
      mesh.setMatrixAt(i, m4);
      // Row 2 = integration suite; a cluster of it fails first time round.
      const fails = r === 2 && c > cols * 0.4 && c < cols * 0.62;
      cells.push({ x, y, start: 0.4 + r * 0.25 + Math.random() * 2.2, dur: 0.3 + Math.random() * 0.8, fails });
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  group.add(mesh);

  const SUITES = ['UNIT', 'API', 'INTEGRATION', 'SECURITY', 'BROWSER QA', 'MOBILE QA'];
  SUITES.forEach((s, r) => {
    const lab = K.label(s, { h: 0.22, pill: false });
    lab.position.set(-width / 2 + 0.35 - lab.geometry.parameters.width / 2, 1.3 - r * (size + gap + 0.14), 0);
    group.add(lab);
  });
  const status = K.label('TEST FAILED', { h: 0.34, color: '#ff5d6c' });
  status.position.set(0.9, 2.3, 0);
  group.add(status);
  const fixed = K.label('FIX APPLIED · TEST PASSED', { h: 0.34, color: '#2fd4ef' });
  fixed.position.copy(status.position);
  group.add(fixed);

  // Rising "test particles".
  const pc = 260;
  const pos = new Float32Array(pc * 3);
  for (let i = 0; i < pc; i++) pos.set([(Math.random() - 0.5) * width, -2 + Math.random() * 5, (Math.random() - 0.5) * 2], i * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ map: K.glowTexture(), color: 0x7fe6ff, size: 0.08, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })));

  const cPending = new THREE.Color(0x1a2445);
  const cRun = new THREE.Color(0x4f7dff);
  const cPass = new THREE.Color(0x2fd4ef);
  const cFail = new THREE.Color(0xff5d6c);
  const col = new THREE.Color();
  let clock = 0;
  const FIX_AT = 5.2;

  return {
    group,
    update(dt, t, l, active) {
      if (active) clock += dt;
      else if (l >= 1) clock = Math.max(clock, 9);
      cells.forEach((c, i) => {
        const run = clock - c.start;
        if (run < 0) col.copy(cPending);
        else if (run < c.dur) col.copy(cRun).lerp(cPass, 0.2 * Math.sin(t * 20 + i));
        else if (c.fails && clock < FIX_AT) col.copy(cFail);
        else if (c.fails && clock < FIX_AT + c.dur) col.copy(cRun);
        else col.copy(cPass);
        mesh.setColorAt(i, col);
      });
      mesh.instanceColor.needsUpdate = true;
      const failing = clock > 2.6 && clock < FIX_AT;
      status.material.opacity += ((failing ? 1 : 0) - status.material.opacity) * Math.min(1, dt * 6);
      const ok = clock > FIX_AT + 1.2;
      fixed.material.opacity += ((ok ? 1 : 0) - fixed.material.opacity) * Math.min(1, dt * 6);
      for (let i = 0; i < pc; i++) {
        pos[i * 3 + 1] += dt * (0.2 + (i % 5) * 0.08);
        if (pos[i * 3 + 1] > 3) pos[i * 3 + 1] = -2;
      }
      pGeo.attributes.position.needsUpdate = true;
      group.rotation.y = -0.18 + Math.sin(t * 0.2) * 0.05;
    },
  };
}
