// 03 UI/UX — a floating design workspace. Three screens morph from wireframe
// to design system to finished interface; components snap into the layout and
// a cursor works across the main screen.
export default function uiux(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const screens = [
    { w: 4.4, h: 2.7, pos: [0.2, 0.3, 0], rot: -0.12, kind: 'desktop' },
    { w: 1.7, h: 2.3, pos: [-3.4, -0.2, -1.2], rot: 0.35, kind: 'tablet' },
    { w: 1.05, h: 2.0, pos: [3.3, -0.5, 0.8], rot: -0.4, kind: 'phone' },
  ].map((s) => {
    const p = K.canvasPanel(s.w, s.h, { res: 240 });
    p.mesh.position.set(...s.pos);
    p.mesh.rotation.y = s.rot;
    group.add(p.mesh);
    return { ...s, p };
  });

  function paint(s, step) {
    s.p.draw((g, w, h) => {
      const polished = step >= 2;
      g.fillStyle = polished ? 'rgba(12,16,28,0.95)' : 'rgba(10,12,18,0.85)';
      g.fillRect(0, 0, w, h);
      const line = (x, y, ww, hh, fill) => {
        if (polished && fill) {
          g.fillStyle = fill;
          g.fillRect(x, y, ww, hh);
        } else {
          g.strokeStyle = 'rgba(167,175,192,0.55)';
          g.lineWidth = 2;
          g.setLineDash(polished ? [] : [6, 5]);
          g.strokeRect(x, y, ww, hh);
        }
      };
      const u = w / 24;
      const narrow = s.kind !== 'desktop';
      line(u, u, w - 2 * u, h * 0.1, 'rgba(79,125,255,0.25)');
      line(u, h * 0.18, narrow ? w - 2 * u : w * 0.55, h * 0.2, step >= 1 ? '#4f7dff' : 'rgba(79,125,255,0.4)');
      line(u, h * 0.42, narrow ? w * 0.5 : w * 0.22, h * 0.08, step >= 3 ? '#2fd4ef' : 'rgba(47,212,239,0.5)');
      const cols = narrow ? 1 : 3;
      for (let i = 0; i < cols; i++) {
        const cw = (w - 2 * u - (cols - 1) * u) / cols;
        line(u + i * (cw + u), h * 0.58, cw, h * 0.32, 'rgba(255,255,255,0.07)');
      }
      if (step === 1) {
        // design system swatches + type scale
        ['#4f7dff', '#2fd4ef', '#8b7cf6', '#eef1f7'].forEach((c, i) => {
          g.fillStyle = c;
          g.fillRect(w - (i + 1) * 3.2 * u, h * 0.44, 2.4 * u, 2.4 * u);
        });
      }
    });
  }

  // Components that fly in and snap into the main screen.
  const slots = [[-1.2, 0.55], [0.1, 0.55], [1.4, 0.55], [-1.2, -0.5], [0.1, -0.5], [1.4, -0.5]];
  const chips = slots.map(([x, y], i) => {
    const m = K.moduleBox(1.05, 0.34, 0.08, { edge: i === 1 ? K.C.cyan : K.C.blue });
    const start = new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6, 2 + Math.random() * 2);
    group.add(m.group);
    return { m, start, end: new THREE.Vector3(x + 0.2, y - 0.2, 0.12) };
  });

  const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  cursor.rotation.z = 0.5;
  group.add(cursor);

  let step = -1;
  let wanted = 0;
  K.bus?.addEventListener('uiux:step', (e) => (wanted = e.detail));

  return {
    group,
    update(dt, t, l, active) {
      const s = active ? wanted : Math.min(4, Math.floor(l * 5));
      if (s !== step) {
        step = s;
        screens.forEach((sc) => paint(sc, sc.kind === 'desktop' || step >= 4 ? step : Math.min(step, 1)));
      }
      screens.forEach((sc, i) => {
        sc.p.tick(t);
        sc.p.mesh.position.y = sc.pos[1] + Math.sin(t * 0.8 + i * 2) * 0.08;
      });
      const snap = K.ease(K.range(l, 0.15, 0.55));
      chips.forEach((c, i) => {
        c.m.group.position.lerpVectors(c.start, c.end, K.ease(K.range(snap, i * 0.08, 0.5 + i * 0.08)));
        c.m.group.rotation.set((1 - snap) * i, (1 - snap) * 1.3, 0);
        c.m.group.userData.setGlow(0.2 + (i === 1 && step >= 3 ? 0.8 : 0));
      });
      const a = t * 0.9;
      cursor.position.set(Math.sin(a) * 1.6 + 0.3, Math.sin(a * 1.7) * 0.8 + 0.2, 0.3);
    },
  };
}
