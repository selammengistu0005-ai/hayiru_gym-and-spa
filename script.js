import * as THREE from "three";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, onSnapshot, query, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD73Uyrrl8JDP5X_yxT2Zp1fV9oIpAvpXA",
  authDomain: "lumi-75592.firebaseapp.com",
  projectId: "lumi-75592",
  storageBucket: "lumi-75592.firebasestorage.app",
  messagingSenderId: "419726897354",
  appId: "1:419726897354:web:3b27219dd60b26dbb84433",
  measurementId: "G-23937MS0LH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      loader.classList.add("is-hidden");
    }, 600);
  });
}

function initHeaderScroll() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const toggle = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

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

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window._closeMobileMenu = closeMenu;
}

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

function initLanguageSwitch() {
  const wrap  = document.getElementById("lang-switch");
  const btn   = document.getElementById("lang-switch-btn");
  const label = document.getElementById("lang-switch-label");
  const menu  = document.getElementById("lang-switch-menu");
  if (!wrap || !btn || !menu) return;

  const options = menu.querySelectorAll(".lang-switch-option");
  const translatable = document.querySelectorAll("[data-am]");

  translatable.forEach((el) => {
    if (!el.dataset.en) el.dataset.en = el.innerHTML;
  });

  const closeMenu = () => {
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  };

  const openMenu = () => {
    wrap.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
  };

  function applyLanguage(lang) {
    translatable.forEach((el) => {
      el.innerHTML = lang === "am" ? el.dataset.am : el.dataset.en;
    });

    options.forEach((opt) => {
      const isActive = opt.dataset.lang === lang;
      opt.classList.toggle("active", isActive);
      opt.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    label.textContent = lang === "am" ? "አማርኛ" : "English";
    document.documentElement.lang = lang;
    localStorage.setItem("hiruy-lang", lang);
  }

  btn.addEventListener("click", () => {
    wrap.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      applyLanguage(opt.dataset.lang);
      closeMenu();
    });
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) closeMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const saved = localStorage.getItem("hiruy-lang");
  if (saved === "am") applyLanguage("am");
}

function initAdminToggle() {
  const adminBtn      = document.getElementById("admin-btn");
  const overlay       = document.getElementById("admin-overlay");
  const closeBtn      = document.getElementById("admin-close");
  const loginView     = document.getElementById("admin-login-view");
  const portalView    = document.getElementById("admin-portal-view");
  const passwordInput = document.getElementById("admin-password");
  const eyeToggle     = document.getElementById("admin-eye-toggle");
  const donutFill      = document.getElementById("portal-donut-fill");
  const donutValue     = document.getElementById("portal-donut-value");
  let unsubscribeViewed = null;
  if (!adminBtn || !overlay) return;

function openAdmin() {
  window._closeMobileMenu?.();
  window._closeQuiz?.();
  window._closeTool?.();
  overlay.classList.add("is-active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("admin-active");
  document.body.style.overflow = "hidden";
  setTimeout(() => passwordInput?.focus(), 300);
}

  function closeAdmin() {
  overlay.classList.remove("is-active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("admin-active");
  document.body.style.overflow = "";
  if (passwordInput) passwordInput.value = "";
  if (unsubscribeViewed) { unsubscribeViewed(); unsubscribeViewed = null; }
  portalView?.classList.remove("is-active");
  loginView?.classList.remove("is-hidden");
  switchTab("overview");
}

  window._closeAdmin = closeAdmin;

  function showPortal() {
  loginView?.classList.add("is-hidden");
  portalView?.classList.add("is-active");
  const placeholderPercent = 68;
  if (donutFill) {
    const offset = 97.4 - (97.4 * placeholderPercent) / 100;
    requestAnimationFrame(() => {
      donutFill.style.strokeDashoffset = offset;
    });
  }
  if (donutValue) donutValue.textContent = `${placeholderPercent}%`;

  initViewedCard();

  initPortalTabs();

  initAnalytics();
}

function initPortalTabs() {
  const tabs = document.querySelectorAll(".portal-tab");
  tabs.forEach(tab => {
    const clone = tab.cloneNode(true);
    tab.parentNode.replaceChild(clone, tab);
  });
  document.querySelectorAll(".portal-tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

function switchTab(name) {
  document.querySelectorAll(".portal-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === name);
  });
  document.querySelectorAll(".portal-tab-panel").forEach(p => {
    p.classList.toggle("is-hidden", p.id !== `portal-panel-${name}`);
  });
}

function initViewedCard() {
  const numberEl = document.getElementById("portal-viewed-number");
  if (!numberEl) return;

  if (unsubscribeViewed) { unsubscribeViewed(); unsubscribeViewed = null; }

  const q = query(
    collection(db, "agents", "hiruy_gym", "logs"),
    where("action", "==", "booking_quiz")
  );

  unsubscribeViewed = onSnapshot(q, (snap) => {
    numberEl.textContent = snap.size;
  }, (err) => {
    console.error("Viewed count error:", err);
    numberEl.textContent = "—";
  });
}

function initAnalytics() {
  const q = query(
    collection(db, "agents", "hiruy_gym", "logs"),
    where("action", "==", "booking_quiz")
  );

  onSnapshot(q, (snap) => {
    setTimeout(() => {
    const today = new Date();
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const counts = {};
    days.forEach(d => counts[d] = 0);

    snap.forEach(docSnap => {
      const ts = docSnap.data().timestamp?.toDate?.();
      if (!ts) return;
      const key = ts.toISOString().slice(0, 10);
      if (counts[key] !== undefined) counts[key]++;
    });

    drawChart(days, counts);
    drawMiniGraph(days, counts);
    drawTable(days, counts);

    initGraphOverlay(days, counts);
    }, 350);
  }, (err) => {
    console.error("Analytics error:", err);
  });
}

function initGraphOverlay(days, counts) {
  const graphBtn     = document.getElementById("graph-btn");
  const overlay      = document.getElementById("graph-overlay");
  const backBtn      = document.getElementById("graph-overlay-back");
  const mobileCanvas = document.getElementById("portal-chart-mobile");
  if (!graphBtn || !overlay || !backBtn || !mobileCanvas) return;

  const freshBtn = graphBtn.cloneNode(true);
  graphBtn.parentNode.replaceChild(freshBtn, graphBtn);

  freshBtn.addEventListener("click", () => {
    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => drawChartOnCanvas(mobileCanvas, days, counts), 50);
  });

  backBtn.addEventListener("click", () => {
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  });
}

function drawChartOnCanvas(canvas, days, counts) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.clientWidth || window.innerWidth;
  const H   = canvas.offsetHeight || window.innerHeight * 0.55;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(dpr, dpr);

  const pad    = { top: 24, right: 24, bottom: 40, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  const values = days.map(d => counts[d]);
  const maxVal = Math.max(...values, 1);
  const xStep  = chartW / (days.length - 1);

  const yTickCount = 4;
  const yTickStep  = Math.ceil(maxVal / yTickCount) || 1;
  const yMax       = yTickStep * yTickCount;

  const pts = values.map((v, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + chartH - (v / yMax) * chartH,
    v,
  }));

  function buildCurve() {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
  }

  ctx.font = "10px Manrope, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= yTickCount; i++) {
    const val = yTickStep * i;
    const y   = pad.top + chartH - (val / yMax) * chartH;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillText(val, pad.left - 8, y + 3.5);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  days.forEach((_, i) => {
    if (i % 2 !== 0) return;
    ctx.fillText(i + 1, pad.left + i * xStep, H - 8);
  });

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, "rgba(91,127,224,0.35)");
  grad.addColorStop(1, "rgba(91,127,224,0)");
  buildCurve();
  ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
  ctx.lineTo(pts[0].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  buildCurve();
  ctx.strokeStyle = "#5b7fe0";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap  = "round";
  ctx.stroke();

  pts.forEach(({ x, y, v }) => {
    const isActive = v > 0;
    ctx.shadowBlur  = isActive ? 12 : 0;
    ctx.shadowColor = "rgba(91,127,224,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, isActive ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = "#5b7fe0";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawChart(days, counts) {
  const canvas = document.getElementById("portal-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;

  const cardStyles = getComputedStyle(canvas.parentElement);
  const paddingLeft = parseFloat(cardStyles.paddingLeft) || 0;
  const paddingRight = parseFloat(cardStyles.paddingRight) || 0;
  const W = canvas.parentElement.clientWidth - paddingLeft - paddingRight || 300;

  const H = window.innerWidth <= 900 ? 200 : 220;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";
  ctx.scale(dpr, dpr);
  const pad = { top: 24, right: 24, bottom: 40, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  const values = days.map(d => counts[d]);
  const maxVal = Math.max(...values, 1);
  const xStep  = chartW / (days.length - 1);

  const yTickCount = 4;
  const yTickStep  = Math.ceil(maxVal / yTickCount) || 1;
  const yMax       = yTickStep * yTickCount;

  const pts = values.map((v, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + chartH - (v / yMax) * chartH,
    v,
  }));

  function buildCurve() {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
  }

  ctx.font = "10px Manrope, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= yTickCount; i++) {
    const val = yTickStep * i;
    const y   = pad.top + chartH - (val / yMax) * chartH;

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillText(val, pad.left - 8, y + 3.5);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  days.forEach((_, i) => {
    if (i % 2 !== 0) return;
    const x = pad.left + i * xStep;
    ctx.fillText(i + 1, x, H - 8);
  });

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, "rgba(91,127,224,0.35)");
  grad.addColorStop(1, "rgba(91,127,224,0)");

  buildCurve();
  ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
  ctx.lineTo(pts[0].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  buildCurve();
  ctx.strokeStyle = "#5b7fe0";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap  = "round";
  ctx.stroke();

  pts.forEach(({ x, y, v }) => {
    const isActive = v > 0;

    ctx.shadowBlur   = isActive ? 12 : 0;
    ctx.shadowColor  = "rgba(91,127,224,0.7)";

    ctx.beginPath();
    ctx.arc(x, y, isActive ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = "#5b7fe0";
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawMiniGraph(days, counts) {
  const canvas = document.getElementById("dash-mini-graph");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  const pad = 4;

  ctx.clearRect(0, 0, W, H);

  const values = days.map(d => counts[d]);
  const maxVal = Math.max(...values, 1);
  const xStep  = (W - pad * 2) / (values.length - 1);

  const pts = values.map((v, i) => ({
    x: pad + i * xStep,
    y: H - pad - (v / maxVal) * (H - pad * 2),
  }));

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "rgba(91,127,224,0.4)");
  grad.addColorStop(1, "rgba(91,127,224,0)");

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[pts.length - 1].x, H);
  ctx.lineTo(pts[0].x, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = "#5b7fe0";
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.lineCap  = "round";
  ctx.stroke();
}

function drawTable(days, counts) {
  const tableEl = document.getElementById("portal-table");
  if (!tableEl) return;
  tableEl.innerHTML = "";

  const labels = [...days].reverse();
  labels.forEach((d, i) => {
    const row = document.createElement("div");
    row.className = "portal-table-row";
    const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.slice(5);
    row.innerHTML = `
      <span class="portal-table-label">${label}</span>
      <span class="portal-table-value">${counts[d]}</span>
    `;
    tableEl.appendChild(row);
  });
}

  async function checkAccessKey(value) {
    try {
      const ref = doc(db, "agents", "hiruy_gym");
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data();
      return value === data.accessKey;
    } catch (err) {
      console.error("Access key check failed:", err);
      return false;
    }
  }

  adminBtn.addEventListener("click", openAdmin);
const adminBtnMobile = document.getElementById("admin-btn-mobile");
if (adminBtnMobile) adminBtnMobile.addEventListener("click", () => { window._closeMobileMenu?.(); openAdmin(); });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeAdmin);
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAdmin();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-active")) closeAdmin();
  });

  if (passwordInput) {
    passwordInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const isCorrect = await checkAccessKey(passwordInput.value);
        if (isCorrect) {
          showPortal();
        } else {
          passwordInput.classList.remove("shake");
          void passwordInput.offsetWidth;
          passwordInput.classList.add("shake");
          setTimeout(() => passwordInput.classList.remove("shake"), 500);
        }
      }
    });
  }

  if (eyeToggle && passwordInput) {
    eyeToggle.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      eyeToggle.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
      );
    });
  }
}

