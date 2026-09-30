// 11 LINUX — a terminal floating in front of a quiet server room. Commands
// type out; rack lights blink; the stack Linux → Nginx → App → DB runs alongside.
export default function linux(K) {
  const { THREE } = K;
  const group = new THREE.Group();

  // Server racks receding into the fog.
  const rackGeo = new THREE.BoxGeometry(1.1, 3.4, 1.1);
  const rackMat = K.metal({ color: 0x0d1322, emissive: K.C.blue });
  const perSide = Math.round(7 * Math.max(0.6, K.q.instances));
  const leds = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < perSide; i++) {
      const rack = new THREE.Mesh(rackGeo, rackMat);
      const x = side * 4.6;
      const z = -1.5 - i * 1.5;
      rack.position.set(x, -0.3, z);
      rack.rotation.y = side * -0.25;
      group.add(rack);
      for (let k = 0; k < 14; k++) leds.push(x - side * 0.56, -1.7 + k * 0.2, z + (Math.random() - 0.5) * 0.7, Math.random());
    }
  }
  const ledCount = leds.length / 4;
  const lp = new Float32Array(ledCount * 3);
  const ls = new Float32Array(ledCount);
  for (let i = 0; i < ledCount; i++) {
    lp.set([leds[i * 4], leds[i * 4 + 1], leds[i * 4 + 2]], i * 3);
    ls[i] = leds[i * 4 + 3];
  }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  lGeo.setAttribute('aSeed', new THREE.BufferAttribute(ls, 1));
  const ledMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; varying float vOn; varying float vSeed;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vOn = step(0.35, fract(uTime * (0.4 + aSeed * 1.6) + aSeed * 7.0));
        vSeed = aSeed;
        gl_PointSize = 60.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vOn; varying float vSeed;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        vec3 c = vSeed > 0.93 ? vec3(1.0, 0.7, 0.3) : vec3(0.2, 0.85, 0.95);
        gl_FragColor = vec4(c, smoothstep(0.5, 0.1, d) * (0.2 + vOn * 0.8));
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Points(lGeo, ledMat));

  // The terminal.
  const LINES = [
    ['$ ssh production-server', '#eef1f7'],
    ['Welcome to Ubuntu 24.04 LTS', '#7c8598'],
    ['$ docker ps', '#eef1f7'],
    ['web  api  worker   Up 3 days', '#7c8598'],
    ['$ systemctl status app', '#eef1f7'],
    ['● app.service — active (running)', '#2fd4ef'],
    ['$ nginx -t', '#eef1f7'],
    ['syntax is ok · test is successful', '#2fd4ef'],
    ['$ df -h && free -m', '#eef1f7'],
    ['/dev/sda1 27% used · 5.1G free mem', '#7c8598'],
  ];
  const term = K.canvasPanel(4.2, 2.6, { res: 300 });
  term.mesh.position.set(-0.4, 0.2, 0.8);
  group.add(term.mesh);
  let shown = -1;
  let chars = 0;
  const drawTerm = (n, partial) => term.draw((g, w, h) => {
    g.fillStyle = 'rgba(6,8,12,0.94)';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(0, 0, w, 28);
    ['#ff5d6c', '#ffb547', '#2fd4ef'].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(18 + i * 18, 14, 5, 0, Math.PI * 2);
      g.fill();
    });
    g.font = '500 17px "JetBrains Mono", monospace';
    for (let i = 0; i <= n && i < LINES.length; i++) {
      const [text, color] = LINES[i];
      g.fillStyle = color;
      g.fillText(i === n ? text.slice(0, partial) : text, 16, 54 + i * 24);
    }
  });

  // Stack chain to the right.
  const STACK = ['LINUX', 'NGINX', 'APPLICATION', 'DATABASE'];
  const stack = STACK.map((s, i) => {
    const m = K.moduleBox(1.7, 0.5, 0.4, { edge: K.C.cyan, text: s, labelH: 0.2, labelY: 0 });
    m.tag.position.z = 0.21;
    m.group.position.set(3.1, -1.6 + i * 0.95, 1);
    group.add(m.group);
    return m;
  });
  const stackPath = K.polyline(stack.map((m) => m.group.position.clone()));
  group.add(K.line(stack.map((m) => m.group.position.clone()), K.C.cyan, 0.4));
  const pkt = K.packet(K.C.cyan, 0.5);
  group.add(pkt);

  let clock = 0;
  return {
    group,
    update(dt, t, l, active) {
      ledMat.uniforms.uTime.value = t;
      if (active) clock += dt;
      else if (l >= 1) clock = 99;
      // ~1.2s per command, output appears instantly.
      const perLine = 0.9;
      const n = Math.min(LINES.length - 1, Math.floor(clock / perLine));
      const within = clock - n * perLine;
      const isCmd = LINES[n][0].startsWith('$');
      const partial = isCmd ? Math.min(LINES[n][0].length, Math.floor(within * 28)) : LINES[n][0].length;
      if (n !== shown || partial !== chars) {
        shown = n;
        chars = partial;
        drawTerm(n, partial);
      }
      term.tick(t);
      stackPath.at((t * 0.3) % 1, pkt.position);
      stack.forEach((m) => m.group.userData.setGlow(Math.max(0.15, 1 - pkt.position.distanceTo(m.group.position))));
    },
  };
}
