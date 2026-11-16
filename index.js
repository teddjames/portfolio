/* Tedd James — Beyond the Code | interactive effects and optional WebGL art */
(() => {
  'use strict';
  document.body.classList.add('has-js');

  // The intro always resolves. It never depends on a remote 3D library, image or API.
  const loader = document.getElementById('loader');
  const nameEl = document.getElementById('loader-name');
  const bar = document.getElementById('loader-bar');
  const pct = document.getElementById('loader-pct');
  const message = 'TEDD JAMES';
  const duration = 1730;
  const startedAt = performance.now();
  function animateLoader(now) {
    const t = Math.min(1, (now - startedAt) / duration);
    const typed = Math.min(message.length, Math.floor(t * (message.length + 1.2)));
    nameEl.textContent = message.slice(0, typed);
    const percent = Math.floor(t * 100);
    bar.style.width = percent + '%';
    pct.textContent = String(percent).padStart(2, '0') + '%';
    if (t < 1) return requestAnimationFrame(animateLoader);
    nameEl.textContent = message;
    window.setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      window.setTimeout(() => loader.setAttribute('aria-hidden', 'true'), 850);
    }, 200);
  }
  requestAnimationFrame(animateLoader);

  // Navigation: a full-height editorial overlay, keyboard-accessible.
  const menuButton = document.getElementById('menu-button');
  const menu = document.getElementById('menu-overlay');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuButton.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (menu.classList.contains('is-open') && window.innerWidth > 1280) setMenu(false);
  }, { passive: true });

  // Scroll reveal and a slender progress indicator.
  const revealNodes = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .07, rootMargin: '0px 0px 50px 0px' });
    revealNodes.forEach(node => observer.observe(node));
  } else {
    revealNodes.forEach(node => node.classList.add('is-visible'));
  }
  const progress = document.getElementById('top-progress');
  let scrollQueued = false;
  function refreshProgress() {
    const remaining = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = remaining > 0 ? Math.max(0, Math.min(100, scrollY / remaining * 100)) : 100;
    progress.style.width = percentage + '%';
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { requestAnimationFrame(refreshProgress); scrollQueued = true; }
  }, { passive: true });
  refreshProgress();

  // Project category filtering, without a search field.
  const filterButtons = document.querySelectorAll('[data-filter]');
  const projects = document.querySelectorAll('.project[data-type]');

  document.getElementById('copyright-year').textContent = new Date().getFullYear();

  // 3D graphic: an interactive laptop scene, with a CSS laptop fallback if WebGL is unavailable.
  const host = document.querySelector('.hero__visual');
  const canvas = document.getElementById('hero-canvas');
  let webglReady = false;
  function loadThree() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => { if (window.THREE) setup3D(); };
    script.onerror = () => { /* static, animated 3D CSS fallback remains visible */ };
    document.head.appendChild(script);
  }
  function setup3D() {
    if (webglReady || !canvas || !host || !window.THREE) return;
    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (_) { return; }
    if (!renderer) return;
    webglReady = true;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.35 : 1.85));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.1, 10.4);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 1.35));
    const blueLight = new THREE.PointLight(0x2f80ff, 6.8, 30);
    blueLight.position.set(-4.6, 3.8, 7.5);
    scene.add(blueLight);
    const warmLight = new THREE.PointLight(0xf25c2a, 5.3, 25);
    warmLight.position.set(4.2, -1.6, 6.4);
    scene.add(warmLight);
    const whiteRim = new THREE.PointLight(0xffffff, 1.6, 18);
    whiteRim.position.set(0, 2.4, 10);
    scene.add(whiteRim);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c1426, metalness: 0.76, roughness: 0.24 });
    const frameSoft = new THREE.MeshStandardMaterial({ color: 0x12203b, metalness: 0.55, roughness: 0.34 });
    const azureMat = new THREE.MeshStandardMaterial({ color: 0x2f80ff, emissive: 0x14366c, emissiveIntensity: 0.28, metalness: 0.28, roughness: 0.34 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf25c2a, emissive: 0x6b2108, emissiveIntensity: 0.22, metalness: 0.22, roughness: 0.42 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xaed5ff, transmission: 0.88, transparent: true, opacity: 0.2, roughness: 0.05, thickness: 0.35, metalness: 0.1 });

    function createScreenTexture() {
      const cv = document.createElement('canvas');
      cv.width = 1280; cv.height = 760;
      const ctx = cv.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, cv.height);
      g.addColorStop(0, '#0b1730');
      g.addColorStop(1, '#07101e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);

      // soft glow
      const glow = ctx.createRadialGradient(910, 150, 10, 910, 150, 260);
      glow.addColorStop(0, 'rgba(47,128,255,0.30)');
      glow.addColorStop(1, 'rgba(47,128,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, cv.width, cv.height);

      ctx.strokeStyle = 'rgba(124,173,255,0.34)';
      ctx.lineWidth = 6;
      ctx.strokeRect(100, 90, 1080, 540);
      ctx.fillStyle = '#101b33';
      ctx.fillRect(100, 90, 1080, 54);
      ['#2f80ff', '#f25c2a', '#dbe7ff'].forEach((c, i) => {
        ctx.beginPath(); ctx.arc(138 + i * 26, 117, 8, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
      });
      ctx.fillStyle = '#9ab7e8';
      ctx.font = '26px monospace';
      ctx.fillText('tedd@midnight-lab', 885, 125);

      ctx.font = '44px monospace';
      ctx.fillStyle = '#9cb0d8';
      for (let i = 0; i < 5; i++) ctx.fillText(String(i + 1).padStart(2, '0'), 126, 220 + i * 76);

      ctx.font = 'bold 52px monospace';
      ctx.fillStyle = '#dfe8ff'; ctx.fillText('const ', 220, 220);
      ctx.fillStyle = '#f7a16f'; ctx.fillText('developer', 405, 220);
      ctx.fillStyle = '#dfe8ff'; ctx.fillText(' = {', 720, 220);
      ctx.font = '46px monospace';
      ctx.fillStyle = '#dfe8ff'; ctx.fillText('name: ', 270, 302);
      ctx.fillStyle = '#71b5ff'; ctx.fillText("'Tedd James'", 450, 302);
      ctx.fillStyle = '#dfe8ff'; ctx.fillText('focus: ', 270, 378);
      ctx.fillStyle = '#71b5ff'; ctx.fillText("'Software + Design'", 480, 378);
      ctx.fillStyle = '#dfe8ff'; ctx.fillText('mindset: ', 270, 454);
      ctx.fillStyle = '#71b5ff'; ctx.fillText("'Build with purpose'", 530, 454);
      ctx.fillStyle = '#dfe8ff'; ctx.fillText('status: ', 270, 530);
      ctx.fillStyle = '#f7a16f'; ctx.fillText("'Open to opportunities'", 500, 530);
      ctx.fillStyle = '#dfe8ff'; ctx.fillText('};', 270, 606);

      ctx.strokeStyle = 'rgba(242,92,42,0.42)';
      ctx.beginPath();
      ctx.moveTo(860, 270); ctx.lineTo(1090, 270); ctx.lineTo(1090, 510); ctx.lineTo(860, 510); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(47,128,255,0.18)'; ctx.fillRect(890, 290, 160, 160);
      ctx.fillStyle = '#f25c2a'; ctx.fillRect(920, 325, 100, 16);
      ctx.fillStyle = '#5aa2ff'; ctx.fillRect(920, 360, 74, 16);
      ctx.fillStyle = '#5aa2ff'; ctx.fillRect(920, 392, 112, 16);

      const texture = new THREE.CanvasTexture(cv);
      texture.anisotropy = 4;
      return texture;
    }

    function createPanelTexture(title, body, accent, bg='#0d1730') {
      const cv = document.createElement('canvas');
      cv.width = 700; cv.height = 360;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = '#4566ad'; ctx.lineWidth = 6; ctx.strokeRect(12, 12, cv.width - 24, cv.height - 24);
      ctx.fillStyle = accent; ctx.font = 'bold 28px monospace'; ctx.fillText(title, 42, 72);
      ctx.fillStyle = '#e0e9ff'; ctx.font = 'bold 46px monospace';
      const lines = body.split('\n');
      lines.forEach((line, idx) => ctx.fillText(line, 42, 155 + idx * 60));
      const texture = new THREE.CanvasTexture(cv); texture.anisotropy = 4; return texture;
    }

    const core = new THREE.Group();
    root.add(core);

    // Main command display
    const display = new THREE.Group();
    core.add(display);
    display.position.set(0, 0.1, 0.1);

    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(5.25, 3.35, 0.18), frameMat);
    display.add(screenFrame);

    const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.7, 2.8), new THREE.MeshBasicMaterial({ map: createScreenTexture() }));
    screenPlane.position.z = 0.105;
    display.add(screenPlane);

    const glassPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 3.0), glassMat);
    glassPlane.position.z = 0.14;
    display.add(glassPlane);

    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.3, 3.4, 0.19)), new THREE.LineBasicMaterial({ color: 0x74b4ff, transparent: true, opacity: 0.9 }));
    edge.position.z = 0.002;
    display.add(edge);

    const baseStrut = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.4, 0.2), frameSoft);
    baseStrut.position.set(0, -2.0, -0.12);
    baseStrut.rotation.x = 0.28;
    core.add(baseStrut);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.2, 0.22, 6), frameSoft);
    pedestal.position.set(0, -2.72, 0.1);
    pedestal.rotation.x = Math.PI / 2;
    core.add(pedestal);

    const deck = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.05, 16, 120), new THREE.MeshBasicMaterial({ color: 0x2958b8, transparent: true, opacity: 0.32 }));
    deck.position.set(0, -2.18, -0.55);
    deck.rotation.x = 1.35;
    root.add(deck);

    // Orbit rings
    const ringBackA = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.08, 20, 180), azureMat);
    ringBackA.rotation.set(0.72, 0.18, 0.1);
    ringBackA.position.set(0, 0.05, -0.72);
    root.add(ringBackA);

    const ringBackB = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.055, 16, 180), orangeMat);
    ringBackB.rotation.set(1.22, -0.34, 0.24);
    ringBackB.position.set(0, -0.06, -0.82);
    root.add(ringBackB);

    const haloGeo = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 3.55, 2.1, 0, Math.PI * 2).getPoints(180).map(p => new THREE.Vector3(p.x, p.y, -0.95)));
    const haloLine = new THREE.LineLoop(haloGeo, new THREE.LineBasicMaterial({ color: 0xf59673, transparent: true, opacity: 0.22 }));
    root.add(haloLine);
    // side cards
    const leftPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.85, 1.15),
      new THREE.MeshBasicMaterial({ map: createPanelTexture('ACTIVE STACK', 'Flask\nSQLite', '#2f80ff'), transparent: true })
    );
    leftPanel.position.set(-3.2, 1.0, 0.2);
    leftPanel.rotation.set(0.04, 0.22, -0.14);
    root.add(leftPanel);

    const rightPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.05, 1.2),
      new THREE.MeshBasicMaterial({ map: createPanelTexture('CURRENT QUEST', 'Build\ngreat things', '#f25c2a'), transparent: true })
    );
    rightPanel.position.set(3.15, -1.1, 0.25);
    rightPanel.rotation.set(-0.08, -0.24, 0.12);
    root.add(rightPanel);

    // Floating cube and shards
    const cube = new THREE.Group();
    const cubeGlass = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82), new THREE.MeshBasicMaterial({ color: 0xf6a27f, transparent: true, opacity: 0.08 }));
    const cubeEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.82, 0.82, 0.82)), new THREE.LineBasicMaterial({ color: 0xf25c2a }));
    cube.add(cubeGlass, cubeEdge);
    cube.position.set(2.8, 2.15, 0.32);
    root.add(cube);

    const stars = [];
    const starGeo = new THREE.OctahedronGeometry(0.07, 0);
    for (let i = 0; i < 9; i++) {
      const mat = i % 2 ? azureMat : orangeMat;
      const star = new THREE.Mesh(starGeo, mat);
      const a = (i / 9) * Math.PI * 2;
      star.position.set(Math.cos(a) * (2.9 + (i % 3) * 0.25), Math.sin(a * 1.4) * 1.55, -0.2 + Math.sin(a * 2.3) * 0.6);
      root.add(star); stars.push(star);
    }

    const backArcGeo = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 3.75, 2.28, 0.15, Math.PI * 1.8).getPoints(200).map(p => new THREE.Vector3(p.x, p.y, -1.0)));
    const backArc = new THREE.Line(backArcGeo, new THREE.LineBasicMaterial({ color: 0x7eb5ff, transparent: true, opacity: 0.25 }));
    root.add(backArc);

    const floorGlow = new THREE.Mesh(new THREE.RingGeometry(2.05, 2.18, 90), new THREE.MeshBasicMaterial({ color: 0xf25c2a, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
    floorGlow.rotation.x = 1.33;
    floorGlow.position.set(0, -2.18, -0.52);
    root.add(floorGlow);

    const target = { x: 0, y: 0 };
    host.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = host.getBoundingClientRect();
      target.y = ((event.clientX - rect.left) / rect.width - 0.5) * 0.72;
      target.x = ((event.clientY - rect.top) / rect.height - 0.5) * 0.34;
    }, { passive: true });
    host.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

    function resize() {
      const { width, height } = host.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 420 ? 11.5 : (width < 720 ? 10.8 : 10.4);
      camera.updateProjectionMatrix();
    }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize, { passive: true });
    resize();

    const fallback = document.querySelector('.hero__fallback');
    if (fallback) fallback.style.opacity = '0';

    const clock = new THREE.Clock();
    function frame() {
      const t = clock.getElapsedTime();
      root.rotation.x += ((target.x * 0.32) - root.rotation.x) * 0.04;
      root.rotation.y += ((target.y * 0.34) - root.rotation.y) * 0.04;
      core.position.y = Math.sin(t * 0.95) * 0.12;
      display.rotation.y = Math.sin(t * 0.55) * 0.025;
      display.rotation.x = Math.cos(t * 0.45) * 0.018;
      ringBackA.rotation.z += 0.0038;
      ringBackA.rotation.x += 0.0014;
      ringBackB.rotation.z -= 0.0031;
      ringBackB.rotation.y += 0.0015;
      deck.rotation.z += 0.002;
      floorGlow.rotation.z -= 0.0018;
      leftPanel.position.y = 1.0 + Math.sin(t * 1.15) * 0.1;
      rightPanel.position.y = -1.1 + Math.sin(t * 0.98 + 0.8) * 0.1;
      leftPanel.rotation.z = -0.14 + Math.sin(t * 0.65) * 0.03;
      rightPanel.rotation.z = 0.12 + Math.sin(t * 0.8) * 0.03;
      cube.rotation.x = t * 0.55;
      cube.rotation.y = t * 0.82;
      stars.forEach((star, index) => {
        star.rotation.x = t * (0.9 + index * 0.08);
        star.rotation.y = t * (1.05 + index * 0.07);
        star.position.y += Math.sin(t * 1.1 + index) * 0.0009;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  loadThree();
  // Keep category filters and project count. Search has been removed.
  const projectCount = document.getElementById('project-count');
  function applyProjectFilter(filter) {
    let count = 0;
    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    projects.forEach(card => {
      const visible = filter === 'all' || card.dataset.type === filter;
      card.hidden = !visible;
      if (visible) count++;
    });
    if (projectCount) {
      projectCount.textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'PROJECT' : 'PROJECTS'}`;
    }
  }
  filterButtons.forEach(button => button.addEventListener('click', () => applyProjectFilter(button.dataset.filter)));
  applyProjectFilter('all');

  const backdrop = document.getElementById('menu-backdrop');
  backdrop?.addEventListener('click', () => setMenu(false));
  // Dimensional project interactions only for precise pointers. They don't block scrolling on touch.
  const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (canTilt.matches) {
    projects.forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.setProperty('--card-rx', `${(-y * 3.5).toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${(x * 3.5).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
      });
    });
  }
})();
