/**
 * cookie-banner.js — Grafmen
 *
 * Komunikat informacyjny o prywatności (pill style).
 * Zamknięcie komunikatu zapamiętywane w localStorage.
 * Zamknięcie komunikatu nie oznacza zgody na jakiekolwiek technologie.
 *
 * API: window.gmCookies.reset() — ponownie pokazuje pasek i otwiera panel
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'gm_cookies_dismissed';

  var banner = null;
  var privacyBtn = null;
  var closeBtn = null;
  var infoPanel = null;
  var infoClose = null;
  var showTimer = null;
  var infoPanelOpen = false;

  /* ── Storage ── */
  function isDismissed() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) { return false; }
  }
  function saveDismissed() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
  }
  function clearDismissed() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  /* ── Widoczność bannera ── */
  function showBanner() {
    if (!banner) return;
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    banner.offsetHeight; // reflow
    banner.classList.remove('cb-hiding');
    banner.classList.add('cb-visible');
  }

  function hideBanner() {
    if (!banner) return;
    closeInfo();
    banner.classList.remove('cb-visible');
    banner.classList.add('cb-hiding');
    banner.setAttribute('aria-hidden', 'true');
    setTimeout(function () {
      banner.setAttribute('hidden', '');
      banner.classList.remove('cb-hiding');
    }, 280);
  }

  function dismiss() {
    saveDismissed();
    hideBanner();
  }

  /* ── Panel Prywatność ── */
  function openInfo() {
    if (!infoPanel) return;
    infoPanelOpen = true;
    infoPanel.removeAttribute('hidden');
    if (privacyBtn) privacyBtn.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      if (infoClose) infoClose.focus();
    }, 50);
  }

  function closeInfo() {
    if (!infoPanel) return;
    infoPanelOpen = false;
    infoPanel.setAttribute('hidden', '');
    if (privacyBtn) {
      privacyBtn.setAttribute('aria-expanded', 'false');
      privacyBtn.focus();
    }
  }

  function toggleInfo() {
    if (infoPanelOpen) { closeInfo(); } else { openInfo(); }
  }

  /* ── Klawiatura ── */
  function onKeyDown(e) {
    if (!banner || banner.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') {
      if (infoPanelOpen) {
        closeInfo();
      } else {
        dismiss();
      }
    }
  }

  /* ── Kliknięcie poza panelem Info ── */
  function onDocClick(e) {
    if (!infoPanelOpen) return;
    if (e.target && e.target.closest && e.target.closest('.footer-cookies-btn')) return;
    if (infoPanel && !infoPanel.contains(e.target) && e.target !== privacyBtn) {
      closeInfo();
    }
  }

  /* ── Publiczne API ── */
  function reset() {
    clearDismissed();
    clearTimeout(showTimer);
    showBanner();
    openInfo();
  }

  /* ── Inicjalizacja ── */
  function init() {
    banner     = document.getElementById('cookie-banner');
    privacyBtn = document.getElementById('cookie-banner-privacy') || document.getElementById('cookie-banner-info');
    closeBtn   = document.getElementById('cookie-banner-close') || document.getElementById('cookie-banner-accept');
    infoPanel  = document.getElementById('cb-info-panel');
    infoClose  = document.getElementById('cb-info-close');

    if (!banner || !closeBtn) return;

    closeBtn.addEventListener('click', dismiss);

    if (privacyBtn) privacyBtn.addEventListener('click', toggleInfo);
    if (infoClose)  infoClose.addEventListener('click', closeInfo);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onDocClick);

    window.gmCookies = { reset: reset };

    if (!isDismissed()) {
      showTimer = setTimeout(showBanner, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
