(function () {
  "use strict";

  const NODES = {
    root: {
      bot: "Hi 👋 I'm the Hiruy Assistant. What can I help you with?",
      options: [
        { label: "🕒 Hours & Location", to: "hours" },
        { label: "💳 Membership & Pricing", to: "pricing" },
        { label: "🏋️ Gym", to: "gym" },
        { label: "🧖 Spa", to: "spa" },
        { label: "📅 Booking", to: "booking" },
        { label: "☎️ Talk to a Human", to: "contact" },
      ],
    },
    hours: {
      bot: "We're open Mon – Sat, 6:00 — 22:00.\n\n📍 Bole Road, Addis Ababa, Ethiopia\n☎️ +251 900 000 000",
      options: [
        { label: "Call Us", action: "call" },
        { label: "Go to Contact Section", action: "scrollContact" },
      ],
    },
    pricing: {
      bot: "What would you like to know about membership?",
      options: [
        { label: "See All Plans", to: "pricingPlans" },
        { label: "Which Plan Is Right for Me?", to: "pricingHelp" },
        { label: "Book Now", action: "openQuiz" },
      ],
    },
    pricingPlans: {
      bot: "Gym Access — ETB 2,000/mo\n• Full gym floor access\n• Group class access\n• Locker & shower\n\nGym + Spa (Most Popular) — ETB 3,000/mo\n• Full gym floor access\n• Spa treatments\n• Priority class booking\n• Locker & shower",
      options: [
        { label: "View Membership Page", action: "scrollMembership" },
        { label: "Book Now", action: "openQuiz" },
      ],
    },
    pricingHelp: {
      bot: "Take our 30-second quiz and we'll recommend the right plan for you.",
      options: [{ label: "Take the Quiz", action: "openQuiz" }],
    },
    gym: {
      bot: "Our gym floor is built for every stage of training.",
      options: [
        { label: "What's Included?", to: "gymIncluded" },
        { label: "Book a Session", action: "openQuiz" },
      ],
    },
    gymIncluded: {
      bot: "• Free weights & power racks\n• Functional training zone\n• Cardio & conditioning floor\n• Personal & group coaching",
      options: [{ label: "Book a Session", action: "openQuiz" }],
    },
    spa: {
      bot: "Recovery is part of the work at Hiruy.",
      options: [
        { label: "What's Included?", to: "spaIncluded" },
        { label: "Book a Treatment", action: "openQuiz" },
      ],
    },
    spaIncluded: {
      bot: "• Deep tissue & sports massage\n• Hydrotherapy & sauna circuit\n• Skin & body treatments\n• Guided breathwork sessions",
      options: [{ label: "Book a Treatment", action: "openQuiz" }],
    },
    booking: {
      bot: "Ready to book? Our quick quiz matches you to the right plan and time.",
      options: [{ label: "Start Booking Quiz", action: "openQuiz" }],
    },
    contact: {
      bot: "We'd love to hear from you directly.",
      options: [
        { label: "Call +251 900 000 000", action: "call" },
        { label: "Go to Contact Form", action: "scrollContact" },
      ],
    },
  };

  const STYLE = `
    #hiruy-support-btn {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 940;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(145deg, var(--c-blue-deep, #12275c), var(--c-ink, #0b1b3a));
      color: #fff;
      box-shadow: 0 10px 28px rgba(11, 27, 58, 0.28);
      cursor: pointer;
      border: none;
      transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s cubic-bezier(0.22,1,0.36,1);
    }
    #hiruy-support-btn:hover { transform: scale(1.07); box-shadow: 0 14px 34px rgba(11, 27, 58, 0.34); }
    #hiruy-support-btn svg { width: 24px; height: 24px; }
    #hiruy-support-btn .hs-icon-close { display: none; }
    #hiruy-support-btn.is-open .hs-icon-chat { display: none; }
    #hiruy-support-btn.is-open .hs-icon-close { display: block; }

    #hiruy-support-panel {
      position: fixed;
      bottom: calc(1.5rem + 58px + 0.85rem);
      right: 1.5rem;
      z-index: 941;
      width: min(360px, 92vw);
      height: min(520px, 70vh);
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 20px;
      box-shadow: 0 24px 64px rgba(11, 27, 58, 0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0.9) translateY(8px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.28s cubic-bezier(0.22,1,0.36,1), visibility 0.28s;
    }
    #hiruy-support-panel.is-active {
      transform: scale(1) translateY(0);
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #hiruy-support-panel .hs-header {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.1rem;
      background: linear-gradient(145deg, var(--c-blue-deep, #12275c), var(--c-ink, #0b1b3a));
      color: #fff;
    }
    #hiruy-support-panel .hs-header h4 {
      margin: 0;
      font-family: var(--f-display, serif);
      font-size: 1.05rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    #hiruy-support-panel .hs-header span {
      display: block;
      font-family: var(--f-body, sans-serif);
      font-size: 0.72rem;
      opacity: 0.75;
      margin-top: 0.15rem;
    }
    #hiruy-support-panel .hs-close {
      background: none;
      border: none;
      color: #fff;
      opacity: 0.75;
      font-size: 1.3rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.2rem;
    }
    #hiruy-support-panel .hs-close:hover { opacity: 1; }

    #hiruy-support-panel .hs-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .hs-bubble {
      background: var(--c-blue-pale, #eaf1fb);
      color: var(--c-ink, #0b1b3a);
      padding: 0.75rem 0.95rem;
      border-radius: 14px 14px 14px 4px;
      font-family: var(--f-body, sans-serif);
      font-size: 0.88rem;
      line-height: 1.5;
      white-space: pre-line;
      max-width: 92%;
      align-self: flex-start;
      animation: hsFadeIn 0.25s ease-in-out;
    }

    @keyframes hsFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .hs-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .hs-option-btn {
      text-align: left;
      background: #fff;
      border: 1.5px solid rgba(11, 27, 58, 0.12);
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
      font-family: var(--f-body, sans-serif);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--c-ink, #0b1b3a);
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }
    .hs-option-btn:hover {
      background: var(--c-blue-pale, #eaf1fb);
      border-color: var(--c-blue-mid, #3d5aa6);
      transform: translateX(2px);
    }

    .hs-nav-row {
      flex: none;
      display: flex;
      gap: 0.5rem;
      padding: 0.7rem 1.1rem 1rem;
      border-top: 1px solid rgba(11,27,58,0.08);
    }
    .hs-nav-btn {
      flex: 1;
      background: transparent;
      border: 1.5px solid rgba(11,27,58,0.15);
      border-radius: 10px;
      padding: 0.5rem;
      font-family: var(--f-body, sans-serif);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--c-blue-deep, #12275c);
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .hs-nav-btn:hover { background: var(--c-blue-pale, #eaf1fb); }

    @media (max-width: 480px) {
      #hiruy-support-btn { bottom: 1rem; right: 1rem; width: 52px; height: 52px; }
      #hiruy-support-panel {
        bottom: calc(1rem + 52px + 0.7rem);
        right: 0.75rem;
        width: min(340px, 94vw);
        height: min(480px, 72vh);
      }
    }
  `;

  function injectStyle() {
    const style = document.createElement("style");
    style.id = "hiruy-support-style";
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  function buildMarkup() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "hiruy-support-btn";
    btn.setAttribute("aria-label", "Open customer support");
    btn.innerHTML = `
      <svg class="hs-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <svg class="hs-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;

    const panel = document.createElement("div");
    panel.id = "hiruy-support-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
      <div class="hs-header">
        <div>
          <h4>Hiruy Assistant</h4>
          <span>Usually replies instantly</span>
        </div>
        <button type="button" class="hs-close" id="hiruy-support-close" aria-label="Close support">&times;</button>
      </div>
      <div class="hs-body" id="hiruy-support-body"></div>
      <div class="hs-nav-row" id="hiruy-support-nav"></div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);
    return { btn, panel };
  }

  function initSupportWidget() {
    injectStyle();
    const { btn, panel } = buildMarkup();
    const bodyEl = panel.querySelector("#hiruy-support-body");
    const navEl = panel.querySelector("#hiruy-support-nav");
    const closeBtn = panel.querySelector("#hiruy-support-close");

    let currentId = "root";
    const history = [];

    function runAction(action) {
      switch (action) {
        case "openQuiz":
          document.getElementById("book-btn-nav")?.click();
          closePanel();
          break;
        case "scrollContact":
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "scrollMembership":
          document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "call":
          window.location.href = "tel:+251900000000";
          break;
      }
    }

    function navigateTo(id) {
      history.push(currentId);
      currentId = id;
      render();
    }

    function goBack() {
      if (history.length) {
        currentId = history.pop();
        render();
      }
    }

    function goHome() {
      history.length = 0;
      currentId = "root";
      render();
    }

    function render() {
      const node = NODES[currentId];
      if (!node) return;

      bodyEl.innerHTML = "";

      const bubble = document.createElement("div");
      bubble.className = "hs-bubble";
      bubble.textContent = node.bot;
      bodyEl.appendChild(bubble);

      const optionsWrap = document.createElement("div");
      optionsWrap.className = "hs-options";
      node.options.forEach((opt) => {
        const optBtn = document.createElement("button");
        optBtn.type = "button";
        optBtn.className = "hs-option-btn";
        optBtn.textContent = opt.label;
        optBtn.addEventListener("click", () => {
          if (opt.to) navigateTo(opt.to);
          else if (opt.action) runAction(opt.action);
        });
        optionsWrap.appendChild(optBtn);
      });
      bodyEl.appendChild(optionsWrap);
      bodyEl.scrollTop = 0;

      navEl.innerHTML = "";
      if (currentId !== "root") {
        const backBtn = document.createElement("button");
        backBtn.type = "button";
        backBtn.className = "hs-nav-btn";
        backBtn.textContent = "← Back";
        backBtn.addEventListener("click", goBack);

        const homeBtn = document.createElement("button");
        homeBtn.type = "button";
        homeBtn.className = "hs-nav-btn";
        homeBtn.textContent = "Start Over";
        homeBtn.addEventListener("click", goHome);

        navEl.appendChild(backBtn);
        navEl.appendChild(homeBtn);
      }
      navEl.style.display = currentId === "root" ? "none" : "flex";
    }

    function openPanel() {
      window._closeMobileMenu?.();
      window._closeAdmin?.();
      window._closeQuiz?.();
      window._closeTool?.();

      panel.classList.add("is-active");
      panel.setAttribute("aria-hidden", "false");
      btn.classList.add("is-open");
      btn.setAttribute("aria-label", "Close customer support");
    }

    function closePanel() {
      panel.classList.remove("is-active");
      panel.setAttribute("aria-hidden", "true");
      btn.classList.remove("is-open");
      btn.setAttribute("aria-label", "Open customer support");
    }

    btn.addEventListener("click", () => {
      const isOpen = panel.classList.contains("is-active");
      isOpen ? closePanel() : openPanel();
    });

    closeBtn.addEventListener("click", closePanel);

    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("is-active")) return;
      const path = e.composedPath();
      if (path.includes(panel) || path.includes(btn)) return;
      closePanel();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePanel();
    });

    window._closeSupport = closePanel;

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSupportWidget);
  } else {
    initSupportWidget();
  }
})();