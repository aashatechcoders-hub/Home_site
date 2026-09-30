// 14 MONITORING — a floating observability dashboard. Six live charts; a
// latency/error spike trips an anomaly, the team responds, graphs recover.
export default function monitoring(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const METRICS = [
    ['REQUESTS', 0.55, false], ['CPU', 0.4, false], ['MEMORY', 0.5, false],
    ['LATENCY', 0.3, true], ['ERROR RATE', 0.1, true], ['UPTIME', 0.92, false],
  ];
  const N = 40;
  const panels = METRICS.map(([name, base, spikes], i) => {
    const p = K.canvasPanel(2.5, 1.45, { res: 150 });
    const col = i % 3;
    const row = Math.floor(i / 3);
    const a = (col - 1) * 0.42;
    p.mesh.position.set(Math.sin(a) * 6, 0.95 - row * 1.8, -Math.cos(a) * 6 + 6);
    p.mesh.rotation.y = -a;
    group.add(p.mesh);
    return { p, name, base, spikes, data: Array.from({ length: N }, () => base + (Math.random() - 0.5) * 0.1), alert: false };
  });

  const status = K.label('ALL SYSTEMS NORMAL', { h: 0.34, color: '#2fd4ef' });
  const alarm = K.label('ANOMALY DETECTED', { h: 0.34, color: '#ff5d6c' });
  [status, alarm].forEach((s) => {
    s.position.set(0, 2.55, 0.4);
    group.add(s);
  });
  const FLOW = ['ALERT', 'INVESTIGATE', 'FIX', 'VERIFY'];
  const flow = FLOW.map((f, i) => {
    const lab = K.label(f, { h: 0.24 });
    lab.position.set(-2.55 + i * 1.7, -2.75, 0.4);
    lab.material.opacity = 0.25;
    group.add(lab);
    return lab;
  });

  function draw(pn) {
    pn.p.draw((g, w, h) => {
      g.fillStyle = 'rgba(8,10,16,0.92)';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = pn.alert ? 'rgba(255,93,108,0.9)' : 'rgba(79,125,255,0.35)';
      g.lineWidth = 3;
      g.strokeRect(1.5, 1.5, w - 3, h - 3);
      g.font = '500 15px "JetBrains Mono", monospace';
      g.fillStyle = '#a7afc0';
      g.fillText(pn.name, 14, 24);
      g.beginPath();
      pn.data.forEach((v, i) => {
        const x = 12 + (i / (N - 1)) * (w - 24);
        const y = h - 16 - Math.min(1, Math.max(0, v)) * (h - 50);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      });
      g.strokeStyle = pn.alert ? '#ff5d6c' : '#2fd4ef';
      g.lineWidth = 3;
      g.stroke();
    });
  }
  panels.forEach(draw);

  let acc = 0;
  let clock = 0;
  return {
    group,
    update(dt, t, l, active) {
      panels.forEach((pn) => pn.p.tick(t));
      if (!active) return;
      clock += dt;
      acc += dt;
      const phase = clock % 9;
      const spiking = phase > 2.2 && phase < 3.6;
      const anomaly = phase > 2.3 && phase < 5.4;
      if (acc > 0.12) {
        acc = 0;
        panels.forEach((pn) => {
          let v = pn.base + (Math.random() - 0.5) * 0.1;
          if (pn.spikes && spiking) v = pn.base + 0.55 + Math.random() * 0.1;
          pn.data.shift();
          pn.data.push(v);
          pn.alert = pn.spikes && anomaly;
          draw(pn);
        });
      }
      status.material.opacity += ((anomaly ? 0 : 1) - status.material.opacity) * Math.min(1, dt * 6);
      alarm.material.opacity += ((anomaly ? 1 : 0) - alarm.material.opacity) * Math.min(1, dt * 6);
      flow.forEach((f, i) => (f.material.opacity = phase > 2.4 + i * 0.75 && phase < 7.2 ? 1 : 0.25));
      group.rotation.y = Math.sin(t * 0.15) * 0.05;
    },
  };
}
