import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) used to morph the core.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export interface SceneHandle {
  dispose(): void;
}

export function initScene(canvas: HTMLCanvasElement): SceneHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.innerWidth < 768;
  const motion = reduceMotion ? 0.25 : 1;

  // Phones get a lighter scene: lower resolution, fewer particles and a coarser orb mesh.
  const lite = isSmall();
  renderer.setPixelRatio(lite ? 1 : Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05050b');
  scene.fog = new THREE.FogExp2('#05050b', 0.045);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 8);

  // ---------- Core: noise-displaced iridescent orb ----------
  const coreUniforms = {
    uTime: { value: 0 },
    uDistort: { value: 0.35 },
    uMouse: { value: new THREE.Vector2() },
    uColorA: { value: new THREE.Color('#7c5cff') },
    uColorB: { value: new THREE.Color('#00e5c7') },
    uColorC: { value: new THREE.Color('#ff5c8a') },
  };
  const coreMat = new THREE.ShaderMaterial({
    uniforms: coreUniforms,
    vertexShader: /* glsl */ `
      ${NOISE}
      uniform float uTime; uniform float uDistort; uniform vec2 uMouse;
      varying vec3 vNormal; varying vec3 vView; varying float vNoise;
      void main(){
        vec3 p = position;
        float n = snoise(normal * 1.4 + vec3(uTime * 0.25, uTime * 0.18, uMouse.x * 0.6));
        float n2 = snoise(normal * 3.2 - vec3(0.0, uTime * 0.4, uMouse.y * 0.6)) * 0.35;
        float d = (n + n2) * uDistort;
        p += normal * d;
        vNoise = d;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vView = normalize(-mv.xyz);
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
      varying vec3 vNormal; varying vec3 vView; varying float vNoise;
      void main(){
        float fres = pow(1.0 - max(dot(normalize(vNormal), vView), 0.0), 2.2);
        float t = vNoise * 1.6 + 0.5 + sin(uTime * 0.3) * 0.15;
        vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 1.0, t));
        col = mix(col, uColorC, smoothstep(0.55, 1.1, t + fres * 0.4));
        col *= 0.18 + fres * 1.05;
        col += vec3(1.0) * pow(fres, 7.0) * 0.3;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, lite ? 32 : 96), coreMat);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.95, 2),
    new THREE.MeshBasicMaterial({ color: '#8f7bff', wireframe: true, transparent: true, opacity: 0.12 }),
  );

  const coreGroup = new THREE.Group();
  coreGroup.add(core, shell);

  // Orbit rings
  const ringMat = (c: string, o: number) =>
    new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.DoubleSide });
  const rings: THREE.Mesh[] = [
    new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.008, 8, 200), ringMat('#00e5c7', 0.55)),
    new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.006, 8, 200), ringMat('#7c5cff', 0.45)),
    new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.005, 8, 200), ringMat('#ff5c8a', 0.3)),
  ];
  rings[0].rotation.set(1.2, 0.2, 0);
  rings[1].rotation.set(1.6, -0.5, 0.3);
  rings[2].rotation.set(0.9, 0.7, -0.2);
  rings.forEach((r) => coreGroup.add(r));

  // Satellites riding the rings
  const satGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const sats = rings.map((r, i) => {
    const m = new THREE.Mesh(satGeo, new THREE.MeshBasicMaterial({ color: ['#00e5c7', '#b8a8ff', '#ff8fb0'][i] }));
    r.add(m);
    return m;
  });
  scene.add(coreGroup);

  // ---------- Galaxy particle field ----------
  const COUNT = lite ? 2500 : 7000;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  const seed = new Float32Array(COUNT);
  const palette = ['#7c5cff', '#00e5c7', '#ff5c8a', '#ffffff'].map((c) => new THREE.Color(c));
  for (let i = 0; i < COUNT; i++) {
    const branch = i % 4;
    const radius = 3 + Math.pow(Math.random(), 1.6) * 22;
    const spin = radius * 0.32;
    const angle = (branch / 4) * Math.PI * 2 + spin;
    const spread = 0.35 + radius * 0.06;
    pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread * 2;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.4;
    pos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread * 2;
    const c = palette[Math.random() < 0.25 ? 3 : branch % 3].clone().lerp(palette[3], Math.random() * 0.3);
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = Math.random() * 1.6 + 0.4;
    seed[i] = Math.random() * 100;
  }
  const galaxyGeo = new THREE.BufferGeometry();
  galaxyGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  galaxyGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  galaxyGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  galaxyGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const galaxyMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixel: { value: renderer.getPixelRatio() } },
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uPixel;
      attribute float aSize; attribute float aSeed;
      varying vec3 vColor; varying float vTw;
      void main(){
        vColor = color;
        vTw = 0.55 + 0.45 * sin(uTime * 1.5 + aSeed);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixel * 28.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vTw;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor * vTw, a * a);
      }`,
  });
  const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
  galaxy.rotation.x = 0.35;
  galaxy.position.y = -1.2;
  scene.add(galaxy);

  // ---------- 3D phone (shown in the mobile showcase section) ----------
  const phone = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(1.6, 3.3, 0.18, 6, 0.22),
    new THREE.MeshStandardMaterial({ color: '#16161f', metalness: 0.85, roughness: 0.28 }),
  );
  const screenTex = new THREE.CanvasTexture(drawAppScreen());
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = 4;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.46, 3.14),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
  );
  screen.position.z = 0.092;
  const edge = new THREE.Mesh(
    new RoundedBoxGeometry(1.64, 3.34, 0.14, 6, 0.24),
    new THREE.MeshStandardMaterial({ color: '#8f7bff', metalness: 1, roughness: 0.2, emissive: '#2a1b6b' }),
  );
  const cam = new THREE.Mesh(
    new RoundedBoxGeometry(0.5, 0.5, 0.06, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: '#0b0b12', metalness: 0.6, roughness: 0.3 }),
  );
  cam.position.set(-0.45, 1.2, -0.11);
  phone.add(edge, body, screen, cam);
  phone.visible = false;
  scene.add(phone);

  // Floating glass tiles around the phone
  const tiles: THREE.Mesh[] = [];
  const tileColors = ['#7c5cff', '#00e5c7', '#ff5c8a', '#ffb547'];
  for (let i = 0; i < 8; i++) {
    const t = new THREE.Mesh(
      new RoundedBoxGeometry(0.42, 0.42, 0.08, 4, 0.1),
      new THREE.MeshStandardMaterial({
        color: tileColors[i % 4],
        emissive: tileColors[i % 4],
        emissiveIntensity: 0.6,
        metalness: 0.3,
        roughness: 0.25,
        transparent: true,
        opacity: 0.9,
      }),
    );
    const a = (i / 8) * Math.PI * 2;
    t.userData = { a, r: 1.8 + (i % 3) * 0.35, y: Math.sin(a * 2) * 1.2, s: 0.4 + Math.random() * 0.4 };
    phone.add(t);
    tiles.push(t);
  }

  scene.add(new THREE.AmbientLight('#ffffff', 0.35));
  const key = new THREE.PointLight('#8f7bff', 40, 30);
  key.position.set(3, 3, 4);
  const rim = new THREE.PointLight('#00e5c7', 30, 30);
  rim.position.set(-4, -2, 2);
  scene.add(key, rim);

  // ---------- Post-processing ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.55, 0.32);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- Interaction state ----------
  const mouse = new THREE.Vector2();
  const mouseSmooth = new THREE.Vector2();
  let scrollY = window.scrollY;
  const onMove = (e: PointerEvent) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  };
  const onScroll = () => {
    scrollY = window.scrollY;
  };
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  const showcase = document.getElementById('showcase');

  const timer = new THREE.Timer();
  timer.connect(document);
  let raf = 0;
  let running = true;

  const tick = () => {
    if (!running) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed() * motion;
    const vh = window.innerHeight;
    const heroP = Math.min(scrollY / vh, 1.5); // 0 at top, 1 one screen down
    const docP = scrollY / Math.max(document.documentElement.scrollHeight - vh, 1);

    mouseSmooth.lerp(mouse, 1 - Math.pow(0.001, dt));

    coreUniforms.uTime.value = t;
    coreUniforms.uMouse.value.copy(mouseSmooth);
    coreUniforms.uDistort.value = 0.3 + Math.abs(mouseSmooth.x * mouseSmooth.y) * 0.25 + heroP * 0.15;
    galaxyMat.uniforms.uTime.value = t;

    // Core sits beside the hero copy, then recedes into the top-right corner and follows the camera
    const small = isSmall();
    const hp = THREE.MathUtils.smoothstep(heroP, 0, 1);
    const camY = -docP * 2.2;
    coreGroup.position.set(
      THREE.MathUtils.lerp(small ? 0.2 : 2.6, small ? 1.6 : 5.6, hp),
      camY + THREE.MathUtils.lerp(small ? 1.55 : 0.1, small ? 2.9 : 2.7, hp),
      THREE.MathUtils.lerp(0, -4, hp),
    );
    coreGroup.scale.setScalar(THREE.MathUtils.lerp(small ? 0.62 : 1, small ? 0.45 : 0.6, hp));
    coreGroup.rotation.y += dt * 0.15 * motion;
    core.rotation.x = mouseSmooth.y * 0.4;
    core.rotation.y = mouseSmooth.x * 0.6 + t * 0.1;
    shell.rotation.y = -t * 0.12;
    shell.rotation.x = t * 0.07;
    rings.forEach((r, i) => (r.rotation.z = t * (0.2 + i * 0.1) * (i % 2 ? -1 : 1)));
    sats.forEach((s, i) => {
      const R = 2.6 + i * 0.5;
      const a = t * (0.6 - i * 0.12) + i * 2;
      s.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
    });

    galaxy.rotation.y = t * 0.025 + docP * 1.2;

    // Camera: gentle parallax + dolly through the galaxy with scroll
    camera.position.x += (mouseSmooth.x * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (mouseSmooth.y * 0.4 - docP * 2.2 - camera.position.y) * 0.05;
    camera.position.z = 8 - docP * 2;
    camera.lookAt(0, -docP * 2.2, 0);
    camera.updateMatrixWorld();

    // Phone: visible while the showcase section is on screen
    if (showcase) {
      const r = showcase.getBoundingClientRect();
      const p = (vh - r.top) / (vh + r.height); // 0 entering, 1 leaving
      const ease = THREE.MathUtils.smoothstep(p, 0, 0.35) * (1 - THREE.MathUtils.smoothstep(p, 0.75, 1));
      const on = ease > 0.01;
      phone.visible = on;
      if (on) {
        // Place the phone relative to the camera so it stays framed while scrolling
        phone.position.copy(camera.localToWorld(new THREE.Vector3(small ? 0 : -1.75, small ? -0.3 : -0.1, -5.2)));
        phone.position.y += (1 - ease) * -3;
        phone.rotation.set(
          mouseSmooth.y * -0.25 + 0.1,
          (p - 0.5) * Math.PI * 1.1 + mouseSmooth.x * 0.35,
          Math.sin(t * 0.8) * 0.04,
        );
        const s = 0.6 + ease * 0.4;
        phone.scale.setScalar(s * (small ? 0.75 : 1));
        tiles.forEach((tile, i) => {
          const d = tile.userData as { a: number; r: number; y: number; s: number };
          const a = d.a + t * d.s * 0.6;
          tile.position.set(Math.cos(a) * d.r * ease, d.y + Math.sin(t + i) * 0.15, Math.sin(a) * d.r * ease * 0.6);
          tile.rotation.set(t * d.s, t * d.s * 0.7, 0);
        });
      }
    }

    composer.render();


    raf = requestAnimationFrame(tick);
  };

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  raf = requestAnimationFrame(tick);

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      timer.dispose();
      renderer.dispose();
    },
  };
}

