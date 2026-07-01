/* ==========================================================================
   HIRUY GYM & SPA — script.js
   Combines: UI/nav logic + three.js ambient background scene
   ========================================================================== */

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

  // Close when a nav link inside the mobile menu is tapped
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on outside tap
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close on escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Expose closeMenu so initBookingQuiz can call it
  window._closeMobileMenu = closeMenu;
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
   5. CONTACT FORM
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
   5c. ADMIN OVERLAY TOGGLE
   FIX 1: Added #admin-close button listener (visible close button in HTML)
   FIX 2: Backdrop click and Escape key both close cleanly
   FIX 3: Wrong password triggers shake animation (CSS keyframe added in style.css)
   FIX 4: overlay.setAttribute("aria-hidden") kept in sync on open/close
   ========================================================================== */

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
  // Clean up Firestore listener
  if (unsubscribeViewed) { unsubscribeViewed(); unsubscribeViewed = null; }
  // Reset back to login view for next time
  portalView?.classList.remove("is-active");
  loginView?.classList.remove("is-hidden");
  // Reset tabs back to overview
  switchTab("overview");
}

  window._closeAdmin = closeAdmin;

  function showPortal() {
  loginView?.classList.add("is-hidden");
  portalView?.classList.add("is-active");
  // Placeholder stat
  const placeholderPercent = 68;
  if (donutFill) {
    const offset = 97.4 - (97.4 * placeholderPercent) / 100;
    requestAnimationFrame(() => {
      donutFill.style.strokeDashoffset = offset;
    });
  }
  if (donutValue) donutValue.textContent = `${placeholderPercent}%`;

  // Real-time viewed count
  initViewedCard();

  // Tab switching
  initPortalTabs();

  // Analytics (chart + table)
  initAnalytics();
}

function initPortalTabs() {
  const tabs = document.querySelectorAll(".portal-tab");
  tabs.forEach(tab => {
    // Remove old listeners by replacing node
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

  // Unsubscribe any previous listener
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
    // Build a map of date -> count for last 14 days
    const today = new Date();
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().slice(0, 10)); // "YYYY-MM-DD"
    }

    const counts = {};
    days.forEach(d => counts[d] = 0);

    snap.forEach(docSnap => {
      const ts = docSnap.data().timestamp?.toDate?.();
      if (!ts) return;
      const key = ts.toISOString().slice(0, 10);
      if (counts[key] !== undefined) counts[key]++;
    });

    // Desktop chart (hidden on mobile via CSS)
    drawChart(days, counts);
    drawMiniGraph(days, counts);
    drawTable(days, counts);

    // Wire up mobile graph overlay button
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

  // Replace button to avoid stacking listeners on re-renders
  const freshBtn = graphBtn.cloneNode(true);
  graphBtn.parentNode.replaceChild(freshBtn, graphBtn);

  freshBtn.addEventListener("click", () => {
    overlay.classList.add("is-active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // Draw chart into the mobile canvas after overlay is visible
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

  // Measure the real available space inside the card, accounting for its padding
  const cardStyles = getComputedStyle(canvas.parentElement);
  const paddingLeft = parseFloat(cardStyles.paddingLeft) || 0;
  const paddingRight = parseFloat(cardStyles.paddingRight) || 0;
  const W = canvas.parentElement.clientWidth - paddingLeft - paddingRight || 300;

  // Ask the actual screen what height the canvas is allowed to be right now
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

  // Y axis: nice round ticks
  const yTickCount = 4;
  const yTickStep  = Math.ceil(maxVal / yTickCount) || 1;
  const yMax       = yTickStep * yTickCount;

  // Point coordinates (use yMax so scale matches ticks)
  const pts = values.map((v, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + chartH - (v / yMax) * chartH,
    v,
  }));

  // Smooth bezier path builder
  function buildCurve() {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
  }

  // Y axis ticks + horizontal grid lines
  ctx.font = "10px Manrope, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= yTickCount; i++) {
    const val = yTickStep * i;
    const y   = pad.top + chartH - (val / yMax) * chartH;

    // Grid line
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    // Y label
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillText(val, pad.left - 8, y + 3.5);
  }

  // X axis tick labels (day numbers 1–14)
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  days.forEach((_, i) => {
    if (i % 2 !== 0) return;
    const x = pad.left + i * xStep;
    ctx.fillText(i + 1, x, H - 8);
  });

  // Axis lines
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  // Gradient fill under curve
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0, "rgba(91,127,224,0.35)");
  grad.addColorStop(1, "rgba(91,127,224,0)");

  buildCurve();
  ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
  ctx.lineTo(pts[0].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Smooth blue line
  buildCurve();
  ctx.strokeStyle = "#5b7fe0";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap  = "round";
  ctx.stroke();

  // Dots — glow on non-zero points
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

  // Gradient fill
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

  // Line
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

  const labels = [...days].reverse(); // today first
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

  // Open
  adminBtn.addEventListener("click", openAdmin);
const adminBtnMobile = document.getElementById("admin-btn-mobile");
if (adminBtnMobile) adminBtnMobile.addEventListener("click", () => { window._closeMobileMenu?.(); openAdmin(); });

  // FIX: Visible close button wired up
  if (closeBtn) {
    closeBtn.addEventListener("click", closeAdmin);
  }

  // Close on backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAdmin();
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-active")) closeAdmin();
  });

  // FIX: Enter key submits password with visual shake on wrong input
  if (passwordInput) {
    passwordInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const isCorrect = await checkAccessKey(passwordInput.value);
        if (isCorrect) {
          showPortal();
        } else {
          passwordInput.classList.remove("shake"); // reset so re-trigger works
          void passwordInput.offsetWidth;           // force reflow
          passwordInput.classList.add("shake");
          setTimeout(() => passwordInput.classList.remove("shake"), 500);
        }
      }
    });
  }

  // Eye toggle
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

