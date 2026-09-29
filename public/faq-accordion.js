/**
 * faq-accordion.js
 * Animated FAQ accordion for Grafmen.
 * - Works with native <details>/<summary> HTML (no-JS fallback preserved in HTML)
 * - Replaces default open/close with JS-controlled height + opacity animation
 * - Animated +/− SVG icon (horizontal bar stays, vertical bar fades/rotates)
 * - Entry animation: rows slide in from bottom on scroll (homepage FAQ only,
 *   strony-www FAQ already handled by grafmen-motion.js / GSAP)
 * - Keyboard: Enter/Space on summary, Tab skips hidden content
 * - prefers-reduced-motion: instant open/close, no entry animation
 * - Multiple items can be open simultaneously (preserves existing behaviour)
 */

(() => {
  const DURATION = 320;       // ms – open/close transition
  const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* ICON – SVG plus/minus                                                */
  /* ------------------------------------------------------------------ */
  function buildIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'position:absolute;right:0;top:50%;transform:translateY(-50%);flex-shrink:0;overflow:visible';

    // Horizontal bar (always visible)
    const h = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    h.setAttribute('x1', '3'); h.setAttribute('y1', '12');
    h.setAttribute('x2', '21'); h.setAttribute('y2', '12');
    h.setAttribute('stroke', '#ff6400');
    h.setAttribute('stroke-width', '2');
    h.setAttribute('stroke-linecap', 'round');

    // Vertical bar (rotates + fades when open)
    const v = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    v.setAttribute('x1', '12'); v.setAttribute('y1', '3');
    v.setAttribute('x2', '12'); v.setAttribute('y2', '21');
    v.setAttribute('stroke', '#ff6400');
    v.setAttribute('stroke-width', '2');
    v.setAttribute('stroke-linecap', 'round');
    v.style.cssText = `transform-origin:50% 50%;transition:transform ${REDUCED ? '0ms' : DURATION + 'ms'} ${EASE},opacity ${REDUCED ? '0ms' : DURATION + 'ms'} ${EASE}`;
    v.classList.add('faq-icon-v');

    svg.appendChild(h);
    svg.appendChild(v);
    return svg;
  }

  function setIconOpen(svg, open) {
    const v = svg.querySelector('.faq-icon-v');
    if (!v) return;
    if (open) {
      v.style.transform = 'rotate(90deg)';
      v.style.opacity = '0';
    } else {
      v.style.transform = 'rotate(0deg)';
      v.style.opacity = '1';
    }
  }

  /* ------------------------------------------------------------------ */
  /* ACCORDION LOGIC                                                      */
  /* ------------------------------------------------------------------ */
  function initItem(details) {
    const summary = details.querySelector('summary');
    if (!summary || details.dataset.faqInit) return;
    details.dataset.faqInit = 'true';

    // Build content wrapper around everything after summary
    const body = document.createElement('div');
    body.className = 'faq-body';
    // Move all non-summary children into body
    Array.from(details.children).forEach(child => {
      if (child !== summary) body.appendChild(child);
    });
    details.appendChild(body);

    // Wrap body in measurer (lets us read scrollHeight reliably)
    body.style.cssText = `overflow:hidden;transition:height ${REDUCED ? '0ms' : DURATION + 'ms'} ${EASE};`;

    // Build icon, remove CSS ::after icon (handled by class)
    summary.classList.add('faq-summary-js');
    const icon = buildIcon();
    summary.appendChild(icon);

    const isOpen = details.hasAttribute('open');
    setIconOpen(icon, isOpen);

    if (isOpen) {
      // Start open: set measured height so transitions work correctly later
      body.style.height = 'auto';
    } else {
      body.style.height = '0';
    }

    // Content opacity + translate for open state
    const children = Array.from(body.children);
    children.forEach(el => {
      el.style.cssText += `transition:opacity ${REDUCED ? '0ms' : (DURATION + 80) + 'ms'} ${EASE},transform ${REDUCED ? '0ms' : (DURATION + 80) + 'ms'} ${EASE};`;
      if (!isOpen) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
      }
    });

    // inert on hidden content (removes from tab order)
    if (!isOpen) body.setAttribute('inert', '');

    // Click / keyboard handler
    summary.addEventListener('click', e => {
      e.preventDefault();
      toggleItem(details, body, icon, children);
    });
  }

  function toggleItem(details, body, icon, children) {
    const opening = !details.hasAttribute('open');

    if (opening) {
      details.setAttribute('open', '');
      body.removeAttribute('inert');
      // Measure then animate
      body.style.height = '0';
      const target = body.scrollHeight + 'px';
      requestAnimationFrame(() => {
        body.style.height = target;
        setIconOpen(icon, true);
        children.forEach((el, i) => {
          const delay = REDUCED ? 0 : Math.min(i * 30, 60);
          el.style.transitionDelay = delay + 'ms';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
      // After transition, set height:auto so content reflows correctly on resize
      if (!REDUCED) {
        setTimeout(() => { body.style.height = 'auto'; }, DURATION + 20);
      } else {
        body.style.height = 'auto';
      }
    } else {
      // Closing: lock measured height first, then animate to 0
      body.style.height = body.scrollHeight + 'px';
      children.forEach(el => {
        el.style.transitionDelay = '0ms';
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
      });
      requestAnimationFrame(() => {
        body.style.height = '0';
        setIconOpen(icon, false);
      });
      setTimeout(() => {
        details.removeAttribute('open');
        body.setAttribute('inert', '');
      }, REDUCED ? 0 : DURATION + 20);
    }
  }

  /* ------------------------------------------------------------------ */
  /* ENTRY ANIMATION (homepage .faq-section only)                         */
  /* grafmen-motion.js already handles #faq .faq-grid on strony-www      */
  /* ------------------------------------------------------------------ */
  function initEntryAnimation(list) {
    if (REDUCED) return;
    // Only run on .faq-section (homepage component), skip if GSAP already handled
    const section = list.closest('.faq-section');
    if (!section) return;
    // Check if GSAP already set entranceDone on this grid
    const grid = list.closest('.faq-grid');
    if (grid && grid.dataset.entranceDone) return;

    const items = Array.from(list.querySelectorAll('details'));
    if (!items.length) return;

    // Pre-hide
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(14px)';
      item.style.transition = `opacity 0.55s ease, transform 0.55s ease`;
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, i * 70);
        });
        // After animation, remove inline styles so they don't interfere
        setTimeout(() => {
          items.forEach(item => {
            item.style.opacity = '';
            item.style.transform = '';
            item.style.transition = '';
          });
        }, items.length * 70 + 600);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    observer.observe(list);
  }

  /* ------------------------------------------------------------------ */
  /* RESIZE: recalculate open heights                                     */
  /* ------------------------------------------------------------------ */
  function recalcOpenHeights() {
    document.querySelectorAll('.faq-list details[open]').forEach(details => {
      const body = details.querySelector('.faq-body');
      if (body && body.style.height !== 'auto') return; // already auto, fine
      // Nothing to do – height:auto responds to resize naturally
    });
  }

  window.addEventListener('resize', recalcOpenHeights, { passive: true });

  /* ------------------------------------------------------------------ */
  /* INIT                                                                 */
  /* ------------------------------------------------------------------ */
  function init() {
    document.querySelectorAll('.faq-list').forEach(list => {
      list.querySelectorAll('details').forEach(d => initItem(d));
      initEntryAnimation(list);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
