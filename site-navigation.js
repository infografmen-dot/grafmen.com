(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const close = () => { nav?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); toggle?.focus(); } });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  // Keep portable file:// navigation; use clean directory URLs on a web server.
  if (/^https?:$/.test(location.protocol)) {
    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      if (url.origin === location.origin && url.pathname.endsWith('/index.html')) {
        url.pathname = url.pathname.slice(0, -10);
        link.setAttribute('href', url.pathname + url.search + url.hash);
      }
    });
  }
})();

// Shared sticky-header state and accessible return to the top.
(() => {
  const header = document.querySelector('.site-header-shell');
  const back = document.querySelector('.back-to-top');
  const updateScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
    if (back) back.hidden = window.scrollY <= 400;
  };
  window.addEventListener('scroll', updateScroll, {passive:true});
  window.addEventListener('pageshow', updateScroll);
  updateScroll();
  back?.addEventListener('click', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top:0, behavior:reduced ? 'instant' : 'smooth'});
    header?.querySelector('.home-logo')?.focus({preventScroll:true});
  });
})();