/* ==========================================================================
   5d. AURORA BACKGROUND (canvas, for admin overlay)
   ========================================================================== */

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

/* ==========================================================================
   5b. CONTACT — blur-in text reveal (heading, lead, details)
   ========================================================================== */

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

/* ==========================================================================
   6. THREE.JS BACKGROUND SCENE
   ========================================================================== */

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

  // Starfield
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

  // Shooting stars
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

  // Dust
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

  // Orbs
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

  // Scroll opacity
  function updateScrollOpacity() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    canvas.style.opacity = Math.max(0.45, 1 - scrollY / (vh * 1.6)).toFixed(2);
  }
  window.addEventListener("scroll", updateScrollOpacity, { passive: true });
  updateScrollOpacity();

  // Resize
  function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", handleResize);

  // Animation loop
  // Animation loop
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

/* ==========================================================================
   7. GALLERY ACCORDION
   ========================================================================== */

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

/* ==========================================================================
   8. PHONE CLICK TRACKING
   ========================================================================== */

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

/* ==========================================================================
   9. BOOKING QUIZ
   FIX 1: Mobile menu is closed before quiz opens — no more scroll-lock conflict
   FIX 2: openQuiz resets nextBtn display and dotsEl display on re-open
           (previously if you reopened after submit, Next btn was still hidden)
   FIX 3: All book triggers use consistent selector
   ========================================================================== */

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
    // FIX: Close mobile menu first to avoid scroll-lock conflict
    if (typeof window._closeMobileMenu === "function") {
      window._closeMobileMenu();
    }
    window._closeAdmin?.();
    window._closeTool?.();

    current  = 0;
    answers  = [];
    selected = null;

    // FIX: Reset visibility of next/dots in case quiz was previously submitted
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
      // Save to Firebase
      try {
        await addDoc(collection(db, "agents", "hiruy_gym", "logs"), {
          timestamp: serverTimestamp(),
          action: "booking_quiz",
          answers
        });
      } catch (err) {
        console.error("Quiz log failed:", err);
      }

      // Show thank you
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

  // Wire up all book triggers
  document.querySelectorAll(".book-trigger, #book-btn-nav, #book-btn-mobile").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openQuiz();
    });
  });

  closeBtn.addEventListener("click", closeQuiz);
  nextBtn.addEventListener("click", handleNext);

  // Close on backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeQuiz();
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQuiz();
  });
}

/* ==========================================================================
   10. QUICK ACCESS PILL NAV — BMI / Nutrition / Motivation / How-To modals
   ========================================================================== */

function initQuickNav() {
  const nav        = document.getElementById("quick-nav");
  const overlay    = document.getElementById("tool-modal-overlay");
  const modal      = document.getElementById("tool-modal");
  const closeBtn   = document.getElementById("tool-modal-close");
  const titleEl    = document.getElementById("tool-modal-title");
  const bodyEl     = document.getElementById("tool-modal-body");
  if (!nav || !overlay) return;

  const tools = {
    bmi:        { title: "BMI Calculator", body: "This tool is coming soon." },
    nutrition:  { title: "Nutrition Tips", body: "This tool is coming soon." },
    motivation: { title: "Motivation",     body: "This tool is coming soon." },
    howto:      { title: "How To",         body: "This tool is coming soon." },
  };

  function openTool(key) {
    const tool = tools[key];
    if (!tool) return;

    window._closeMobileMenu?.();
    window._closeAdmin?.();
    window._closeQuiz?.();

    titleEl.textContent = tool.title;
    bodyEl.textContent  = tool.body;

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

  // Wire up the 4 canvas buttons (TikTok link needs no JS — it's a plain <a>)
  nav.querySelectorAll(".quick-nav-item[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => openTool(btn.dataset.tool));
  });

  // Wire up the matching row inside the fullscreen mobile menu
  const mobileRow = document.getElementById("mobile-quick-row");
  mobileRow?.querySelectorAll(".mobile-quick-item[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => openTool(btn.dataset.tool));
  });

  closeBtn?.addEventListener("click", closeTool);

  // Close on backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeTool();
  });

  // Close on Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTool();
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */

   if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeaderScroll();
  initMobileMenu();
  initActiveSection();
  initContactForm();
  initBackgroundScene();
  initGalleryAccordion();
  initGalleryFullPage();
  initBlurContact();
  initAdminToggle();
  initPhoneTracking();
  initBookingQuiz();
  initQuickNav();
});