function initAuroraBackground() {
  const canvas = document.getElementById("aurora-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const colors = ["#5227ff", "#ff9ffc", "#b497cf"];
  let frame = 0;

  function draw() {
    frame += 0.6;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    colors.forEach((color, i) => {
      const x = width / 2 + Math.sin((frame + i * 120) * 0.01) * width * 0.35;
      const y = height * 0.3 + Math.cos((frame + i * 90) * 0.008) * height * 0.25;
      const radius = Math.max(width, height) * 0.5;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color + "55");
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    requestAnimationFrame(draw);
  }

  draw();
}

function initBlurContact() {
  const targets = document.querySelectorAll(
    ".contact-copy h2, .contact-copy .section-lead, .contact-details p"
  );
  if (!targets.length) return;

  targets.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = "";
    el.style.display = "flex";
    el.style.flexWrap = "wrap";

    words.forEach((word, i) => {
      const span = document.createElement("span");
      span.textContent = word + (i < words.length - 1 ? "\u00A0" : "");
      span.style.display = "inline-block";
      span.style.filter = "blur(10px)";
      span.style.opacity = "0";
      span.style.transform = "translateY(20px)";
      span.style.transition = `filter 0.5s ease, opacity 0.5s ease, transform 0.5s ease`;
      span.style.transitionDelay = `${i * 0.05}s`;
      el.appendChild(span);
    });
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll("span").forEach((span) => {
            span.style.filter = "blur(0px)";
            span.style.opacity = "1";
            span.style.transform = "translateY(0)";
          });
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => observer.observe(el));
}

function initBackgroundScene() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  if (prefersReducedMotion) return;

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

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xbfd4ff, 0.9);
  keyLight.position.set(-6, 8, 10);
  scene.add(keyLight);

  function makeGlowTexture(color = "255,255,255") {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, `rgba(${color}, 1)`);
    gradient.addColorStop(0.4, `rgba(${color}, 0.5)`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const whiteGlow = makeGlowTexture("255,255,255");
  const blueGlow  = makeGlowTexture("190,210,255");
  const redGlow   = makeGlowTexture("230,57,70");

  const STAR_COUNT = 220;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3]     = (Math.random() - 0.5) * 70;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    starPositions[i * 3 + 2] = -20 - Math.random() * 30;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    size: 0.5, map: whiteGlow, transparent: true,
    opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const MAX_SHOOTING_STARS = 3;
  const shootingStars = [];

  function spawnShootingStar() {
    if (shootingStars.length >= MAX_SHOOTING_STARS) return;
    const geometry = new THREE.BufferGeometry();
    const length = 6 + Math.random() * 4;
    const positions = new Float32Array([0, 0, 0, -length, length * 0.35, 0]);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0xe63946, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geometry, material);
    line.position.set(20 + Math.random() * 10, (Math.random() - 0.5) * 20 + 8, -15 - Math.random() * 15);
    scene.add(line);
    shootingStars.push({ mesh: line, material, velocity: 0.35 + Math.random() * 0.25, life: 0, maxLife: 60 + Math.random() * 20 });
  }

  function scheduleNextShootingStar() {
    setTimeout(() => { spawnShootingStar(); scheduleNextShootingStar(); }, 9000 + Math.random() * 8000);
  }
  scheduleNextShootingStar();

  function updateShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.life++;
      s.mesh.position.x -= s.velocity;
      s.mesh.position.y -= s.velocity * 0.35;
      const progress = s.life / s.maxLife;
      s.material.opacity = progress < 0.15 ? progress / 0.15 : Math.max(0, 1 - (progress - 0.15) / 0.85);
      if (s.life >= s.maxLife) {
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.material.dispose();
        shootingStars.splice(i, 1);
      }
    }
  }

  const DUST_COUNT = 220;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustSeeds = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3]     = (Math.random() - 0.5) * 40;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    dustPositions[i * 3 + 2] = -2 - Math.random() * 14;
    dustSeeds[i] = Math.random() * Math.PI * 2;
  }
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    size: 0.18, map: whiteGlow, transparent: true,
    opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  const ORB_COUNT = 7;
  const orbs = [];
  for (let i = 0; i < ORB_COUNT; i++) {
    const radius = 0.5 + Math.random() * 0.9;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const isRareRed = i === ORB_COUNT - 1;
    const material = new THREE.MeshPhysicalMaterial({
      color: isRareRed ? 0x2a3a66 : 0x274583,
      transparent: true, opacity: 0.22, roughness: 0.15,
      transmission: 0.85, thickness: 1.2, clearcoat: 1,
      emissive: isRareRed ? 0xe63946 : 0x3d5aa6,
      emissiveIntensity: isRareRed ? 0.12 : 0.08,
    });
    const orb = new THREE.Mesh(geometry, material);
    orb.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9, 4 + Math.random() * 4);
    scene.add(orb);
    orbs.push({
      mesh: orb, baseY: orb.position.y, baseX: orb.position.x,
      bobSpeed: 0.25 + Math.random() * 0.25, bobAmount: 0.4 + Math.random() * 0.4,
      driftSpeed: 0.08 + Math.random() * 0.1, driftAmount: 0.5 + Math.random() * 0.5,
      rotSpeed: (Math.random() - 0.5) * 0.05, seed: Math.random() * Math.PI * 2,
    });
  }

  function updateScrollOpacity() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    canvas.style.opacity = Math.max(0.45, 1 - scrollY / (vh * 1.6)).toFixed(2);
  }
  window.addEventListener("scroll", updateScrollOpacity, { passive: true });
  updateScrollOpacity();

  function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", handleResize);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (document.body.classList.contains("admin-active")) return;
    const t = clock.getElapsedTime();
    stars.rotation.y = t * 0.002;
    const dustPosAttr = dust.geometry.attributes.position;
    for (let i = 0; i < DUST_COUNT; i++) {
      const idx = i * 3;
      let y = dustPosAttr.array[idx + 1] + 0.004;
      if (y > 15) y = -15;
      dustPosAttr.array[idx + 1] = y;
      dustPosAttr.array[idx] += Math.sin(t * 0.3 + dustSeeds[i]) * 0.0015;
    }
    dustPosAttr.needsUpdate = true;
    updateShootingStars();
    orbs.forEach((o) => {
      o.mesh.position.y = o.baseY + Math.sin(t * o.bobSpeed + o.seed) * o.bobAmount;
      o.mesh.position.x = o.baseX + Math.sin(t * o.driftSpeed + o.seed) * o.driftAmount;
      o.mesh.rotation.y += o.rotSpeed * 0.01;
      o.mesh.rotation.x += o.rotSpeed * 0.006;
    });
    renderer.render(scene, camera);
  }
  animate();
}

