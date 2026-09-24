/**
 * cookie-banner.js — Grafmen
 *
 * Serwis nie używa cookies wymagających zgody RODO.
 * Panel informacyjny. Wybór zapamiętywany w localStorage.
 *
 * API: window.gmCookies.reset() — ponownie pokazuje pasek
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'gm_cookies_dismissed';

  var banner = null;
  var acceptBtn = null;
  var infoBtn = null;
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

  function accept() {
    saveDismissed();
    hideBanner();
  }

  /* ── Panel Info ── */
  function openInfo() {
    if (!infoPanel) return;
    infoPanelOpen = true;
    infoPanel.removeAttribute('hidden');
    if (infoBtn) infoBtn.setAttribute('aria-expanded', 'true');
    /* focus na przycisk zamknięcia */
    setTimeout(function () {
      if (infoClose) infoClose.focus();
    }, 50);
  }

  function closeInfo() {
    if (!infoPanel) return;
    infoPanelOpen = false;
    infoPanel.setAttribute('hidden', '');
    if (infoBtn) {
      infoBtn.setAttribute('aria-expanded', 'false');
      infoBtn.focus();
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
        accept();
      }
    }
  }

  /* ── Kliknięcie poza panelem Info ── */
  function onDocClick(e) {
    if (!infoPanelOpen) return;
    if (infoPanel && !infoPanel.contains(e.target) && e.target !== infoBtn) {
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
    banner    = document.getElementById('cookie-banner');
    acceptBtn = document.getElementById('cookie-banner-accept');
    infoBtn   = document.getElementById('cookie-banner-info');
    infoPanel = document.getElementById('cb-info-panel');
    infoClose = document.getElementById('cb-info-close');

    if (!banner || !acceptBtn) return;

    acceptBtn.addEventListener('click', accept);

    if (infoBtn)   infoBtn.addEventListener('click', toggleInfo);
    if (infoClose) infoClose.addEventListener('click', closeInfo);

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
