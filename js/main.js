/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — MAIN.JS
   ─────────────────────────────────────────────────────────
   1.  Page loader       — fetch & inject pages/[name].html
   2.  Navbar scroll     — .scrolled class on scroll
   3.  Mobile nav        — hamburger open / close
   4.  FAQ accordion     — toggleFaq()
   5.  Asset tab switch  — switchTab()
   6.  Stat counters     — animated count-up
   7.  Magnetic buttons  — subtle pointer tracking
   8.  Widget tilt       — 3D tilt on hero rate widget
   9.  Init              — runs on DOMContentLoaded
   ─────────────────────────────────────────────────────────
   VISIBILITY RULE:
   No element is ever set to opacity:0 or hidden by this
   file. Page transitions use CSS animation classes only.
   Content is always visible — JS only enhances.
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONSTANTS
  ══════════════════════════════════════════════════════ */
  var CONTENT_ID   = 'pageContent';
  var PAGES_DIR    = 'pages/';
  var DEFAULT_PAGE = 'home';

  /* Simple in-memory cache — each page file fetched once */
  var pageCache   = {};
  var currentPage = null;


  /* ══════════════════════════════════════════════════════
     1. PAGE LOADER
  ══════════════════════════════════════════════════════ */

  window.showPage = function (name, pushState) {
    if (pushState === undefined) pushState = true;

    var container = document.getElementById(CONTENT_ID);
    if (!container) return;

    /* Don't reload same page — just scroll to top */
    if (name === currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMobileNav();
      return;
    }

    /* Update URL */
    if (pushState) {
      var url = name === DEFAULT_PAGE ? './' : '#' + name;
      history.pushState({ page: name }, '', url);
    }

    /* Update nav active state immediately */
    setNavActive(name);
    closeMobileNav();

    /* Show loading spinner */
    showLoader(container);

    /* Fetch from cache or network */
    if (pageCache[name]) {
      injectPage(container, name, pageCache[name]);
    } else {
      fetchPage(container, name);
    }
  };

  /* ── Fetch page HTML file ─────────────────────────── */
  function fetchPage(container, name) {
    fetch(PAGES_DIR + name + '.html')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        pageCache[name] = html;
        injectPage(container, name, html);
      })
      .catch(function (err) {
        console.error('[OV] Page load failed:', err.message);
        showError(container, name);
      });
  }

  /* ── Inject HTML and run post-load tasks ──────────── */
  function injectPage(container, name, html) {
    currentPage = name;

    /* 1. Inject the HTML — content is immediately visible */
    container.innerHTML = html;

    /* 2. Scroll to top */
    window.scrollTo({ top: 0, behavior: 'instant' });

    /* 3. Add entrance animation class — purely cosmetic,
          does NOT hide content, just adds a smooth slide-up */
    container.classList.remove('page-entering');
    void container.offsetWidth; /* force reflow to restart animation */
    container.classList.add('page-entering');

    /* Remove animation class after it completes */
    setTimeout(function () {
      container.classList.remove('page-entering');
    }, 400);

    /* 4. Run page-specific initialisers */
    setTimeout(function () {
      initMagnetic();
      initWidgetTilt();

      if (name === 'home') {
        initCounters();
        if (typeof window.OV_refreshPrices === 'function') {
          window.OV_refreshPrices();
        }
        if (typeof window.OV_syncRatesToPage === 'function') {
          window.OV_syncRatesToPage();
        }
      }

      if (name === 'rates') {
        if (typeof window.OV_refreshPrices === 'function') {
          window.OV_refreshPrices();
        }
        if (typeof window.populateRatesTable === 'function') {
          window.populateRatesTable();
        }
      }

      if (name === 'admin') {
        if (typeof window.initAdminPanel === 'function') {
          window.initAdminPanel();
        }
      }

      /* Re-init cursor hover targets */
      if (typeof window.initCursorHover === 'function') {
        window.initCursorHover();
      }

      /* Re-init GSAP scroll animations */
      if (typeof window.initPageAnimations === 'function') {
        window.initPageAnimations();
      }

    }, 50);
  }

  /* ── Loading spinner ──────────────────────────────── */
  function showLoader(container) {
    container.innerHTML =
      '<div style="' +
        'min-height:60vh;display:flex;align-items:center;' +
        'justify-content:center;flex-direction:column;gap:16px;' +
      '">' +
        '<div style="' +
          'width:36px;height:36px;border-radius:50%;' +
          'border:2.5px solid rgba(251,191,36,0.15);' +
          'border-top-color:#FBBF24;' +
          'animation:spin 0.8s linear infinite;' +
        '"></div>' +
        '<p style="' +
          'font-family:\'JetBrains Mono\',monospace;font-size:11px;' +
          'color:#60607a;letter-spacing:2px;' +
        '">LOADING</p>' +
      '</div>';
  }

  /* ── Error state ──────────────────────────────────── */
  function showError(container, name) {
    container.innerHTML =
      '<div style="' +
        'min-height:60vh;display:flex;align-items:center;' +
        'justify-content:center;flex-direction:column;' +
        'gap:16px;padding:5%;text-align:center;' +
      '">' +
        '<div style="font-size:40px;">&#9888;</div>' +
        '<h2 style="font-family:\'Syne\',sans-serif;font-size:20px;color:#eeeeff;">' +
          'Could not load page' +
        '</h2>' +
        '<p style="color:#6b6b8a;font-size:14px;">' +
          'Make sure <code>pages/' + name + '.html</code> exists.' +
        '</p>' +
        '<button onclick="showPage(\'home\')" ' +
          'style="background:linear-gradient(135deg,#FBBF24,#D97706);' +
          'color:#050510;font-family:\'Syne\',sans-serif;font-weight:700;' +
          'font-size:13px;border:none;border-radius:10px;' +
          'padding:10px 22px;cursor:pointer;margin-top:8px;">' +
          'Back to Home' +
        '</button>' +
      '</div>';
  }

  /* ── Browser back / forward ───────────────────────── */
  window.addEventListener('popstate', function (e) {
    var page = (e.state && e.state.page) ? e.state.page : DEFAULT_PAGE;
    showPage(page, false);
  });


  /* ══════════════════════════════════════════════════════
     2. NAVBAR SCROLL
  ══════════════════════════════════════════════════════ */
  function initNavbarScroll() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Update active link highlight ────────────────── */
  function setNavActive(name) {
    document.querySelectorAll('.nav-links a[data-page]').forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === name);
    });
    document.querySelectorAll('.mobile-nav-link[data-page]').forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === name);
    });
  }


  /* ══════════════════════════════════════════════════════
     3. MOBILE NAV
  ══════════════════════════════════════════════════════ */
  var mobileOpen = false;

  function openMobileNav() {
    mobileOpen = true;
    var drawer = document.getElementById('mobileNav');
    var burger = document.getElementById('hamburger');
    if (drawer) drawer.classList.add('open');
    if (burger) {
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileOpen = false;
    var drawer = document.getElementById('mobileNav');
    var burger = document.getElementById('hamburger');
    if (drawer) drawer.classList.remove('open');
    if (burger) {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  window.toggleMobileNav = function () {
    if (mobileOpen) { closeMobileNav(); } else { openMobileNav(); }
  };

  /* Close on outside click */
  function initMobileNavOutsideClick() {
    document.addEventListener('click', function (e) {
      if (!mobileOpen) return;
      var drawer = document.getElementById('mobileNav');
      var burger = document.getElementById('hamburger');
      if (
        drawer && !drawer.contains(e.target) &&
        burger && !burger.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  /* Close on Escape key */
  function initKeyboardNav() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
  }


  /* ══════════════════════════════════════════════════════
     4. FAQ ACCORDION
     Called via onclick="toggleFaq(this)" in page HTML
  ══════════════════════════════════════════════════════ */
  window.toggleFaq = function (btn) {
    var item = btn.closest('.faq-item');
    if (!item) return;

    var isOpen = item.classList.contains('open');

    /* Close all open items */
    document.querySelectorAll('.faq-item.open').forEach(function (i) {
      i.classList.remove('open');
    });

    /* Open clicked item if it was closed */
    if (!isOpen) {
      item.classList.add('open');
    }
  };


  /* ══════════════════════════════════════════════════════
     5. ASSET TAB SWITCH
     Called via onclick="switchTab(this,'crypto')" etc.
  ══════════════════════════════════════════════════════ */
  window.switchTab = function (btn, tabName) {
    /* Update button active states */
    document.querySelectorAll('.assets-tabs .tab-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    /* Show/hide grids */
    var cryptoGrid    = document.getElementById('tab-crypto');
    var giftcardGrid  = document.getElementById('tab-giftcard');

    if (cryptoGrid)   cryptoGrid.style.display   = tabName === 'crypto'   ? 'grid' : 'none';
    if (giftcardGrid) giftcardGrid.style.display  = tabName === 'giftcard' ? 'grid' : 'none';
  };


  /* ══════════════════════════════════════════════════════
     6. STAT COUNTERS
     Elements: <span data-count="500" data-suffix="K+">
  ══════════════════════════════════════════════════════ */
  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';

    var target   = parseFloat(el.dataset.count  || '0');
    var suffix   = el.dataset.suffix  || '';
    var prefix   = el.dataset.prefix  || '';
    var decimal  = el.dataset.decimal === 'true';
    var duration = 1800;
    var start    = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var value    = target * eased;
      el.textContent = prefix + (decimal ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + (decimal ? target.toFixed(1) : target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    /* Use IntersectionObserver to trigger when visible */
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) {
      /* Show real value immediately as fallback text —
         counter will animate over it when visible */
      obs.observe(el);
    });
  }

  /* Expose so rates page can call it too */
  window.initCounters = initCounters;


  /* ══════════════════════════════════════════════════════
     7. MAGNETIC BUTTONS
     Elements with class="magnetic"
  ══════════════════════════════════════════════════════ */
  function attachMagnetic(el) {
    if (el._magnetic) return;
    el._magnetic = true;

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.22;
      var dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.22;
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  }

  function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(attachMagnetic);
  }

  window.initMagnetic = initMagnetic;


  /* ══════════════════════════════════════════════════════
     8. WIDGET TILT
     3D tilt effect on the hero rate widget
  ══════════════════════════════════════════════════════ */
  function initWidgetTilt() {
    var widget = document.getElementById('rateWidget');
    if (!widget) return;

    widget.addEventListener('mousemove', function (e) {
      var rect = widget.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width  - 0.5;
      var y = (e.clientY - rect.top)  / rect.height - 0.5;
      widget.style.transform =
        'perspective(800px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 5) + 'deg) scale(1.01)';
    });

    widget.addEventListener('mouseleave', function () {
      widget.style.transform = '';
    });
  }


  /* ══════════════════════════════════════════════════════
     9. INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    initNavbarScroll();
    initMobileNavOutsideClick();
    initKeyboardNav();

    /* Read page from URL hash or load default */
    var hash      = window.location.hash.replace('#', '');
    var startPage = hash || DEFAULT_PAGE;

    /* Set initial history state */
    history.replaceState({ page: startPage }, '', window.location.href);

    /* Load the starting page */
    showPage(startPage, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();