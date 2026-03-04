/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — ADMIN.JS
   Admin panel — manage displayed gift card rates
   ─────────────────────────────────────────────────────────
   - Stores custom rates in localStorage
   - Populates admin input fields on panel load
   - Saves rates and updates visible rate displays
   - Shows a toast notification on save
   - Exposes populateRatesTable() for rates page
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE_KEY = 'ov_gc_rates';

  /* ── Default gift card rates ─────────────────────────── */
  var DEFAULT_RATES = {
    amazon:  { name: 'Amazon',  rate: 1450, unit: 'per $1' },
    apple:   { name: 'Apple',   rate: 1420, unit: 'per $1' },
    google:  { name: 'Google',  rate: 1400, unit: 'per $1' },
    steam:   { name: 'Steam',   rate: 1380, unit: 'per $1' },
    netflix: { name: 'Netflix', rate: 1350, unit: 'per $1' },
    itunes:  { name: 'iTunes',  rate: 1400, unit: 'per $1' },
    ebay:    { name: 'eBay',    rate: 1380, unit: 'per $1' },
    walmart: { name: 'Walmart', rate: 1360, unit: 'per $1' },
    amex:    { name: 'Amex',    rate: 1420, unit: 'per $1' },
    xbox:    { name: 'Xbox',    rate: 1390, unit: 'per $1' },
  };

  /* ── Load rates from localStorage or use defaults ─────── */
  function loadRates() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        /* Merge with defaults to handle new keys */
        return Object.assign({}, DEFAULT_RATES, parsed);
      }
    } catch (e) { /* ignore */ }
    return Object.assign({}, DEFAULT_RATES);
  }

  /* ── Save rates to localStorage ──────────────────────── */
  function saveRates(rates) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
    } catch (e) { /* ignore */ }
  }

  /* ── Show toast notification ─────────────────────────── */
  function showToast(msg) {
    var toast = document.getElementById('adminToast');
    if (!toast) return;
    toast.textContent = msg || '✓ Rates saved';
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ── Populate admin input fields ─────────────────────── */
  function populateAdminFields(rates) {
    Object.keys(rates).forEach(function (key) {
      var input = document.getElementById('rate-' + key);
      if (input) {
        input.value = rates[key].rate;
      }
    });
  }

  /* ── Save handler — called by admin Save buttons ──────── */
  window.OV_saveRates = function () {
    var rates = loadRates();

    Object.keys(rates).forEach(function (key) {
      var input = document.getElementById('rate-' + key);
      if (input) {
        var val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) {
          rates[key].rate = Math.round(val);
        }
      }
    });

    saveRates(rates);

    /* Update any visible rate displays on current page */
    updateRateDisplays(rates);

    showToast('✓ Rates saved successfully');
  };

  /* ── Save individual rate row ─────────────────────────── */
  window.OV_saveRow = function (key) {
    var rates = loadRates();
    var input = document.getElementById('rate-' + key);
    if (input) {
      var val = parseFloat(input.value);
      if (!isNaN(val) && val > 0) {
        rates[key].rate = Math.round(val);
        saveRates(rates);
        updateRateDisplays(rates);
        showToast('✓ ' + rates[key].name + ' rate updated');
      }
    }
  };

  /* ── Update rate displays across the page ─────────────── */
  function updateRateDisplays(rates) {
    /* Update gift card pills (home / rates page) */
    Object.keys(rates).forEach(function (key) {
      var rateEls = document.querySelectorAll('[data-gc-rate="' + key + '"]');
      rateEls.forEach(function (el) {
        el.textContent = '\u20A6' + rates[key].rate.toLocaleString() + '/' + rates[key].unit;
      });
    });
  }

  /* ── Populate rates table (rates page) ────────────────── */
  window.populateRatesTable = function () {
    var rates  = loadRates();
    var tbody  = document.getElementById('gcRatesBody');
    if (!tbody) return;

    /* Clear existing rows */
    tbody.innerHTML = '';

    var gcColors = {
      amazon:  '#ff9900',
      apple:   '#555555',
      google:  '#4285f4',
      steam:   '#1b2838',
      netflix: '#e50914',
      itunes:  '#fc3c44',
      ebay:    '#e53238',
      walmart: '#0071ce',
      amex:    '#007bc1',
      xbox:    '#107c10',
    };

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
            '<strong style="color:var(--text-primary);font-size:14px;">' +
              r.name +
            '</strong>' +
          '</div>' +
        '</td>' +
        '<td class="gc-rate-cell">\u20A6' + r.rate.toLocaleString() + ' / ' + r.unit + '</td>' +
        '<td class="gc-col-status">' +
          '<span class="gc-status-badge">' +
            '<span style="width:5px;height:5px;background:var(--green);border-radius:50%;display:inline-block;"></span>' +
            'Active' +
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

    /* Also update any pill displays */
    updateRateDisplays(rates);
  };

  /* ── Init admin panel ─────────────────────────────────── */
  window.initAdminPanel = function () {
    var rates = loadRates();
    populateAdminFields(rates);
  };

  /* ── Expose loadRates for other scripts ──────────────── */
  window.OV_loadRates = loadRates;

  /* ── Auto-populate on rates page load ────────────────── */
  /* (also called by main.js after rates page inject) */

})();