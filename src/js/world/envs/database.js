// 05 DATABASE — storage nodes as stacked metal platters. Queries travel
// application → API → PostgreSQL and back; cache hits short-circuit to Redis;
// a backup stream runs periodically to cold storage.
export default function database(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  function cylinder(r, discs, color) {
    const g = new THREE.Group();
    const mats = [];
    for (let i = 0; i < discs; i++) {
      const mat = K.metal({ emissive: color });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.34, 48), mat);
      disc.position.y = i * 0.44;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = i * 0.44 + 0.17;
      g.add(disc, ring);
      mats.push(mat);
    }
    g.userData.pulse = (v) => mats.forEach((m) => (m.emissiveIntensity = 0.1 + v * 0.8));
    return g;
  }

  const pg = cylinder(1.05, 4, K.C.cyan);
  pg.position.set(1.6, -1.2, 0);
  const redis = cylinder(0.62, 2, K.C.violet);
  redis.position.set(3.9, 0.2, -0.6);
  const backups = cylinder(0.55, 2, K.C.blue);
  backups.position.set(4.1, -2.2, 0.7);
  const storage = K.moduleBox(1.3, 0.9, 1.0, { edge: K.C.blue });
  storage.group.position.set(-0.6, -2.2, -1.4);
  const app = K.moduleBox(1.6, 0.7, 0.4, { edge: K.C.cyan, text: 'APPLICATION', labelH: 0.22 });
  app.group.position.set(-4, 0.6, 0.5);
  const api = K.moduleBox(1.2, 0.7, 0.4, { edge: K.C.cyan, text: 'API', labelH: 0.22 });
  api.group.position.set(-1.8, 0.6, 0.5);
  group.add(pg, redis, backups, storage.group, app.group, api.group);

  [['POSTGRESQL', pg, 2.2], ['REDIS', redis, 1.3], ['BACKUPS', backups, 1.3], ['STORAGE', storage.group, 0.8]].forEach(([t, o, dy]) => {
    const lab = K.label(t, { h: 0.24 });
    lab.position.copy(o.position).add(new THREE.Vector3(0, dy, 0.6));
    group.add(lab);
  });

  const V = (o, y = 0.8) => o.position.clone().add(new THREE.Vector3(0, y, 0));
  const routes = {
    query: K.polyline([app.group.position, api.group.position, V(pg, 1.9), api.group.position, app.group.position]),
    cache: K.polyline([api.group.position, V(redis, 0.9), api.group.position]),
    backup: K.polyline([V(pg, 0.6), V(backups, 0.6)]),
    files: K.polyline([api.group.position, V(storage.group, 0.3)]),
  };
  [[app.group.position, api.group.position, V(pg, 1.9)], [api.group.position, V(redis, 0.9)], [V(pg, 0.6), V(backups, 0.6)], [api.group.position, V(storage.group, 0.3)]]
    .forEach((pts) => group.add(K.line(pts, K.C.blue, 0.3)));

  const packets = {
    query: K.packet(K.C.cyan, 0.7),
    cache: K.packet(K.C.violet, 0.55),
    backup: K.packet(K.C.blue, 0.5),
    files: K.packet(K.C.cyan, 0.45),
  };
  Object.values(packets).forEach((p) => group.add(p));
  let pgPulse = 0;
  let redisPulse = 0;

  return {
    group,
    update(dt, t) {
      const q = (t * 0.22) % 1;
      routes.query.at(q, packets.query.position);
      if (Math.abs(q - 0.5) < 0.04) pgPulse = 1;
      const c = (t * 0.5 + 0.3) % 1;
      routes.cache.at(c, packets.cache.position);
      if (Math.abs(c - 0.5) < 0.06) redisPulse = 1;
      routes.backup.at((t * 0.15) % 1, packets.backup.position);
      routes.files.at((t * 0.3 + 0.6) % 1, packets.files.position);
      pgPulse *= 1 - Math.min(1, dt * 3);
      redisPulse *= 1 - Math.min(1, dt * 4);
      pg.userData.pulse(pgPulse);
      redis.userData.pulse(redisPulse);
      backups.userData.pulse(0.15);
      pg.rotation.y += dt * 0.2;
      redis.rotation.y -= dt * 0.3;
      api.group.userData.setGlow(0.3 + pgPulse * 0.5);
      app.group.userData.setGlow(0.3);
    },
  };
}
