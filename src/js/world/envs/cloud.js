// 12 CLOUD — a generic reference architecture: DNS and CDN at the edge, a load
// balancer, application servers in two availability zones, and managed data
// services behind. Requests flow from users to the database and back.
export default function cloud(K) {
  const { THREE } = K;
  const group = new THREE.Group();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const region = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(10, 4.6, 4.4)), K.lineMat(K.C.blue, 0.22));
  region.position.y = -0.9;
  group.add(region);
  const regionLab = K.label('REGION', { h: 0.2 });
  regionLab.position.set(-4.4, 1.6, 2.2);
  group.add(regionLab);

  const zone = (x, name) => {
    const z = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 3.6, 3.4)), K.lineMat(K.C.violet, 0.28));
    z.position.set(x, -1.1, 0);
    const lab = K.label(name, { h: 0.2, color: '#8b7cf6' });
    lab.position.set(x - 1.4, 0.95, 1.7);
    group.add(z, lab);
  };
  zone(-2.5, 'ZONE A');
  zone(2.5, 'ZONE B');

  const node = (text, pos, edge = K.C.cyan, size = [1.4, 0.5, 0.5]) => {
    const m = K.moduleBox(...size, { edge, text, labelH: 0.18, labelY: 0 });
    m.tag.position.z = size[2] / 2 + 0.01;
    m.group.position.copy(pos);
    group.add(m.group);
    return m;
  };
  const dns = node('DNS', V(-1.6, 3.4, 0));
  const cdn = node('CDN', V(1.6, 3.4, 0));
  const lb = node('LOAD BALANCER', V(0, 1.9, 0), K.C.cyan, [2.2, 0.5, 0.6]);
  const apps = [node('APP', V(-3.3, 0, 0)), node('APP', V(-1.7, 0, 0)), node('APP', V(1.7, 0, 0)), node('APP', V(3.3, 0, 0))];
  const db = node('DATABASE', V(-2.5, -2.3, 0), K.C.violet, [1.8, 0.6, 0.7]);
  const replica = node('REPLICA', V(2.5, -2.3, 0), K.C.violet, [1.8, 0.6, 0.7]);
  const cache = node('CACHE', V(0, -1.4, 0.8), K.C.blue);
  const storage = node('STORAGE', V(0, -2.6, -1), K.C.blue);
  const monitor = node('MONITORING', V(5.8, 0.4, 0), K.C.cyan, [1.7, 0.5, 0.5]);
  [[dns, cdn], [cdn, lb], [dns, lb], ...apps.map((a) => [lb, a]), [apps[1], db], [apps[0], db], [apps[2], replica], [apps[3], replica], [db, replica], [apps[1], cache], [apps[2], cache], [cache, storage], [monitor, apps[3]]]
    .forEach(([a, b]) => group.add(K.line([a.group.position, b.group.position], K.C.blue, 0.26)));

  // Users far above, sending requests.
  const routes = apps.map((a, i) => K.polyline([V(-1 + i * 0.7, 6, 0), dns.group.position, cdn.group.position, lb.group.position, a.group.position, (i < 2 ? db : replica).group.position]));
  const pkts = routes.map(() => {
    const p = K.packet(K.C.cyan, 0.5);
    group.add(p);
    return p;
  });
  const all = [dns, cdn, lb, ...apps, db, replica, cache, storage, monitor];

  return {
    group,
    update(dt, t) {
      pkts.forEach((p, i) => routes[i].at((t * 0.13 + i * 0.25) % 1, p.position));
      all.forEach((m) => {
        let g = 0.12;
        pkts.forEach((p) => (g = Math.max(g, 1 - p.position.distanceTo(m.group.position) / 1.1)));
        m.group.userData.setGlow(g);
      });
      group.rotation.y = Math.sin(t * 0.15) * 0.1 - 0.12;
    },
  };
}
