/**
 * Fluid Glass Menu - Lightweight Floating Dock & Mobile Glass Panel
 * Pure Vanilla CSS + Vanilla JS · zero external dependencies
 * Inspired by fluid.glass & 21st.dev/components/fluid-menu
 */
(() => {
  if (typeof window === 'undefined') return;

  const init = () => {
    // Avoid double initialization
    if (document.getElementById('fluid-glass-dock')) return;

    // Detect path depth relative to root
    const homeLogoHref = document.querySelector('header a.home-logo')?.getAttribute('href') || '';
    let prefix = '';
    if (homeLogoHref.startsWith('../../')) {
      prefix = '../../';
    } else if (homeLogoHref.startsWith('../')) {
      prefix = '../';
    }

    const currentPath = window.location.pathname.replace(/\\/g, '/');

    const navItems = [
      { id: 'start', label: 'Start', href: prefix ? `${prefix}index.html` : '#top', match: (p) => p === '/' || p.endsWith('/index.html') && !p.includes('/strony-www') && !p.includes('/branding') && !p.includes('/portfolio') && !p.includes('/o-mnie') && !p.includes('/blog') && !p.includes('/kontakt') },
      { id: 'web', label: 'Strony WWW', href: `${prefix}strony-www/index.html`, match: (p) => p.includes('/strony-www') },
      { id: 'brand', label: 'Branding', href: `${prefix}branding/index.html`, match: (p) => p.includes('/branding') },
      { id: 'work', label: 'Portfolio', href: `${prefix}portfolio/index.html`, match: (p) => p.includes('/portfolio') },
      { id: 'about', label: 'O mnie', href: `${prefix}o-mnie/index.html`, match: (p) => p.includes('/o-mnie') },
      { id: 'blog', label: 'Blog', href: `${prefix}blog/index.html`, match: (p) => p.includes('/blog') },
      { id: 'contact', label: 'Kontakt', href: `${prefix}kontakt/index.html`, match: (p) => p.includes('/kontakt') }
    ];

    // Build Desktop Dock
    const dock = document.createElement('nav');
    dock.id = 'fluid-glass-dock';
    dock.className = 'fluid-glass-dock';
    dock.setAttribute('aria-label', 'Szybka nawigacja');

    const dockList = document.createElement('ul');
    dockList.className = 'fluid-glass-nav';

    navItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'fluid-glass-item';
      const a = document.createElement('a');
      a.className = 'fluid-glass-link';
      a.href = item.href;
      a.textContent = item.label;
      if (item.match(currentPath)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
      li.appendChild(a);
      dockList.appendChild(li);
    });
    dock.appendChild(dockList);

    // Build Mobile Trigger
    const mobileTrigger = document.createElement('button');
    mobileTrigger.id = 'fluid-glass-trigger';
    mobileTrigger.className = 'fluid-glass-mobile-trigger';
    mobileTrigger.type = 'button';
    mobileTrigger.setAttribute('aria-expanded', 'false');
    mobileTrigger.setAttribute('aria-controls', 'fluid-glass-panel');
    mobileTrigger.setAttribute('aria-label', 'Otwórz szybkie menu');
    mobileTrigger.innerHTML = `
      <span class="fluid-glass-trigger-icon" aria-hidden="true"><span></span><span></span></span>
      <span>Menu</span>
    `;

    // Build Mobile Panel
    const mobilePanel = document.createElement('div');
    mobilePanel.id = 'fluid-glass-panel';
    mobilePanel.className = 'fluid-glass-mobile-panel';
    mobilePanel.setAttribute('role', 'region');
    mobilePanel.setAttribute('aria-label', 'Szybka nawigacja mobilna');

    const mobileList = document.createElement('ul');
    mobileList.className = 'fluid-glass-mobile-nav';

    navItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'fluid-glass-mobile-link';
      a.href = item.href;
      a.textContent = item.label;
      if (item.match(currentPath)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
      a.addEventListener('click', () => closeMobilePanel());
      li.appendChild(a);
      mobileList.appendChild(li);
    });
    mobilePanel.appendChild(mobileList);

    document.body.appendChild(dock);
    document.body.appendChild(mobileTrigger);
    document.body.appendChild(mobilePanel);

    // Mobile Panel interaction
    let isMobileOpen = false;

    const openMobilePanel = () => {
      isMobileOpen = true;
      mobileTrigger.setAttribute('aria-expanded', 'true');
      mobileTrigger.setAttribute('aria-label', 'Zamknij szybkie menu');
      mobilePanel.classList.add('is-open');
      const firstLink = mobilePanel.querySelector('a');
      if (firstLink) firstLink.focus();
    };

    const closeMobilePanel = (restoreFocus = false) => {
      if (!isMobileOpen) return;
      isMobileOpen = false;
      mobileTrigger.setAttribute('aria-expanded', 'false');
      mobileTrigger.setAttribute('aria-label', 'Otwórz szybkie menu');
      mobilePanel.classList.remove('is-open');
      if (restoreFocus) {
        mobileTrigger.focus();
      }
    };

    mobileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobileOpen) {
        closeMobilePanel(false);
      } else {
        openMobilePanel();
      }
    });

    document.addEventListener('click', (e) => {
      if (isMobileOpen && !mobilePanel.contains(e.target) && !mobileTrigger.contains(e.target)) {
        closeMobilePanel(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobilePanel(true);
      }
    });

    // Scroll Visibility Controller
    // Appears after ~200px scroll; hides near CTA/footer so it never covers content
    let isNearFooter = false;

    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isNearFooter = true;
        } else {
          isNearFooter = false;
        }
        updateVisibility();
      });
    }, {
      rootMargin: '0px 0px 80px 0px',
      threshold: 0.05
    });

    const footerTarget = document.querySelector('.final-cta') || document.querySelector('.site-footer');
    if (footerTarget) {
      footerObserver.observe(footerTarget);
    }

    const updateVisibility = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const isScrolledPastHero = scrollY > 200;

      if (isScrolledPastHero && !isNearFooter) {
        dock.classList.add('is-visible');
        dock.classList.remove('is-hidden-footer');
        mobileTrigger.classList.add('is-visible');
        mobileTrigger.classList.remove('is-hidden-footer');
      } else if (isNearFooter) {
        dock.classList.add('is-hidden-footer');
        mobileTrigger.classList.add('is-hidden-footer');
        if (isMobileOpen) closeMobilePanel(false);
      } else {
        dock.classList.remove('is-visible');
        dock.classList.remove('is-hidden-footer');
        mobileTrigger.classList.remove('is-visible');
        mobileTrigger.classList.remove('is-hidden-footer');
        if (isMobileOpen) closeMobilePanel(false);
      }
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