function initGalleryAccordion() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".gallery-card"));

  const collapseAll = () => {
    cards.forEach((card) => card.classList.remove("is-expanded", "is-shrunk"));
  };

  let interactingWithGrid = false;

  cards.forEach((card) => {
    card.addEventListener("pointerdown", () => { interactingWithGrid = true; });
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      const alreadyExpanded = card.classList.contains("is-expanded");
      collapseAll();
      if (!alreadyExpanded) {
        card.classList.add("is-expanded");
        cards.forEach((other) => { if (other !== card) other.classList.add("is-shrunk"); });
      }
    });
  });

  document.addEventListener("pointerdown", (e) => {
    if (!grid.contains(e.target)) interactingWithGrid = false;
  });

  document.addEventListener("click", (e) => {
    if (!interactingWithGrid && !grid.contains(e.target)) collapseAll();
    interactingWithGrid = false;
  });
}

function initGalleryFullPage() {
  const viewAllCard = document.getElementById("gallery-view-all-card");
  const galleryPage = document.getElementById("gallery-page");
  const closeBtn = document.getElementById("gallery-page-close");
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("gallery-lightbox-img");
  const pageCards = document.querySelectorAll(".gallery-page-card");
  if (!viewAllCard || !galleryPage) return;

  const openGalleryPage = () => {
    document.body.classList.add("gallery-page-active");
    galleryPage.setAttribute("aria-hidden", "false");
    window.scrollTo(0, 0);
  };

  const closeGalleryPage = () => {
    document.body.classList.remove("gallery-page-active");
    galleryPage.setAttribute("aria-hidden", "true");
  };

  viewAllCard.addEventListener("click", openGalleryPage);
  if (closeBtn) closeBtn.addEventListener("click", closeGalleryPage);

  const pageTriggers = document.querySelectorAll(".gallery-page-trigger");
  pageTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openGalleryPage();
    });
  });

  pageCards.forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img");
      if (!img || !lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("is-active");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", () => {
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
    });
  }
}

