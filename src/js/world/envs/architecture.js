// 02 ARCHITECTURE — a holographic system blueprint. A request travels
// client → frontend → gateway → backend → database and back; each component
// lights as it passes. Selecting a component in the panel highlights it here.
export default function architecture(K) {
  const { THREE } = K;
  const group = new THREE.Group();
  const board = new THREE.Group();
  board.rotation.x = -0.32;
  board.scale.setScalar(0.82);
  group.add(board);

  const grid = K.floorGrid(11, 22, K.C.blue, 0.14);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.4;
  board.add(grid);

  // Same order as the HTML component list.
  const LAYOUT = [
    ['CLIENT', -3.8, 2.1], ['FRONTEND', -1.3, 2.1], ['API GATEWAY', 1.2, 2.1], ['BACKEND', 1.2, 0],
    ['DATABASE', -1.3, -2.1], ['CACHE', 1.2, -2.1], ['QUEUE', 3.7, 0], ['WORKERS', 3.7, -2.1],
  ];
  const nodes = LAYOUT.map(([name, x, y]) => {
    const m = K.moduleBox(1.9, 0.72, 0.4, { edge: name === 'BACKEND' ? K.C.violet : K.C.cyan, text: name, labelH: 0.24, labelY: 0 });
    m.tag.position.z = 0.21;
    m.group.position.set(x, y, 0);
    board.add(m.group);
    return m;
  });
  const P = (i) => nodes[i].group.position.clone();
  const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [3, 6], [6, 7], [7, 4]];
  EDGES.forEach(([a, b]) => board.add(K.line([P(a), P(b)], K.C.cyan, 0.35)));

  // Request path and its response back.
  const route = [0, 1, 2, 3, 4, 3, 2, 1, 0].map(P);
  const path = K.polyline(route);
  const req = K.packet(K.C.cyan, 0.7);
  board.add(req);
  const bg = K.packet(K.C.violet, 0.5); // background job: backend → queue → workers
  board.add(bg);
  const bgPath = K.polyline([P(3), P(6), P(7), P(4)]);

  let focus = -1;
  K.bus?.addEventListener('arch:focus', (e) => (focus = e.detail));
  const glow = new Float32Array(nodes.length);
  const tmp = new THREE.Vector3();

  return {
    group,
    update(dt, t, l, active) {
      const tt = (t * 0.16) % 1;
      path.at(tt, req.position);
      req.userData.setColor(tt < 0.5 ? K.C.cyan : 0x9fffe0);
      bgPath.at((t * 0.12 + 0.5) % 1, bg.position);
      nodes.forEach((n, i) => {
        const near = Math.max(0, 1 - n.group.position.distanceTo(req.position) / 0.9);
        const target = Math.max(near, i === focus && active ? 0.9 : 0, 0.12);
        glow[i] += (target - glow[i]) * Math.min(1, dt * 8);
        n.group.userData.setGlow(glow[i]);
        n.group.position.z = glow[i] * 0.25;
      });
      board.rotation.y = Math.sin(t * 0.15) * 0.06;
      board.scale.setScalar(0.75 + K.ease(K.range(l, 0, 0.3)) * 0.07);
      void tmp;
    },
  };
}
