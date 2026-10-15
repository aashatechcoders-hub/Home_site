// 01 DISCOVERY — a floating planning table. Requirement cards rise one by one,
// then settle into the table and connect into an architectural blueprint.
export default function discovery(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  const table = K.moduleBox(8.4, 0.14, 4.6, { edge: K.C.blue });
  table.group.position.y = -1.7;
  table.setGlow?.(0.2);
  group.add(table.group);

  const grid = K.floorGrid(7.8, 14, K.C.cyan, 0);
  grid.scale.z = 0.56;
  grid.position.y = -1.61;
  group.add(grid);

  const TITLES = ['PROJECT BRIEF', 'BUSINESS PROBLEM', 'USER REQUIREMENTS', 'TECHNICAL REQUIREMENTS'];
  const cards = TITLES.map((title, i) => {
    const p = K.canvasPanel(2.1, 1.3, { res: 200 });
    p.draw((g, w, h) => {
      g.fillStyle = 'rgba(10,14,24,0.92)';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#2fd4ef';
      g.font = '500 17px "JetBrains Mono", monospace';
      g.fillText(`0${i + 1}`, 18, 32);
      g.fillStyle = '#eef1f7';
      g.font = '700 19px Manrope, sans-serif';
      g.fillText(title, 18, 62);
      g.fillStyle = 'rgba(167,175,192,0.55)';
      [96, 118, 140, 162].forEach((y, k) => g.fillRect(18, y, (w - 60) * (1 - k * 0.18), 7));
    });
    group.add(p.mesh);
    return { p, x: -3.25 + i * 2.17 };
  });

  // Blueprint links between the settled cards.
  const pts = cards.map((c) => new THREE.Vector3(c.x, -1.55, 0));
  const links = K.line([pts[0], pts[1], pts[2], pts[3], new THREE.Vector3(pts[3].x, -1.55, 1.5), new THREE.Vector3(pts[0].x, -1.55, 1.5), pts[0]], K.C.cyan, 0);
  group.add(links);

  const done = K.label('DISCOVERY COMPLETE', { h: 0.36, color: '#2fd4ef' });
  done.position.set(0, 1.9, 0);
  group.add(done);

  return {
    group,
    update(dt, t, l) {
      cards.forEach((c, i) => {
        const appear = K.range(l, 0.06 + i * 0.07, 0.2 + i * 0.07);
        const settle = K.ease(K.range(l, 0.55, 0.8));
        const bob = Math.sin(t * 1.2 + i) * 0.06 * (1 - settle);
        c.p.mesh.position.set(c.x * (1 - settle * 0.05), THREE.MathUtils.lerp(-1.4 + appear * 1.8, -1.54, settle) + bob, settle * 0.1);
        c.p.mesh.rotation.x = THREE.MathUtils.lerp(-0.12, -Math.PI / 2, settle);
        c.p.mesh.material.uniforms.uOpacity.value = appear;
        c.p.tick(t);
      });
      grid.material.opacity = 0.08 + K.range(l, 0.5, 0.85) * 0.3;
      links.material.opacity = K.range(l, 0.7, 0.9) * 0.8;
      done.material.opacity = K.range(l, 0.8, 0.95);
      table.group.userData.setGlow(0.15 + K.range(l, 0.55, 0.9) * 0.5);
    },
  };
}