function initPhoneTracking() {
  const phoneLink = document.querySelector(".contact-phone-number");
  if (!phoneLink) return;

  phoneLink.addEventListener("click", async () => {
    try {
      await addDoc(collection(db, "agents", "hiruy_gym", "logs"), {
        timestamp: serverTimestamp(),
        action: "phone_click",
        page: "contact"
      });
    } catch (err) {
      console.error("Phone click log failed:", err);
    }
  });
}

function initBookingQuiz() {
  const overlay    = document.getElementById("quiz-overlay");
  const closeBtn   = document.getElementById("quiz-close");
  const nextBtn    = document.getElementById("quiz-next");
  const dotsEl     = document.getElementById("quiz-dots");
  const questionEl = document.getElementById("quiz-question");
  const choicesEl  = document.getElementById("quiz-choices");
  if (!overlay) return;

  const questions = [
    {
      q: "What's your fitness experience?",
      choices: [
        { icon: "🌱", label: "Complete Beginner" },
        { icon: "🏃", label: "Some Experience"   },
        { icon: "💪", label: "Intermediate"       },
        { icon: "🏆", label: "Advanced Athlete"   },
      ]
    },
    {
      q: "What's your main goal?",
      choices: [
        { icon: "🔥", label: "Lose Weight"   },
        { icon: "💪", label: "Build Muscle"  },
        { icon: "🧘", label: "Reduce Stress" },
        { icon: "⚡", label: "Boost Energy"  },
      ]
    },
    {
      q: "What type of training interests you?",
      choices: [
        { icon: "🏋️", label: "Weight Training"  },
        { icon: "🤸", label: "Group Classes"     },
        { icon: "🧖", label: "Spa & Recovery"    },
        { icon: "🔄", label: "Mix of Everything" },
      ]
    },
    {
      q: "When do you prefer to train?",
      choices: [
        { icon: "🌅", label: "Early Morning" },
        { icon: "☀️", label: "Midday"        },
        { icon: "🌆", label: "After Work"    },
        { icon: "🌙", label: "Late Evening"  },
      ]
    },
    {
      q: "Which plan interests you most?",
      choices: [
        { icon: "🏅", label: "Gym Only"     },
        { icon: "🌿", label: "Spa Only"     },
        { icon: "⭐", label: "Gym + Spa"    },
        { icon: "🤔", label: "Not Sure Yet" },
      ]
    }
  ];

  let current = 0;
  let answers  = [];
  let selected = null;

  const dots = Array.from(dotsEl.querySelectorAll(".quiz-dot"));

  function openQuiz() {
    if (typeof window._closeMobileMenu === "function") {
      window._closeMobileMenu();
    }
    window._closeAdmin?.();
    window._closeTool?.();

    current  = 0;
    answers  = [];
    selected = null;

    nextBtn.style.display = "";
    dotsEl.style.display  = "";

    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderQuestion();
  }

  function closeQuiz() {
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  window._closeQuiz = closeQuiz;

  function renderQuestion() {
    const { q, choices } = questions[current];

    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    questionEl.textContent = q;
    choicesEl.innerHTML = "";
    selected = null;
    nextBtn.disabled = true;

    choices.forEach(({ icon, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-choice";
      btn.innerHTML = `<span class="quiz-choice-icon">${icon}</span><span>${label}</span>`;
      btn.addEventListener("click", () => {
        choicesEl.querySelectorAll(".quiz-choice").forEach(b => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        selected = label;
        nextBtn.disabled = false;
      });
      choicesEl.appendChild(btn);
    });

    nextBtn.textContent = current === questions.length - 1 ? "Submit" : "Next";
  }

  async function handleNext() {
    if (!selected) return;
    answers.push({ question: questions[current].q, answer: selected });

    if (current < questions.length - 1) {
      current++;
      renderQuestion();
    } else {
      try {
        await addDoc(collection(db, "agents", "hiruy_gym", "logs"), {
          timestamp: serverTimestamp(),
          action: "booking_quiz",
          answers
        });
      } catch (err) {
        console.error("Quiz log failed:", err);
      }

      questionEl.innerHTML = `<span style="font-size:2rem">🙏</span><br/>Thank you!<br/><span style="font-size:1rem;font-family:var(--f-body);opacity:0.7">We'll be in touch soon.</span>`;
      choicesEl.innerHTML = "";
      nextBtn.style.display = "none";
      dotsEl.style.display  = "none";

      setTimeout(() => {
        closeQuiz();
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
      }, 2000);
    }
  }

  document.querySelectorAll(".book-trigger, #book-btn-nav, #book-btn-mobile").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openQuiz();
    });
  });

  closeBtn.addEventListener("click", closeQuiz);
  nextBtn.addEventListener("click", handleNext);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeQuiz();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQuiz();
  });
}

