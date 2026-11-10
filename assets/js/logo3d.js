/* =========================================================
   NUTE — 3D logo stage
   The two shapes below are the exact path data of the official
   NUTE mark (assets/img/nute-mark-source.svg, viewBox 318×384).
   They are extruded as-is: proportions are never altered.
   ========================================================= */
import * as THREE from '../vendor/three.module.min.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const ORANGE = 0xF75006;
const BLACK = 0x000000;

// Mark coordinates → world units: centred, Y flipped, height = 2.
const CX = 159, CY = 192, K = 1 / 192;
const P = (x, y) => [(x - CX) * K, -(y - CY) * K];

function shapeBody() {
  // M31.5311 13.1274 C123.035 51.2235 277.588 168.262 317.534 383.1 H270.641
  // C238.69 211.264 127.809 113.766 45.5535 70.1285 V383.398 H0 V0 L31.5311 13.1274Z
  const s = new THREE.Shape();
  s.moveTo(...P(31.5311, 13.1274));
  s.bezierCurveTo(...P(123.035, 51.2235), ...P(277.588, 168.262), ...P(317.534, 383.1));
  s.lineTo(...P(270.641, 383.1));
  s.bezierCurveTo(...P(238.69, 211.264), ...P(127.809, 113.766), ...P(45.5535, 70.1285));
  s.lineTo(...P(45.5535, 383.398));
  s.lineTo(...P(0, 383.398));
  s.lineTo(...P(0, 0));
  s.lineTo(...P(31.5311, 13.1274));
  return s;
}
function shapeTriangle() {
  // M312.477 0.0625 H87.9844 C141.428 36.5847 284.49 136.336 312.477 243.163 V0.0625Z
  const s = new THREE.Shape();
  s.moveTo(...P(312.477, 0.0625));
  s.lineTo(...P(87.9844, 0.0625));
  s.bezierCurveTo(...P(141.428, 36.5847), ...P(284.49, 136.336), ...P(312.477, 243.163));
  s.lineTo(...P(312.477, 0.0625));
  return s;
}

function canUseWebGL() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if ((navigator.hardwareConcurrency || 8) <= 2) return false;
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return false;
  if (navigator.connection && navigator.connection.saveData) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/**
 * Create the stage. GSAP animates the returned `rig`:
 *  x, y   : position as a fraction of the viewport (-0.5 … 0.5)
 *  size   : logo height as a fraction of the viewport height
 *  rx,ry,rz : extra rotation (radians) on top of the idle motion
 *  opacity: 0 … 1
 */
export function createLogoStage(stageEl) {
  const rig = { x: 0, y: 0, size: 0.42, rx: 0, ry: 0, rz: 0, opacity: 1 };
  const fallbackImg = stageEl.querySelector('.stage__fallback');

  if (!canUseWebGL()) {
    stageEl.classList.add('is-fallback');
    const tick = () => {
      const vw = innerWidth, vh = innerHeight;
      const h = rig.size * Math.min(vh, vw * 1.25);
      fallbackImg.style.width = (h * 318 / 384) + 'px';
      fallbackImg.style.left = (50 + rig.x * 100) + '%';
      fallbackImg.style.top = (50 - rig.y * 100) + '%';
      fallbackImg.style.opacity = rig.opacity;
      fallbackImg.style.transform = `translate(-50%,-50%) rotate(${-rig.rz}rad)`;
      requestAnimationFrame(tick);
    };
    tick();
    return { rig, fallback: true };
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  stageEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Soft studio lighting on top of the environment
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(4, -2, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const extrude = { depth: 0.34, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.022, bevelSegments: 6, curveSegments: 64 };
  const gBody = new THREE.ExtrudeGeometry(shapeBody(), extrude);
  const gTri = new THREE.ExtrudeGeometry(shapeTriangle(), extrude);
  [gBody, gTri].forEach(g => g.translate(0, 0, -extrude.depth / 2));

  // Satin black body, satin NUTE-orange triangle
  const mBody = new THREE.MeshPhysicalMaterial({ color: BLACK, roughness: 0.42, metalness: 0.0, clearcoat: 0.55, clearcoatRoughness: 0.32, envMapIntensity: 0.9, transparent: true });
  const mTri = new THREE.MeshPhysicalMaterial({ color: ORANGE, roughness: 0.48, metalness: 0.0, clearcoat: 0.35, clearcoatRoughness: 0.4, envMapIntensity: 0.55, transparent: true });

  const logo = new THREE.Group();
  logo.add(new THREE.Mesh(gBody, mBody));
  logo.add(new THREE.Mesh(gTri, mTri));
  const root = new THREE.Group();
  root.add(logo);
  scene.add(root);

  let visH = 1, visW = 1;
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    visW = visH * camera.aspect;
  }
  resize();
  addEventListener('resize', resize);

  // Mouse parallax (desktop only)
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      mouse.tx = (e.clientX / innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    stageEl.style.opacity = rig.opacity;
    if (rig.opacity <= 0.005) return; // nothing to draw

    // Size the logo from the viewport (height 2 units in model space)
    const target = rig.size * Math.min(visH, visW * 1.25);
    root.scale.setScalar(target / 2);
    root.position.set(rig.x * visW, rig.y * visH + Math.sin(t * 0.8) * 0.06, 0);

    // Idle: slow sway + float, like the reference ring
    logo.rotation.y = Math.sin(t * 0.32) * 0.62 + rig.ry + mouse.x * 0.28;
    logo.rotation.x = Math.sin(t * 0.47) * 0.09 + rig.rx + mouse.y * 0.16;
    logo.rotation.z = Math.sin(t * 0.21) * 0.035 + rig.rz;

    renderer.render(scene, camera);
  }
  loop();

  return { rig, fallback: false, renderer };
}
