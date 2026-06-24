/* ==========================================================================
   HIRUY GYM & SPA — script.js
   Combines: UI/nav logic + three.js ambient background scene
   ========================================================================== */

import * as THREE from "three";

/* ==========================================================================
   0. SHARED STATE
   ========================================================================== */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* ==========================================================================
   1. LOADER
   ========================================================================== */

function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("is-hidden");
    }, 600);
  });
}

/* ==========================================================================
   2. HEADER — frosted background on scroll
   ========================================================================== */

function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const toggle = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* ==========================================================================
   3. HAMBURGER / MOBILE MENU
   ========================================================================== */

function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!hamburger || !mobileMenu) return;

  const closeMenu = () => {
    hamburger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  const openMenu = () => {
    hamburger.classList.add("is-open");
    mobileMenu.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a link inside the mobile menu is tapped
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on outside tap (tapping the overlay background itself)
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close on escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* ==========================================================================
   4. ACTIVE-SECTION NAV HIGHLIGHT
   ========================================================================== */

function initActiveSection() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   5. CONTACT FORM (placeholder handling — no backend yet)
   ========================================================================== */

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const originalText = button.textContent;

    button.textContent = "Message Sent ✓";
    button.disabled = true;

    setTimeout(() => {
      form.reset();
      button.textContent = originalText;
      button.disabled = false;
    }, 2200);
  });
}

/* ==========================================================================
   6. THREE.JS BACKGROUND SCENE
   Layers (back to front):
     - Far:  starfield + rare red shooting stars
     - Mid:  faint drifting dust particles
     - Near: 5–8 soft glowing translucent orbs, gentle bob/float
   ========================================================================== */

