/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — FIREBASE.JS
   Firestore integration — universal rate storage
   ─────────────────────────────────────────────────────────
   - Initialises Firebase via CDN (no npm needed)
   - OV_fbSaveRates(rates, adminKey) → writes to Firestore
   - OV_fbLoadRates(callback)        → reads from Firestore
   - OV_fbWatchRates(callback)       → real-time listener
   All other scripts call these helpers only.
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Firebase config ─────────────────────────────────── */
  var FB_CONFIG = {
    apiKey:            "AIzaSyCdolGtyG4Cx2eiNz2F3NxWZr7pYU_GtBU",
    authDomain:        "officialvalue-exchange.firebaseapp.com",
    projectId:         "officialvalue-exchange",
    storageBucket:     "officialvalue-exchange.firebasestorage.app",
    messagingSenderId: "72361751068",
    appId:             "1:72361751068:web:61e6a9365616d7317e65d9"
  };

  /* ── Firestore document path ─────────────────────────── */
  var COLLECTION = 'rates';
  var DOC_ID     = 'giftcards';
  var ADMIN_KEY  = 'OV_secret_2026';

  /* ── Internal state ──────────────────────────────────── */
  var _db       = null;
  var _ready    = false;
  var _queue    = [];   /* callbacks waiting for init */
  var _unwatch  = null; /* unsubscribe real-time listener */

  /* ── Load Firebase SDK dynamically ───────────────────── */
  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function () {
      console.warn('[OV Firebase] Failed to load:', src);
      cb(new Error('load failed'));
    };
    document.head.appendChild(s);
  }

  function init() {
    /* Firebase v9 compat CDN — works with plain <script> tags */
    var BASE = 'https://www.gstatic.com/firebasejs/10.12.2/';
    loadScript(BASE + 'firebase-app-compat.js', function (err) {
      if (err) { notifyReady(false); return; }
      loadScript(BASE + 'firebase-firestore-compat.js', function (err2) {
        if (err2) { notifyReady(false); return; }
        try {
          /* Avoid double-init if something else loaded Firebase */
          if (!firebase.apps.length) {
            firebase.initializeApp(FB_CONFIG);
          }
          _db = firebase.firestore();
          notifyReady(true);
        } catch (e) {
          console.warn('[OV Firebase] Init error:', e);
          notifyReady(false);
        }
      });
    });
  }

  function notifyReady(ok) {
    _ready = ok;
    _queue.forEach(function (fn) { fn(ok); });
    _queue = [];
  }

  function whenReady(cb) {
    if (_ready !== null && _db !== null) { cb(true);  return; }
    if (_ready === false)                { cb(false); return; }
    _queue.push(cb);
  }

  /* ── Save rates to Firestore (admin only) ────────────── */
  window.OV_fbSaveRates = function (rates, adminKey, onSuccess, onError) {
    if (adminKey !== ADMIN_KEY) {
      if (onError) onError(new Error('Unauthorised'));
      return;
    }
    whenReady(function (ok) {
      if (!ok) { if (onError) onError(new Error('Firebase unavailable')); return; }
      var payload = { adminKey: adminKey, rates: rates, updatedAt: new Date().toISOString() };
      _db.collection(COLLECTION).doc(DOC_ID).set(payload)
        .then(function () { if (onSuccess) onSuccess(); })
        .catch(function (e) { if (onError) onError(e); });
    });
  };

  /* ── Load rates from Firestore (one-time read) ───────── */
  window.OV_fbLoadRates = function (onSuccess, onError) {
    whenReady(function (ok) {
      if (!ok) { if (onError) onError(new Error('Firebase unavailable')); return; }
      _db.collection(COLLECTION).doc(DOC_ID).get()
        .then(function (doc) {
          if (doc.exists && doc.data().rates) {
            if (onSuccess) onSuccess(doc.data().rates);
          } else {
            if (onError) onError(new Error('No rates in Firestore yet'));
          }
        })
        .catch(function (e) { if (onError) onError(e); });
    });
  };

  /* ── Watch rates in real time ────────────────────────── */
  window.OV_fbWatchRates = function (onChange) {
    whenReady(function (ok) {
      if (!ok) return;
      if (_unwatch) _unwatch(); /* cancel previous listener */
      _unwatch = _db.collection(COLLECTION).doc(DOC_ID)
        .onSnapshot(function (doc) {
          if (doc.exists && doc.data().rates) {
            onChange(doc.data().rates);
          }
        }, function (e) {
          console.warn('[OV Firebase] Watch error:', e);
        });
    });
  };

  /* ── Expose admin key for admin.js to use ────────────── */
  window.OV_FB_ADMIN_KEY = ADMIN_KEY;

  /* ── Boot ────────────────────────────────────────────── */
  init();

})();