function initQuickNav() {
  const nav        = document.getElementById("quick-nav");
  const overlay    = document.getElementById("tool-modal-overlay");
  const modal      = document.getElementById("tool-modal");
  const closeBtn   = document.getElementById("tool-modal-close");
  const titleEl    = document.getElementById("tool-modal-title");
  const bodyEl     = document.getElementById("tool-modal-body");
  const navEl      = document.getElementById("tool-modal-nav");
  const prevBtn    = document.getElementById("tool-modal-prev");
  const nextBtn    = document.getElementById("tool-modal-next");
  if (!nav || !overlay) return;

  const motivationQuotes = [
    "Pain is temporary.\nQuitting lasts forever.",
    "Discipline will take you where motivation never can.\nChoose discipline.",
    "Nobody is coming to save you.\nSave yourself.",
    "Every excuse makes you weaker.\nEvery action makes you stronger.",
    "The hard road builds the strongest people.\nTake the hard road.",
    "Stop talking.\nStart working.",
    "Your comfort is your biggest enemy.\nLeave it behind.",
    "Winners train when losers sleep.\nBe the winner.",
    "Earn your results.\nNobody owes you anything.",
    "If it hurts, keep going.\nThat is where growth begins.",
    "Weak habits create weak lives.\nStrong habits create strong lives.",
    "Every day you skip, someone else gets ahead.",
    "Respect is earned through action, not words.",
    "Your future depends on what you do today.\nNot tomorrow.",
    "Work until your excuses have no voice.\nKeep pushing.",
    "Stay focused.\nStay dangerous.",
    "The mirror never lies.\nThe work always shows.",
    "Push harder than you did yesterday.\nNever slow down.",
    "Success belongs to people who never stop fighting.\nKeep fighting.",
    "Comfort feels good today, but destroys tomorrow.",
    "Make your actions louder than your promises.\nResults matter.",
    "Every battle you win starts in your mind.",
    "Be so disciplined that failure gets tired of chasing you.",
    "Your limits are only excuses wearing a mask.",
    "Outwork everyone.\nLet the results speak.",
    "Every drop of sweat is proof that you refused to quit.",
    "Do the work even when nobody is watching.",
    "Stay hungry.\nStay relentless.",
    "The strongest people are built by the hardest days.",
    "You either control your mind or your mind controls you.",
  ];

  let quoteBag = [];
  const quoteHistory = [];
  let historyPos = -1;

  function refillBag() {
    quoteBag = motivationQuotes.map((_, i) => i);
    for (let i = quoteBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quoteBag[i], quoteBag[j]] = [quoteBag[j], quoteBag[i]];
    }
  }

  function drawNextQuote() {
    if (quoteBag.length === 0) refillBag();
    const i = quoteBag.pop();
    quoteHistory.push(i);
    historyPos = quoteHistory.length - 1;
    return motivationQuotes[i];
  }

  function renderQuoteNav() {
    prevBtn.disabled = historyPos <= 0;
  }