// Draws a generic fintech wallet UI onto a canvas to use as the phone's screen texture.
function drawAppScreen(): HTMLCanvasElement {
  const W = 600;
  const H = 1290;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0d0b1f');
  bg.addColorStop(1, '#05050b');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
  };
  const font = (w: number, s: number) => (g.font = `${w} ${s}px Inter, system-ui, sans-serif`);

  // status bar + dynamic island
  g.fillStyle = '#fff';
  font(600, 26);
  g.fillText('9:41', 48, 62);
  rr(W / 2 - 90, 28, 180, 50, 25);
  g.fillStyle = '#000';
  g.fill();
  g.fillStyle = '#fff';
  rr(W - 110, 42, 56, 24, 7);
  g.fill();

  g.fillStyle = 'rgba(255,255,255,0.6)';
  font(500, 28);
  g.fillText('Good morning,', 48, 160);
  g.fillStyle = '#fff';
  font(700, 46);
  g.fillText('Welcome back', 48, 214);

  // balance card
  const card = g.createLinearGradient(40, 260, W - 40, 560);
  card.addColorStop(0, '#7c5cff');
  card.addColorStop(0.6, '#5a3df0');
  card.addColorStop(1, '#00b9a3');
  rr(40, 260, W - 80, 290, 36);
  g.fillStyle = card;
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)';
  font(500, 26);
  g.fillText('Total balance', 80, 325);
  g.fillStyle = '#fff';
  font(800, 72);
  g.fillText('ETB 24,580', 80, 410);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  font(500, 24);
  g.fillText('•••• 4821', 80, 505);
  g.beginPath();
  g.arc(W - 120, 490, 26, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fill();
  g.beginPath();
  g.arc(W - 90, 490, 26, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fill();

  // quick actions
  const actions = [
    ['Send', '#00e5c7'],
    ['Pay', '#ff5c8a'],
    ['Top up', '#ffb547'],
    ['More', '#8f7bff'],
  ];
  actions.forEach(([label, color], i) => {
    const x = 48 + i * 132;
    rr(x, 600, 108, 108, 30);
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.fill();
    g.beginPath();
    g.arc(x + 54, 654, 22, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)';
    font(500, 22);
    g.textAlign = 'center';
    g.fillText(label, x + 54, 745);
    g.textAlign = 'left';
  });

  // spending chart
  rr(40, 790, W - 80, 220, 30);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  g.fill();
  g.fillStyle = '#fff';
  font(600, 26);
  g.fillText('This week', 72, 840);
  const bars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45];
  bars.forEach((b, i) => {
    const bw = 44;
    const x = 80 + i * 66;
    const h = b * 120;
    const grad = g.createLinearGradient(0, 990 - h, 0, 990);
    grad.addColorStop(0, i === 3 ? '#00e5c7' : '#7c5cff');
    grad.addColorStop(1, 'rgba(124,92,255,0.2)');
    rr(x, 985 - h, bw, h, 12);
    g.fillStyle = grad;
    g.fill();
  });

  // transactions
  const tx = [
    ['Coffee House', '-120', '#ff5c8a'],
    ['Salary', '+18,000', '#00e5c7'],
  ];
  tx.forEach(([name, amt, color], i) => {
    const y = 1050 + i * 96;
    rr(40, y, W - 80, 82, 24);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fill();
    g.beginPath();
    g.arc(90, y + 41, 22, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
    g.fillStyle = '#fff';
    font(600, 26);
    g.fillText(name, 130, y + 50);
    g.textAlign = 'right';
    g.fillStyle = color;
    g.fillText(amt, W - 72, y + 50);
    g.textAlign = 'left';
  });

  // home indicator
  rr(W / 2 - 80, H - 30, 160, 8, 4);
  g.fillStyle = 'rgba(255,255,255,0.7)';
  g.fill();
  return c;
}
