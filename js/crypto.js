/* ═══════════════════════════════════════════════════════════
   OFFICIALVALUE EXCHANGE — CRYPTO.JS
   Live crypto prices via CoinGecko API
   Converts USD → NGN and updates ticker + rate widget
   ─────────────────────────────────────────────────────────
   - Fetches BTC, ETH, USDT, BNB, USDC prices in USD
   - Converts to NGN using a configurable rate
   - Updates ticker strip items (data-ticker attributes)
   - Updates rate widget rows in home page
   - Refreshes every 60 seconds automatically
   - Gracefully falls back to placeholder values on error
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────── */
  var USD_TO_NGN   = 1585;   /* Update this rate as needed */
  var REFRESH_MS   = 60000;  /* Refresh every 60 seconds   */
  var COINGECKO_URL =
    'https://api.coingecko.com/api/v3/simple/price' +
    '?ids=bitcoin,ethereum,tether,binancecoin,usd-coin' +
    '&vs_currencies=usd' +
    '&include_24hr_change=true';

  /* ── Coin metadata ───────────────────────────────────── */
  var COINS = {
    bitcoin:     { sym: 'BTC', name: 'Bitcoin',  decimals: 0 },
    ethereum:    { sym: 'ETH', name: 'Ethereum', decimals: 0 },
    tether:      { sym: 'USDT', name: 'Tether',  decimals: 0 },
    binancecoin: { sym: 'BNB', name: 'BNB',      decimals: 0 },
    'usd-coin':  { sym: 'USDC', name: 'USD Coin',decimals: 0 },
  };

  /* ── Format helpers ──────────────────────────────────── */
  function formatNGN(amount) {
    return '\u20A6' + Math.round(amount).toLocaleString('en-NG');
  }

  function formatUSD(amount) {
    if (amount >= 1000) {
      return '$' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return '$' + amount.toFixed(4);
  }

  function formatChange(change) {
    var sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
  }

  /* ── Update ticker strip ─────────────────────────────── */
  function updateTicker(data) {
    document.querySelectorAll('.ticker-item[data-ticker]').forEach(function (item) {
      var id   = item.dataset.ticker;
      var coin = data[id];
      if (!coin) return;

      var ngnPrice = coin.usd * USD_TO_NGN;
      var change   = coin.usd_24h_change || 0;

      var priceEl  = item.querySelector('.t-price');
      var changeEl = item.querySelector('.t-change');

      if (priceEl)  priceEl.textContent = formatNGN(ngnPrice);
      if (changeEl) {
        changeEl.textContent = (change >= 0 ? '▲' : '▼') + '\u00A0' +
          Math.abs(change).toFixed(1) + '%';
        changeEl.className = 't-change ' + (change >= 0 ? 't-up' : 't-down');
      }
    });
  }

  /* ── Update rate widget (home page) ─────────────────── */
  function updateWidget(data) {
    var rows = document.querySelectorAll('.rate-row[data-coin]');
    rows.forEach(function (row) {
      var id   = row.dataset.coin;
      var coin = data[id];
      if (!coin) return;

      var ngnPrice = coin.usd * USD_TO_NGN;
      var change   = coin.usd_24h_change || 0;

      var ngnEl    = row.querySelector('.rate-price-ngn');
      var usdEl    = row.querySelector('.rate-price-usd');
      var changeEl = row.querySelector('.rate-change');

      if (ngnEl)    ngnEl.textContent    = formatNGN(ngnPrice);
      if (usdEl)    usdEl.textContent    = formatUSD(coin.usd);
      if (changeEl) {
        changeEl.textContent = formatChange(change);
        changeEl.className   = 'rate-change ' + (change >= 0 ? 'up' : 'down');
      }
    });
  }

  /* ── Update crypto rate cards (rates page) ───────────── */
  function updateRateCards(data) {
    var cards = document.querySelectorAll('.crypto-rate-card[data-coin]');
    cards.forEach(function (card) {
      var id   = card.dataset.coin;
      var coin = data[id];
      if (!coin) return;

      var ngnPrice = coin.usd * USD_TO_NGN;
      var change   = coin.usd_24h_change || 0;

      var ngnEl    = card.querySelector('.crypto-card-price-ngn');
      var usdEl    = card.querySelector('.crypto-card-price-usd');
      var changeEl = card.querySelector('.crypto-card-change');

      if (ngnEl)    ngnEl.textContent    = formatNGN(ngnPrice);
      if (usdEl)    usdEl.textContent    = formatUSD(coin.usd);
      if (changeEl) {
        changeEl.textContent = formatChange(change);
        changeEl.className   = 'crypto-card-change ' + (change >= 0 ? 'up' : 'down');
      }
    });
  }

  /* ── Fetch prices from CoinGecko ─────────────────────── */
  function fetchPrices() {
    fetch(COINGECKO_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('CoinGecko HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        updateTicker(data);
        updateWidget(data);
        updateRateCards(data);
      })
      .catch(function (err) {
        /* Silent fail — placeholder values remain visible */
        console.warn('[OV Crypto] Price fetch failed:', err.message);
      });
  }

  /* ── Public refresh function ─────────────────────────── */
  window.OV_refreshPrices = function () {
    fetchPrices();
  };

  /* ── Auto-refresh every 60s ──────────────────────────── */
  var refreshTimer = null;

  function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchPrices, REFRESH_MS);
  }

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    fetchPrices();
    startAutoRefresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();