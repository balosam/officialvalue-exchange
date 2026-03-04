/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — FIREBASE.JS
   Firestore integration — universal rate storage
   Firebase SDK loaded via <script> tags in index.html
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var FB_CONFIG = {
    apiKey:            "AIzaSyCdolGtyG4Cx2eiNz2F3NxWZr7pYU_GtBU",
    authDomain:        "officialvalue-exchange.firebaseapp.com",
    projectId:         "officialvalue-exchange",
    storageBucket:     "officialvalue-exchange.firebasestorage.app",
    messagingSenderId: "72361751068",
    appId:             "1:72361751068:web:61e6a9365616d7317e65d9"
  };

  var COLLECTION = 'rates';
  var DOC_ID     = 'giftcards';
  var ADMIN_KEY  = 'OV_secret_2026';

  var _db = null;

  function init() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FB_CONFIG);
      }
      _db = firebase.firestore();
      console.log('[OV Firebase] Connected');
    } catch (e) {
      console.warn('[OV Firebase] Init failed:', e);
    }
  }

  /* ── Save rates to Firestore ─────────────────────────── */
  window.OV_fbSaveRates = function (rates, adminKey, onSuccess, onError) {
    if (!_db) { if (onError) onError(new Error('Firebase not initialised')); return; }
    var payload = {
      adminKey:  adminKey,
      rates:     rates,
      updatedAt: new Date().toISOString()
    };
    _db.collection(COLLECTION).doc(DOC_ID).set(payload)
      .then(function () { if (onSuccess) onSuccess(); })
      .catch(function (e) { if (onError) onError(e); });
  };

  /* ── Load rates from Firestore (one-time) ────────────── */
  window.OV_fbLoadRates = function (onSuccess, onError) {
    if (!_db) { if (onError) onError(new Error('Firebase not initialised')); return; }
    _db.collection(COLLECTION).doc(DOC_ID).get()
      .then(function (doc) {
        if (doc.exists && doc.data().rates) {
          if (onSuccess) onSuccess(doc.data().rates);
        } else {
          if (onError) onError(new Error('No rates in Firestore yet'));
        }
      })
      .catch(function (e) { if (onError) onError(e); });
  };

  /* ── Expose admin key ────────────────────────────────── */
  window.OV_FB_ADMIN_KEY = ADMIN_KEY;

  init();

})();