// 04 DEVELOPMENT — a developer workstation: editor, terminal, browser preview,
// API console and database console arranged around the viewer. Code grows
// line by line and the preview fills in as it does.
export default function development(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const desk = K.moduleBox(9.5, 0.1, 3.2, { edge: K.C.blue });
  desk.group.position.set(0, -2.1, 0.4);
  desk.group.userData.setGlow(0.25);
  group.add(desk.group);

  const P = (w, h, x, y, z, ry, name) => {
    const p = K.canvasPanel(w, h, { res: 220 });
    p.mesh.position.set(x, y, z);
    p.mesh.rotation.y = ry;
    group.add(p.mesh);
    const tag = K.label(name, { h: 0.2 });
    tag.position.set(x, y + h / 2 + 0.2, z);
    tag.rotation.y = ry;
    group.add(tag);
    return p;
  };
  const editor = P(3.8, 2.5, 0, 0, 0, 0, 'EDITOR');
  const term = P(2.3, 1.5, -3.7, -0.5, 0.9, 0.45, 'TERMINAL');
  const browser = P(2.6, 1.8, 3.8, -0.3, 0.9, -0.45, 'PREVIEW');
  const apiC = P(1.8, 1.0, -3.4, 1.55, 0.2, 0.35, 'API CONSOLE');
  const dbC = P(1.8, 1.0, 3.5, 1.65, 0.2, -0.35, 'DB CONSOLE');

  const STEPS = ['CODE', 'BUILD', 'RUN', 'TEST'];
  const steps = STEPS.map((s, i) => {
    const lab = K.label(s, { h: 0.26 });
    lab.position.set(-2.1 + i * 1.4, -1.75, 1.3);
    group.add(lab);
    return lab;
  });
  let devStep = 0;
  K.bus?.addEventListener('dev:step', (e) => (devStep = e.detail));

  let reveal = 0;
  let lastDraw = -1;
  const draw = () => {
    editor.draw((g, w, h) => K.drawCodeLines(g, w, h, { lines: 14, seed: 7, reveal }));
    term.draw((g, w, h) => {
      K.drawCodeLines(g, w, h, { lines: 7, seed: 3, reveal: Math.max(0, reveal * 1.3 - 0.3), colors: ['#2fd4ef', '#a7afc0'] });
    });
    browser.draw((g, w, h) => {
      g.fillStyle = 'rgba(12,16,28,0.95)';
      g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,0.08)';
      g.fillRect(0, 0, w, h * 0.1);
      if (reveal > 0.25) {
        g.fillStyle = '#eef1f7';
        g.fillRect(w * 0.08, h * 0.2, w * 0.35, h * 0.08);
      }
      const rows = Math.floor(K.range(reveal, 0.4, 0.9) * 4);
      for (let i = 0; i < rows; i++) {
        g.fillStyle = 'rgba(79,125,255,0.35)';
        g.fillRect(w * 0.08, h * (0.36 + i * 0.13), w * 0.84, h * 0.09);
      }
      if (reveal >= 1) {
        g.fillStyle = '#2fd4ef';
        g.fillRect(w * 0.64, h * 0.2, w * 0.28, h * 0.08);
      }
    });
    apiC.draw((g, w, h) => K.drawCodeLines(g, w, h, { lines: 5, seed: 11, reveal: K.range(reveal, 0.5, 1), colors: ['#2fd4ef', '#6d93ff'] }));
    dbC.draw((g, w, h) => K.drawCodeLines(g, w, h, { lines: 5, seed: 19, reveal: K.range(reveal, 0.6, 1), colors: ['#8b7cf6', '#a7afc0'] }));
  };
  draw();

  return {
    group,
    update(dt, t, l, active) {
      if (active) reveal = Math.min(1, reveal + dt / 6);
      else reveal = Math.max(reveal, l >= 1 ? 1 : 0);
      const q = Math.round(reveal * 28);
      if (q !== lastDraw) {
        lastDraw = q;
        draw();
      }
      [editor, term, browser, apiC, dbC].forEach((p) => p.tick(t));
      const cur = reveal >= 1 ? Math.max(devStep, 3) : devStep;
      steps.forEach((s, i) => (s.material.opacity = i <= cur ? 1 : 0.3));
      group.rotation.y = Math.sin(t * 0.12) * 0.05;
    },
  };
}
