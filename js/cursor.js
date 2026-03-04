/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — CURSOR.JS
   Custom gold cursor dot + ring
   ─────────────────────────────────────────────────────────
   - Moves cursor-dot instantly (no lag)
   - Moves cursor-ring with smooth lerp (slight lag)
   - Enlarges ring on hoverable elements
   - Hides on touch devices
   - Re-initialises hover targets after each page load
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Touch devices: skip entirely */
  if (!window.matchMedia('(hover: hover)').matches) return;

  var dot  = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  /* Current ring position for lerp */
  var ringX = 0, ringY = 0;
  /* Target position (where mouse actually is) */
  var mouseX = 0, mouseY = 0;

  /* Is ring in "expanded" state (hovering interactive element) */
  var expanded = false;

  /* ── Mouse move ─────────────────────────────────────── */
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Dot follows instantly */
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  /* ── Smooth ring lerp loop ──────────────────────────── */
  function lerpRing() {
    var ease = 0.14;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    requestAnimationFrame(lerpRing);
  }
  lerpRing();

  /* ── Hover state on interactive elements ────────────── */
  var HOVER_SELECTORS = [
    'a', 'button', '.btn', '.feat-card', '.t-card',
    '.nav-trade-btn', '.nav-wa-btn', '.tab-btn',
    '.asset-pill', '.faq-question', '.social-btn',
    '.contact-quick-btn', '.crypto-rate-card',
    '.mobile-nav-link', '[data-cursor="hover"]'
  ].join(',');

  function onEnter() {
    expanded = true;
    ring.style.width        = '48px';
    ring.style.height       = '48px';
    ring.style.borderColor  = 'rgba(251,191,36,0.7)';
    dot.style.transform     = 'translate(-50%,-50%) scale(0.5)';
  }

  function onLeave() {
    expanded = false;
    ring.style.width        = '32px';
    ring.style.height       = '32px';
    ring.style.borderColor  = 'rgba(251,191,36,0.5)';
    dot.style.transform     = 'translate(-50%,-50%) scale(1)';
  }

  /* ── Attach hover listeners ─────────────────────────── */
  function attachHover(el) {
    if (el._cursorAttached) return;
    el._cursorAttached = true;
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  }

  function initCursorHover() {
    document.querySelectorAll(HOVER_SELECTORS).forEach(attachHover);
  }

  /* Expose so main.js can call after each page load */
  window.initCursorHover = initCursorHover;

  /* ── Hide cursor when leaving window ────────────────── */
  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  /* ── Init ────────────────────────────────────────────── */
  initCursorHover();

})();