const tools = {
    bmi:        { title: "",               isBmi: true },
    nutrition:  { title: "Nutrition Tips", isNutrition: true },
    motivation: { title: "Motivation",     body: "", isQuote: true },
  };

  const bmiTips = {
    underweight: [
      "Eat healthy meals every day.",
      "Add more fruits, vegetables, and protein to your meals.",
      "Drink enough water.",
      "Exercise to build strong muscles.",
      "Get enough sleep every night.",
    ],
    normal: [
      "Exercise for at least 60 minutes most days.",
      "Drink plenty of water.",
      "Get enough sleep.",
      "Limit sugary drinks and junk food.",
    ],
    overweight: [
      "Eat smaller portions.",
      "Choose more fruits and vegetables.",
      "Exercise every day.",
      "Drink water instead of sugary drinks.",
      "Eat less fast food and junk food.",
      "Get enough sleep each night.",
    ],
  };

  const bmiCategoryLabel = {
    underweight: "Underweight",
    normal:      "Normal weight",
    overweight:  "Overweight",
  };

  function getBmiCategory(bmi) {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25)   return "normal";
    return "overweight";
  }

  function renderBmiForm() {
    bodyEl.innerHTML = `
      <form class="bmi-form" id="bmi-form">
        <div class="bmi-field">
          <label for="bmi-weight">Weight (kg)</label>
          <input type="number" id="bmi-weight" step="0.1" min="1" required>
        </div>
        <div class="bmi-field">
          <label for="bmi-height">Height (m)</label>
          <input type="number" id="bmi-height" step="0.01" min="0.5" required>
        </div>
        <button type="submit" class="bmi-submit">Calculate</button>
      </form>
    `;

    bodyEl.querySelector("#bmi-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const weight = parseFloat(bodyEl.querySelector("#bmi-weight").value);
      const height = parseFloat(bodyEl.querySelector("#bmi-height").value);
      if (!weight || !height) return;

      const bmi      = weight / (height * height);
      const category = getBmiCategory(bmi);
      renderBmiResult(bmi, category);
    });
  }

  function renderBmiResult(bmi, category) {
    const tips = bmiTips[category];
    bodyEl.innerHTML = `
      <div class="bmi-result">
        <p class="bmi-score">Your BMI is ${bmi.toFixed(1)} — <strong class="bmi-category">${bmiCategoryLabel[category]}</strong></p>
        <ol class="bmi-tips">
          ${tips.map((tip) => `<li>${tip}</li>`).join("")}
        </ol>
        <button type="button" class="bmi-back" id="bmi-back">&larr; Recalculate</button>
      </div>
    `;

    bodyEl.querySelector("#bmi-back").addEventListener("click", renderBmiForm);
  }

  const nutritionItems = [
    { image: "https://visbody.com/wp-content/uploads/2023/05/FOOD-2.webp", label: "Muscle Growth (Hypertrophy)" },
    { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuOl0VdtNXojuhnrrnwy-WdfzYTSrIUoVnwGssXd9yw9BEOk-hQRZQU_OD&s=10", label: "Strength" },
    { image: "https://lh3.googleusercontent.com/IMRMrRQ0QR1OO3nhhCbmcWdkpeWJScfFc-HknppblOM4v5rhIs39zqCDjxsuv4avube6koeciT0YdY0zwqfcGHg", label: "Endurance" },
    { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXu9dg4Fi8_RsYlJRCd1HZsUcxevimtFAZEivWNRCgMcpE0KXGMZiUtHU&s=10", label: "Weight Loss (Fat Loss)" },
    { image: "https://healthandwellnesschiropractic.com/wp-content/uploads/2025/05/veggies-and-fruits-1024x621.webp", label: "Flexibility" },
    { image: "https://cdn.mos.cms.futurecdn.net/zQee9UCQr9hHA64xXPUZxf-1000-80.jpg", label: "Power" },
  ];

  let nutritionIndex = 0;

  function renderNutritionCard() {
    const item = nutritionItems[nutritionIndex];
    bodyEl.innerHTML = `
      <div class="nutrition-card">
        <div class="nutrition-card-image">
          <img src="${item.image}" alt="${item.label}">
        </div>
        <p class="nutrition-card-label">${item.label}</p>
      </div>
    `;
  }
let activeTool = null;

function openTool(key) {
    const tool = tools[key];
    if (!tool) return;

    window._closeMobileMenu?.();
    window._closeAdmin?.();
    window._closeQuiz?.();

    activeTool = key;
    titleEl.textContent = tool.title;
    titleEl.style.display = tool.title ? "" : "none";

    if (tool.isQuote) {
      quoteHistory.length = 0;
      historyPos = -1;
      bodyEl.textContent = drawNextQuote();
      navEl.hidden = false;
      renderQuoteNav();
    } else if (tool.isBmi) {
      renderBmiForm();
      navEl.hidden = true;
    } else if (tool.isNutrition) {
      nutritionIndex = 0;
      renderNutritionCard();
      prevBtn.disabled = false;
      navEl.hidden = false;
    } else {
      bodyEl.textContent = tool.body;
      navEl.hidden = true;
    }

    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeTool() {
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  window._closeTool = closeTool;

  nav.querySelectorAll(".quick-nav-item[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => openTool(btn.dataset.tool));
  });

  const mobileRow = document.getElementById("mobile-quick-row");
  mobileRow?.querySelectorAll(".mobile-quick-item[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => openTool(btn.dataset.tool));
  });

  closeBtn?.addEventListener("click", closeTool);

  nextBtn?.addEventListener("click", () => {
    if (activeTool === "nutrition") {
      nutritionIndex = (nutritionIndex + 1) % nutritionItems.length;
      renderNutritionCard();
    } else {
      bodyEl.textContent = drawNextQuote();
      renderQuoteNav();
    }
  });

  prevBtn?.addEventListener("click", () => {
    if (activeTool === "nutrition") {
      nutritionIndex = (nutritionIndex - 1 + nutritionItems.length) % nutritionItems.length;
      renderNutritionCard();
    } else {
      if (historyPos <= 0) return;
      historyPos -= 1;
      bodyEl.textContent = motivationQuotes[quoteHistory[historyPos]];
      renderQuoteNav();
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeTool();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTool();
  });
}

   if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

function getFallbackType(img) {
  const card = img.closest(".gallery-card[data-card]");
  if (card) {
    const map = {
      equipment: "gym",
      training: "gym",
      aerobics: "aerobics",
      spa: "spa",
      interior: "interior",
    };
    return map[card.dataset.card] || "gallery";
  }
  if (img.closest(".gallery-page-card")) return "gallery";
  if (img.closest(".about-media") || img.closest(".portal-media")) return "portrait";
  if (img.closest(".gym-media")) return "gym";
  if (img.closest(".spa-media")) return "spa";
  if (img.closest(".hero-media")) return "interior";
  if (img.closest("#gallery-lightbox")) return "gallery";
  return "default";
}

function applyImageFallback(img) {
  if (!img || img.dataset.fallbackApplied === "true") return;
  if (img.closest("[data-img-fallback]")) return;

  img.dataset.fallbackApplied = "true";

  const wrapper = document.createElement("span");
  wrapper.setAttribute("data-img-fallback", "");
  wrapper.setAttribute("data-type", getFallbackType(img));
  wrapper.style.display = "block";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";

  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);

  const content = document.createElement("span");
  content.className = "img-fallback-content";
  content.innerHTML = `
    <span class="img-fallback-icon" data-type="${wrapper.dataset.type}"></span>
    <span class="img-fallback-text">Image couldn't be loaded</span>
  `;
  wrapper.appendChild(content);

  const markBroken = () => wrapper.classList.add("is-broken");

  img.addEventListener("error", markBroken);

  if (img.complete && img.naturalWidth === 0) {
    markBroken();
  }
}

function initImageFallbacks() {
  document.querySelectorAll("img").forEach(applyImageFallback);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.tagName === "IMG") {
          applyImageFallback(node);
        } else {
          node.querySelectorAll?.("img").forEach(applyImageFallback);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function initPaymentCopy() {
  const items = document.querySelectorAll(".payment-copy-item");

  items.forEach((item) => {
    item.addEventListener("click", async () => {
      const value = item.dataset.copy;
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
      } catch (err) {
        const temp = document.createElement("textarea");
        temp.value = value;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }

      const numberEl = item.querySelector(".payment-number");
      const iconEl = item.querySelector(".copy-icon");
      const originalNumber = numberEl.textContent;
      const originalIcon = iconEl.textContent;

      item.classList.add("copied");
      numberEl.textContent = "Copied";
      iconEl.textContent = "✓";

      setTimeout(() => {
        item.classList.remove("copied");
        numberEl.textContent = originalNumber;
        iconEl.textContent = originalIcon;
      }, 3000);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeaderScroll();
  initMobileMenu();
  initActiveSection();
  initLanguageSwitch();
  initBackgroundScene();
  initGalleryAccordion();
  initGalleryFullPage();
  initBlurContact();
  initAdminToggle();
  initPhoneTracking();
  initBookingQuiz();
  initQuickNav();
  initImageFallbacks();
  initPaymentCopy();
});
