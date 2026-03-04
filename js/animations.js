/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — ANIMATIONS.JS
   Particle canvas · GSAP scroll effects · Number shimmer
   ─────────────────────────────────────────────────────────
   RULE: This file only ADDS visual polish.
   It never hides, moves, or otherwise affects
   the visibility of any page content.
   All effects are purely decorative.
   ─────────────────────────────────────────────────────────
   1. Particle canvas  — floating gold dots in hero
   2. GSAP scroll      — subtle parallax + card stagger
   3. Number shimmer   — gold sweep on stat counters
   4. initPageAnimations — called by main.js after each load
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  /* ══════════════════════════════════════════════════════
     1. PARTICLE CANVAS
     Floating gold dots behind the hero section
  ══════════════════════════════════════════════════════ */
  function initParticleCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || prefersReduced) return;

    /* Prevent double-init */
    if (canvas._particleRunning) return;
    canvas._particleRunning = true;

    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || 600;
    }
    resize();

    var resizeObs = window.ResizeObserver
      ? new ResizeObserver(resize)
      : null;
    if (resizeObs) resizeObs.observe(canvas);
    else window.addEventListener('resize', resize, { passive: true });

    /* Build particles */
    var COUNT     = 50;
    var particles = [];
    var running   = true;

    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        o:  Math.random() * 0.35 + 0.06,
      });
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251,191,36,' + p.o + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    draw();

    /* Stop when canvas is removed from DOM */
    canvas._stopParticles = function () {
      running = false;
      if (resizeObs) resizeObs.disconnect();
    };
  }


  /* ══════════════════════════════════════════════════════
     2. GSAP SCROLL EFFECTS
     Only runs if GSAP + ScrollTrigger are loaded.
     Gracefully skips if unavailable.
  ══════════════════════════════════════════════════════ */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Kill any existing ScrollTriggers from previous page */
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

    /* ── Hero content subtle parallax ─────────────────── */
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    /* ── Feature cards stagger ────────────────────────── */
    var featGrids = document.querySelectorAll('.features-grid');
    featGrids.forEach(function (grid) {
      var cards = grid.querySelectorAll('.feat-card');
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 20, opacity: 0.6 },
        {
          y: 0, opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: grid,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* ── Step items stagger ───────────────────────────── */
    var stepItems = document.querySelectorAll('.step-item');
    if (stepItems.length) {
      gsap.fromTo(stepItems,
        { y: 16, opacity: 0.6 },
        {
          y: 0, opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.steps-wrap',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    /* ── Testimonial cards stagger ────────────────────── */
    var tGrids = document.querySelectorAll('.t-grid');
    tGrids.forEach(function (grid) {
      var cards = grid.querySelectorAll('.t-card');
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 20, opacity: 0.6 },
        {
          y: 0, opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: grid,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* ── Value cards stagger (about page) ─────────────── */
    var valueGrids = document.querySelectorAll('.values-grid');
    valueGrids.forEach(function (grid) {
      var cards = grid.querySelectorAll('.value-card');
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 16, opacity: 0.6 },
        {
          y: 0, opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: grid,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* ── Crypto rate cards stagger (rates page) ────────── */
    var rateGrids = document.querySelectorAll('.crypto-rates-grid');
    rateGrids.forEach(function (grid) {
      var cards = grid.querySelectorAll('.crypto-rate-card');
      if (!cards.length) return;
      gsap.fromTo(cards,
        { y: 16, opacity: 0.6 },
        {
          y: 0, opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: grid,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* NOTE on GSAP fromTo opacity values:
     We animate from opacity:0.6 to opacity:1
     NOT from opacity:0 — so content is always
     partially visible even before animation fires. */


  /* ══════════════════════════════════════════════════════
     3. NUMBER SHIMMER
     Gold shimmer sweep over stat numbers after count-up
  ══════════════════════════════════════════════════════ */
  function initNumberShimmer() {
    if (prefersReduced) return;

    var nums = document.querySelectorAll('.hero-stat-num');
    nums.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('shimmer-text');
        setTimeout(function () {
          el.classList.remove('shimmer-text');
        }, 1400);
      }, 2000 + i * 100);
    });
  }


  /* ══════════════════════════════════════════════════════
     4. initPageAnimations
     Called by main.js after every page load
  ══════════════════════════════════════════════════════ */
  window.initPageAnimations = function () {
    /* Small delay so DOM is fully painted */
    setTimeout(function () {
      initParticleCanvas();
      initGSAP();
      initNumberShimmer();
    }, 60);
  };


  /* ══════════════════════════════════════════════════════
     INIT on first load
  ══════════════════════════════════════════════════════ */
  function init() {
    /* Wait for main.js to load first page, then our
       initPageAnimations will be called from there.
       This just handles the very first load. */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(window.initPageAnimations, 100);
      });
    } else {
      setTimeout(window.initPageAnimations, 100);
    }
  }

  init();

})();