function initBackgroundScene() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  // If reduced motion is preferred, keep the CSS gradient fallback only.
  if (prefersReducedMotion) return;

  /* ---- renderer / scene / camera ---- */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 18;

  /* ---- lighting (shared, soft, top-left implied source) ---- */

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xbfd4ff, 0.9);
  keyLight.position.set(-6, 8, 10);
  scene.add(keyLight);

  /* ---- helper: soft circular sprite texture (for stars / dust / glow) ---- */

  function makeGlowTexture(color = "255,255,255") {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, `rgba(${color}, 1)`);
    gradient.addColorStop(0.4, `rgba(${color}, 0.5)`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const whiteGlow = makeGlowTexture("255,255,255");
  const blueGlow = makeGlowTexture("190,210,255");
  const redGlow = makeGlowTexture("230,57,70");

  /* ---- LAYER 1: starfield (far) ---- */

  const STAR_COUNT = 220;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 70;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    starPositions[i * 3 + 2] = -20 - Math.random() * 30;
  }

  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    size: 0.5,
    map: whiteGlow,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  /* ---- LAYER 1b: shooting stars (rare red streaks) ---- */

  const MAX_SHOOTING_STARS = 3;
  const shootingStars = [];

  function spawnShootingStar() {
    if (shootingStars.length >= MAX_SHOOTING_STARS) return;

    const geometry = new THREE.BufferGeometry();
    const length = 6 + Math.random() * 4;
    const positions = new Float32Array([0, 0, 0, -length, length * 0.35, 0]);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xe63946,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geometry, material);

    const startX = 20 + Math.random() * 10;
    const startY = (Math.random() - 0.5) * 20 + 8;
    const startZ = -15 - Math.random() * 15;
    line.position.set(startX, startY, startZ);

    scene.add(line);

    shootingStars.push({
      mesh: line,
      material,
      velocity: 0.35 + Math.random() * 0.25,
      life: 0,
      maxLife: 60 + Math.random() * 20,
    });
  }

  function scheduleNextShootingStar() {
    const delay = 9000 + Math.random() * 8000; // rare: ~9–17s
    setTimeout(() => {
      spawnShootingStar();
      scheduleNextShootingStar();
    }, delay);
  }
  scheduleNextShootingStar();

  function updateShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.life++;
      s.mesh.position.x -= s.velocity;
      s.mesh.position.y -= s.velocity * 0.35;

      const progress = s.life / s.maxLife;
      // fade in quickly, fade out toward the end
      s.material.opacity =
        progress < 0.15
          ? progress / 0.15
          : Math.max(0, 1 - (progress - 0.15) / 0.85);

      if (s.life >= s.maxLife) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.material.dispose();
        shootingStars.splice(i, 1);
      }
    }
  }

  /* ---- LAYER 2: dust particles (mid) ---- */

  const DUST_COUNT = 220;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustSeeds = new Float32Array(DUST_COUNT); // for per-particle sway

  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 40;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    dustPositions[i * 3 + 2] = -2 - Math.random() * 14;
    dustSeeds[i] = Math.random() * Math.PI * 2;
  }

  dustGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(dustPositions, 3)
  );

  const dustMaterial = new THREE.PointsMaterial({
    size: 0.18,
    map: whiteGlow,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  /* ---- LAYER 3: gentle glowing orbs (near, behind content) ---- */

  const ORB_COUNT = 7;
  const orbs = [];
  const orbGlowMap = [blueGlow, blueGlow, blueGlow, blueGlow, blueGlow, blueGlow, redGlow];

  for (let i = 0; i < ORB_COUNT; i++) {
    const radius = 0.5 + Math.random() * 0.9;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);

    const isRareRed = i === ORB_COUNT - 1; // exactly one orb gets a faint red rim
    const material = new THREE.MeshPhysicalMaterial({
      color: isRareRed ? 0x2a3a66 : 0x274583,
      transparent: true,
      opacity: 0.22,
      roughness: 0.15,
      transmission: 0.85,
      thickness: 1.2,
      clearcoat: 1,
      emissive: isRareRed ? 0xe63946 : 0x3d5aa6,
      emissiveIntensity: isRareRed ? 0.12 : 0.08,
    });

    const orb = new THREE.Mesh(geometry, material);

    orb.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 9,
      4 + Math.random() * 4
    );

    scene.add(orb);

    orbs.push({
      mesh: orb,
      baseY: orb.position.y,
      baseX: orb.position.x,
      bobSpeed: 0.25 + Math.random() * 0.25,
      bobAmount: 0.4 + Math.random() * 0.4,
      driftSpeed: 0.08 + Math.random() * 0.1,
      driftAmount: 0.5 + Math.random() * 0.5,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      seed: Math.random() * Math.PI * 2,
    });
  }

  /* ---- scroll-driven canvas opacity (dim behind dense content) ---- */

  let targetOpacity = 1;

  function updateScrollOpacity() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    // Fully visible through hero, gently dims as content sections begin
    targetOpacity = Math.max(0.45, 1 - scrollY / (vh * 1.6));
    canvas.style.opacity = targetOpacity.toFixed(2);
  }

  window.addEventListener("scroll", updateScrollOpacity, { passive: true });
  updateScrollOpacity();

  /* ---- resize handling ---- */

  function handleResize() {
    const { innerWidth, innerHeight } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", handleResize);

  /* ---- animation loop ---- */

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // far stars: imperceptible drift
    stars.rotation.y = t * 0.002;

    // dust: slow upward drift with gentle sideways sway, looping
    const dustPosAttr = dust.geometry.attributes.position;
    for (let i = 0; i < DUST_COUNT; i++) {
      const idx = i * 3;
      let y = dustPosAttr.array[idx + 1] + 0.004;
      if (y > 15) y = -15;
      dustPosAttr.array[idx + 1] = y;
      dustPosAttr.array[idx] += Math.sin(t * 0.3 + dustSeeds[i]) * 0.0015;
    }
    dustPosAttr.needsUpdate = true;

    // shooting stars
    updateShootingStars();

    // orbs: gentle bob + drift + slow rotation
    orbs.forEach((o) => {
      o.mesh.position.y =
        o.baseY + Math.sin(t * o.bobSpeed + o.seed) * o.bobAmount;
      o.mesh.position.x =
        o.baseX + Math.sin(t * o.driftSpeed + o.seed) * o.driftAmount;
      o.mesh.rotation.y += o.rotSpeed * 0.01;
      o.mesh.rotation.x += o.rotSpeed * 0.006;
    });

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   INIT
   ========================================================================== */

/* ==========================================================================
   7. GALLERY ACCORDION
   ========================================================================== */

function initGalleryAccordion() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".gallery-card"));

  const collapseAll = () => {
    cards.forEach((card) => {
      card.classList.remove("is-expanded", "is-shrunk");
    });
  };

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      const alreadyExpanded = card.classList.contains("is-expanded");

      collapseAll();

      if (!alreadyExpanded) {
        card.classList.add("is-expanded");
        cards.forEach((other) => {
          if (other !== card) other.classList.add("is-shrunk");
        });
      }
    });
  });

  // Click outside the gallery grid collapses everything
  document.addEventListener("click", (e) => {
    if (!grid.contains(e.target)) {
      collapseAll();
    }
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeaderScroll();
  initMobileMenu();
  initActiveSection();
  initContactForm();
  initBackgroundScene();
  initGalleryAccordion();
});