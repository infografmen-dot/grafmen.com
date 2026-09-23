/**
 * cookie-banner.js — Grafmen
 *
 * Serwis nie używa cookies wymagających zgody RODO.
 * Ten panel jest wyłącznie informacyjny.
 * Wybór zapamiętywany w localStorage (klucz: gm_cookies_dismissed).
 *
 * API: window.gmCookies.reset() — ponownie pokazuje panel
 *       (wywoływane przez "Ustawienia cookies" w stopce)
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'gm_cookies_dismissed';
  var banner = null;
  var acceptBtn = null;
  var showTimer = null;

  function isDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function saveDismissed() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (_) { /* prywatny tryb — ignoruj */ }
  }

  function clearDismissed() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) { }
  }

  function show() {
    if (!banner) return;
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    /* wymuś reflow przed animacją */
    banner.offsetHeight; // eslint-disable-line no-unused-expressions
    banner.classList.remove('cb-hiding');
    banner.classList.add('cb-visible');
    /* przesuń focus na przycisk dla dostępności */
    if (acceptBtn) {
      setTimeout(function () { acceptBtn.focus({ preventScroll: true }); }, 320);
    }
  }

  function hide() {
    if (!banner) return;
    banner.classList.remove('cb-visible');
    banner.classList.add('cb-hiding');
    banner.setAttribute('aria-hidden', 'true');
    setTimeout(function () {
      banner.setAttribute('hidden', '');
      banner.classList.remove('cb-hiding');
    }, 320);
  }

  function accept() {
    saveDismissed();
    hide();
  }

  function reset() {
    clearDismissed();
    clearTimeout(showTimer);
    if (banner) {
      banner.removeAttribute('hidden');
      banner.setAttribute('aria-hidden', 'false');
      banner.classList.remove('cb-visible', 'cb-hiding');
      banner.offsetHeight; // eslint-disable-line no-unused-expressions
      show();
    }
  }

  function trapFocus(e) {
    if (!banner || banner.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') { accept(); }
    /* prosty trap — jedyny interaktywny element to przycisk "Rozumiem" */
  }

  function init() {
    banner = document.getElementById('cookie-banner');
    acceptBtn = document.getElementById('cookie-banner-accept');

    if (!banner || !acceptBtn) return;

    /* nasłuchuj klawiatury */
    document.addEventListener('keydown', trapFocus);

    /* przycisk zamknięcia */
    acceptBtn.addEventListener('click', accept);

    /* eksport publicznego API */
    window.gmCookies = { reset: reset };

    /* pokaż po opóźnieniu, jeśli nie odrzucono wcześniej */
    if (!isDismissed()) {
      showTimer = setTimeout(show, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
