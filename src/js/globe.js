import * as THREE from 'three';

export function initGlobe() {
  const container = document.getElementById('globe-canvas-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 220;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  } catch (e) {
    console.warn('WebGL not supported for 3D globe', e);
    return;
  }

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Core Globe Group
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Base Globe (Dark with subtle blue/cyan wireframe)
  const sphereRadius = 68;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, 36, 36);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x050d24,
    wireframe: true,
    transparent: true,
    opacity: 0.28
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(sphereMesh);

  // Inner Glow Core Sphere
  const innerGeo = new THREE.SphereGeometry(sphereRadius - 2, 24, 24);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x001d4a,
    transparent: true,
    opacity: 0.6
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerMesh);

  // City Nodes (Points on surface)
  const cityCount = 65;
  const cityPositions = [];
  const cityColors = [];
  const colorCyan = new THREE.Color(0x00d2ff);
  const colorGreen = new THREE.Color(0x00e676);
  const colorGold = new THREE.Color(0xffc837);

  for (let i = 0; i < cityCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / cityCount);
    const theta = Math.sqrt(cityCount * Math.PI) * phi;

    const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
    const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
    const z = sphereRadius * Math.cos(phi);

    cityPositions.push(x, y, z);

    // Pick color
    const rand = Math.random();
    if (rand > 0.8) {
      cityColors.push(colorGold.r, colorGold.g, colorGold.b);
    } else if (rand > 0.5) {
      cityColors.push(colorGreen.r, colorGreen.g, colorGreen.b);
    } else {
      cityColors.push(colorCyan.r, colorCyan.g, colorCyan.b);
    }
  }

  const cityGeo = new THREE.BufferGeometry();
  cityGeo.setAttribute('position', new THREE.Float32BufferAttribute(cityPositions, 3));
  cityGeo.setAttribute('color', new THREE.Float32BufferAttribute(cityColors, 3));

  const cityMat = new THREE.PointsMaterial({
    size: 3.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.95
  });
  const cityPoints = new THREE.Points(cityGeo, cityMat);
  globeGroup.add(cityPoints);

  // Orbital Rings (Inspired by ATC logo)
  const ring1Group = new THREE.Group();
  const ringGeo1 = new THREE.TorusGeometry(86, 0.7, 8, 80);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.55
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1Group.rotation.x = Math.PI / 3;
  ring1Group.rotation.y = Math.PI / 6;
  ring1Group.add(ring1);
  globeGroup.add(ring1Group);

  const ring2Group = new THREE.Group();
  const ringGeo2 = new THREE.TorusGeometry(96, 0.7, 8, 80);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0xffc837,
    transparent: true,
    opacity: 0.45
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2Group.rotation.x = -Math.PI / 3.5;
  ring2Group.rotation.y = -Math.PI / 4;
  ring2Group.add(ring2);
  globeGroup.add(ring2Group);

  // Satellite / Photon on Orbital Ring
  const photonGeo = new THREE.SphereGeometry(2.2, 12, 12);
  const photonMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
  const photon = new THREE.Mesh(photonGeo, photonMat);
  ring1Group.add(photon);

  // Data connection curves between cities
  const curveLinesGroup = new THREE.Group();
  for (let i = 0; i < 18; i++) {
    const idxA = Math.floor(Math.random() * cityCount) * 3;
    const idxB = Math.floor(Math.random() * cityCount) * 3;

    const pA = new THREE.Vector3(cityPositions[idxA], cityPositions[idxA + 1], cityPositions[idxA + 2]);
    const pB = new THREE.Vector3(cityPositions[idxB], cityPositions[idxB + 1], cityPositions[idxB + 2]);

    const mid = pA.clone().add(pB).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(sphereRadius * (1.15 + Math.random() * 0.15));

    const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
    const points = curve.getPoints(24);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
    const curveMat = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? 0x00d2ff : 0x00e676,
      transparent: true,
      opacity: 0.35
    });
    const line = new THREE.Line(curveGeo, curveMat);
    curveLinesGroup.add(line);
  }
  globeGroup.add(curveLinesGroup);

  // Position globe slightly to the right on desktop for visual balance
  function updateGlobePosition() {
    if (window.innerWidth > 992) {
      globeGroup.position.x = 42;
      globeGroup.position.y = 0;
    } else {
      globeGroup.position.x = 0;
      globeGroup.position.y = 15;
    }
  }
  updateGlobePosition();

  // Mouse Parallax Interaction
  let targetRotationY = 0;
  let targetRotationX = 0;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    mouseX = (e.clientX - halfW) / halfW;
    mouseY = (e.clientY - halfH) / halfH;
    targetRotationY = mouseX * 0.45;
    targetRotationX = mouseY * 0.3;
  });

  // Animation Loop
  let photonAngle = 0;
  function animate() {
    requestAnimationFrame(animate);

    // Continuous spin
    globeGroup.rotation.y += 0.0035;

    // Gentle cursor response
    globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y * 0.05) * 0.02;
    globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x * 0.05) * 0.02;

    // Rotate photon on orbit
    photonAngle += 0.035;
    photon.position.x = Math.cos(photonAngle) * 86;
    photon.position.y = Math.sin(photonAngle) * 86;

    renderer.render(scene, camera);
  }
  animate();

  // Window Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    updateGlobePosition();
  });
}
