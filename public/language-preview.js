/* Local PL / EN design preview: header, hero and portfolio only.
 * Polish markup is retained exactly for switching back; lower sections have lang="pl".
 * All translated markup below is authored locally, never supplied by a URL or service.
 */
(() => {
  const navWrap = (t) => `<span class="nav-flip"><span class="nav-flip-front">${t}</span><span class="nav-flip-back" aria-hidden="true">${t}</span></span>`;
  const english = [
    ['[data-nav=web]', navWrap('Websites')],
    ['[data-nav=brand]', navWrap('Branding')],
    ['[data-nav=work]', navWrap('Portfolio')],
    ['[data-nav=about]', navWrap('About me')],
    ['[data-nav=blog]', navWrap('Blog')],
    ['[data-nav=contact]', navWrap('Contact')],
    ['.tools .quote', 'Contact <span aria-hidden="true">→</span>'],
    ['.eyebrow span:first-child', 'Przemyśl, Poland'],
    ['.eyebrow span:last-child', 'since 2005'],
    ['.hero h1', '<span class="hero-line" data-line="0"><span class="hero-line-inner">You run</span><span class="hero-wipe-brand" aria-hidden="true"></span><span class="hero-wipe-fg" aria-hidden="true"></span></span><br><span class="hero-line" data-line="1"><span class="hero-line-inner">y<span class="uword">our</span> business.</span><span class="hero-wipe-brand" aria-hidden="true"></span><span class="hero-wipe-fg" aria-hidden="true"></span></span><br><span class="hero-line" data-line="2"><span class="hero-line-inner">I take care of</span><span class="hero-wipe-brand" aria-hidden="true"></span><span class="hero-wipe-fg" aria-hidden="true"></span></span><br><span class="hero-line" data-line="3"><span class="hero-line-inner">how it\'s seen<span class="terminal" aria-hidden="true"></span></span><span class="hero-wipe-brand" aria-hidden="true"></span><span class="hero-wipe-fg" aria-hidden="true"></span></span>'],
    ['.hero .lead', 'I design websites, branding, advertising materials and motion for businesses.<br>From concept and content to finished design and launch.'],
    ['.actions .dark', 'Get a quote <span aria-hidden="true">→</span>'],
    ['.actions .light', 'View my work'],
    ['.meta01', '<div class="meta01-top"><span>01</span></div>WEBSITES<br>BRANDING<br>MOTION'],
    ['.hero-bottom .mini:first-child', 'BETTER WEBSITES<br>FOR AMBITIOUS BUSINESSES'],
    ['.hero-bottom .center span:nth-child(2)', 'SCROLL DOWN'],
    ['.hero-bottom .right', 'EST. 2005<br>PRZEMYŚL, POLAND'],
    ['.portfolio .section-kicker', '02 — SELECTED WORK'],
    ['#portfolio-title', 'Work that<br>gets noticed.'],
    ['.portfolio-intro', 'Websites, visual identities and films. Explore selected projects for my clients.'],
    ['.portfolio .all', 'View all projects <span aria-hidden="true">↗</span>'],
    ['.p1 .cat', '01 / Website'],
    ['.p2 .cat', '02 / Motion / video'],
    ['.p3 .cat', '03 / Website'],
    ['.p4 .cat', '04 / Logo / branding'],
    ['.p5 .cat', '05 / Website'],
    ['.p6 .cat', '06 / Logo / branding'],
    ['.p2 .title', 'Hiker promotional film'],
    ['.p1 .project-description', 'A website for a brush and cleaning accessories manufacturer. A ten-year collaboration, from the first website to ongoing advertising materials.'],
    ['.p2 .project-description', 'A promotional film presenting the Hiker brand in a mountain landscape.'],
    ['.p3 .project-description', 'An English school website for children and teenagers. It organises the course offer and guides parents from first contact to enrolment.'],
    ['.p4 .project-description', 'Visual identity for an outdoor brand. The logo and branded materials create a consistent visual identity.'],
    ['.p5 .project-description', 'A proposed website for a woodworking business. The layout organises the offer and presents the products in a clear, modern setting.'],
    ['.p6 .project-description', 'A logo and business materials for an insurance brand. The identity combines initials with a symbol of protection to create consistent brand communication.'],
    ['.project-action', 'View project <span aria-hidden="true">↗</span>'],
  ];
  const cleanMarkup = (html) => html.replace(/\s*style="[^"]*"/gi, '');

  const entries = english.flatMap(([selector, en]) =>
    [...document.querySelectorAll(selector)].map(element => ({ element, pl: cleanMarkup(element.innerHTML), en }))
  );
  const movie = entries.find(entry => entry.element.matches('.p2 .project-action'));
  if (movie) movie.en = 'Watch film <span aria-hidden="true">↗</span>';
  const imageAlts = [
    'Drewmax.pro English website: navigation, headline and manufacturer offer',
    'Hiker film still: a mountain valley and the Wild Escape logo',
    'Best English website with English language courses',
    'Hiker identity: logo, business cards and branded stationery',
    'Proposed Drew-Art website',
    'JD Ubezpieczenia logo — Joanna Dywan',
  ];
  const images = [...document.querySelectorAll('.portfolio .project-image')].map((element, i) => ({ element, pl: element.alt, en: imageAlts[i] }));
  const polishTitle = document.title;
  const nav = document.querySelector('header nav');
  const polishNav = nav ? nav.getAttribute('aria-label') : '';
  const controls = document.querySelectorAll('[data-language]');

  function setLanguage(language, isInitial = false) {
    const lang = language === 'en' ? 'en' : 'pl';
    if (isInitial && lang === 'pl') {
      // Default Polish state: retain untouched SSR DOM to prevent race conditions with GSAP motion
      controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === 'pl')));
      return;
    }
    entries.forEach(entry => { entry.element.innerHTML = entry[lang]; });
    images.forEach(entry => { entry.element.alt = entry[lang]; });
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Grafmen — websites, branding and selected work' : polishTitle;
    if (nav) nav.setAttribute('aria-label', lang === 'en' ? 'Main navigation' : polishNav);
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === lang)));

    // Replay or ensure visibility of hero text lines upon language switch
    if (typeof window !== 'undefined') {
      if (window.__replayHeroMotion) {
        window.__replayHeroMotion();
      } else {
        document.querySelectorAll('.hero-line-inner').forEach(el => { el.style.opacity = '1'; });
      }
    }

    // Works without a server; blocked file:// History API does not prevent switching.
    try {
      const url = new URL(window.location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      window.history.replaceState(null, '', url);
    } catch { /* Optional URL state only. */ }
  }
  controls.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language, false)));
  setLanguage(new URLSearchParams(window.location.search).get('lang'), true);
})();
