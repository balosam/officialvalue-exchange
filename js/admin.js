/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — ADMIN.JS
   Rate management — Firebase (universal) + localStorage (fallback)
   ─────────────────────────────────────────────────────────
   Save flow:  input fields → Firebase → localStorage backup
   Load flow:  Firebase first → fallback to localStorage → defaults
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE_KEY = 'ov_gc_rates';

  /* ── Default gift card rates ─────────────────────────── */
  var DEFAULT_RATES = {
    amazon:    { name: 'Amazon',     rate: 1450, unit: 'per $1' },
    apple:     { name: 'Apple',      rate: 1420, unit: 'per $1' },
    google:    { name: 'Google Play', rate: 1400, unit: 'per $1' },
    steam:     { name: 'Steam',      rate: 1380, unit: 'per $1' },
    netflix:   { name: 'Netflix',    rate: 1350, unit: 'per $1' },
    itunes:    { name: 'iTunes',     rate: 1400, unit: 'per $1' },
    ebay:      { name: 'eBay',       rate: 1380, unit: 'per $1' },
    walmart:   { name: 'Walmart',    rate: 1360, unit: 'per $1' },
    amex:      { name: 'Amex',       rate: 1420, unit: 'per $1' },
    xbox:      { name: 'Xbox',       rate: 1390, unit: 'per $1' },
    razergold: { name: 'Razer Gold', rate: 1480, unit: 'per $1' },
    mazy:      { name: "Macy's",     rate: 1360, unit: 'per $1' },
  };

  /* ── Load from localStorage or defaults ──────────────── */
  function loadLocalRates() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return Object.assign({}, DEFAULT_RATES, JSON.parse(stored));
    } catch (e) {}
    return Object.assign({}, DEFAULT_RATES);
  }

  /* ── Save to localStorage ────────────────────────────── */
  function saveLocal(rates) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rates)); } catch (e) {}
  }

  /* ── Toast ────────────────────────────────────────────── */
  function showToast(msg, type) {
    var toast = document.getElementById('adminToast');
    if (!toast) return;
    toast.textContent = msg || '✓ Saved';
    toast.style.background = type === 'error' ? '#ef4444' : '';
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
      toast.style.background = '';
    }, 3000);
  }

  /* ── Apply rates to all DOM displays ─────────────────── */
  function updateRateDisplays(rates) {
    Object.keys(rates).forEach(function (key) {
      document.querySelectorAll('[data-gc-rate="' + key + '"]').forEach(function (el) {
        el.textContent = '\u20A6' + rates[key].rate.toLocaleString() + ' / ' + rates[key].unit;
      });
    });
  }

  /* ── Populate admin input fields ─────────────────────── */
  function populateAdminFields(rates) {
    Object.keys(rates).forEach(function (key) {
      var input = document.getElementById('rate-' + key);
      if (input) input.value = rates[key].rate;
    });
  }

  /* ── Read current values from input fields ───────────── */
  function readFieldsIntoRates() {
    var rates = loadLocalRates();
    Object.keys(rates).forEach(function (key) {
      var input = document.getElementById('rate-' + key);
      if (input) {
        var val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) rates[key].rate = Math.round(val);
      }
    });
    return rates;
  }

  /* ── SAVE RATES — Firebase first, localStorage backup ── */
  window.OV_saveRates = function () {
    var rates = readFieldsIntoRates();

    /* Always save locally immediately so UI updates now */
    saveLocal(rates);
    updateRateDisplays(rates);

    /* Save to Firebase for universal sync */
    if (typeof window.OV_fbSaveRates === 'function') {
      showToast('Saving...', 'info');
      window.OV_fbSaveRates(
        rates,
        window.OV_FB_ADMIN_KEY,
        function () {
          showToast('✓ Rates saved — live on all devices!');
        },
        function (err) {
          console.warn('[OV Admin] Firebase save failed:', err);
          showToast('✓ Saved locally. Firebase sync failed — check connection.', 'error');
        }
      );
    } else {
      showToast('✓ Rates saved locally');
    }
  };

  /* ── Populate rates table (rates page) ────────────────── */
  window.populateRatesTable = function () {
    var rates = loadLocalRates();
    renderRatesTable(rates);
    updateRateDisplays(rates);

    /* Then try to fetch latest from Firebase */
    if (typeof window.OV_fbLoadRates === 'function') {
      window.OV_fbLoadRates(
        function (fbRates) {
          var merged = Object.assign({}, DEFAULT_RATES, fbRates);
          saveLocal(merged);
          renderRatesTable(merged);
          updateRateDisplays(merged);
        },
        function () { /* silent — local rates already shown */ }
      );
    }
  };

  function renderRatesTable(rates) {
    var tbody = document.getElementById('gcRatesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    Object.keys(rates).forEach(function (key) {
      var r   = rates[key];
      var row = document.createElement('tr');
      row.innerHTML =
        '<td>' +
          '<div class="gc-name-cell">' +
            '<div class="gc-table-icon gc-img-icon">' +
              '<img src="assets/images/gc-' + key + '.png" alt="' + r.name + '" ' +
              'onerror="this.parentElement.style.background=\'#444\';this.style.display=\'none\'">' +
            '</div>' +
            '<strong style="color:var(--text-primary);font-size:14px;">' + r.name + '</strong>' +
          '</div>' +
        '</td>' +
        '<td class="gc-rate-cell">\u20A6' + r.rate.toLocaleString() + ' / ' + r.unit + '</td>' +
        '<td class="gc-col-status">' +
          '<span class="gc-status-badge">' +
            '<span style="width:5px;height:5px;background:var(--green);border-radius:50%;display:inline-block;"></span>' +
            ' Active' +
          '</span>' +
        '</td>' +
        '<td>' +
          '<a href="https://wa.me/2347019108587?text=I+want+to+sell+my+' +
            encodeURIComponent(r.name) + '+gift+card" ' +
            'target="_blank" rel="noopener noreferrer" ' +
            'class="crypto-card-btn crypto-card-btn-primary" ' +
            'style="font-size:11px;padding:6px 14px;border-radius:8px;' +
            'text-decoration:none;display:inline-flex;align-items:center;white-space:nowrap;">' +
            'Sell Now' +
          '</a>' +
        '</td>';
      tbody.appendChild(row);
    });
  }

  /* ── Init admin panel fields ──────────────────────────── */
  window.initAdminPanel = function () {
    var local = loadLocalRates();
    populateAdminFields(local);

    /* Also pull latest from Firebase and update fields */
    if (typeof window.OV_fbLoadRates === 'function') {
      window.OV_fbLoadRates(
        function (fbRates) {
          var merged = Object.assign({}, DEFAULT_RATES, fbRates);
          saveLocal(merged);
          populateAdminFields(merged);
        },
        function () { /* silent — local values already shown */ }
      );
    }
  };

  /* ── Reset all rates ──────────────────────────────────── */
  window.OV_clearRates = function () {
    if (!confirm('Reset all gift card rates to defaults?')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('ov_usd_ngn');
    } catch (e) {}
    if (typeof window.initAdminPanel === 'function') window.initAdminPanel();
    showToast('✓ Rates reset to defaults');
  };

  /* ── Expose for export tool in admin.html ─────────────── */
  window.OV_loadRates  = loadLocalRates;

  /* ── On any page load — fetch Firebase rates into local ── */
  /* So visitors always get the latest without admin opening */
  (function syncOnLoad() {
    if (typeof window.OV_fbLoadRates !== 'function') {
      /* Firebase not loaded yet — wait 2s and retry once */
      setTimeout(function () {
        if (typeof window.OV_fbLoadRates === 'function') {
          window.OV_fbLoadRates(
            function (fbRates) {
              var merged = Object.assign({}, DEFAULT_RATES, fbRates);
              saveLocal(merged);
              updateRateDisplays(merged);
              renderRatesTable(merged);
            },
            function () {}
          );
        }
      }, 2000);
      return;
    }
    window.OV_fbLoadRates(
      function (fbRates) {
        var merged = Object.assign({}, DEFAULT_RATES, fbRates);
        saveLocal(merged);
        updateRateDisplays(merged);
        renderRatesTable(merged);
      },
      function () {}
    );
  })();

})();