/**
 * Fluid Glass Mini Menu - Grafmen.com
 * Lightweight, accessible floating bar navigation
 * Inspired by fluid.glass
 */
(() => {
  if (typeof window === 'undefined') return;

  const init = () => {
    if (document.getElementById('fg-menu')) return;

    // Detect path depth relative to root
    const homeLogoHref = document.querySelector('header a.home-logo')?.getAttribute('href') || '';
    let prefix = '';
    if (homeLogoHref.startsWith('../../')) {
      prefix = '../../';
    } else if (homeLogoHref.startsWith('../')) {
      prefix = '../';
    }

    const currentPath = window.location.pathname.replace(/\\/g, '/');
    const isHomePage = (
      currentPath === '/' ||
      (currentPath.endsWith('/index.html') &&
       !currentPath.includes('/strony-www') &&
       !currentPath.includes('/branding') &&
       !currentPath.includes('/portfolio') &&
       !currentPath.includes('/o-mnie') &&
       !currentPath.includes('/blog') &&
       !currentPath.includes('/kontakt') &&
       !currentPath.includes('/modernizacja'))
    );

    const navItems = [
      { id: 'home', label: 'HOME', href: isHomePage ? '#top' : (prefix ? prefix + 'index.html' : 'index.html'), isHome: true },
      { id: 'web', label: 'Strony WWW', href: prefix + 'strony-www/index.html', match: (p) => p.includes('/strony-www') },
      { id: 'brand', label: 'Branding', href: prefix + 'branding/index.html', match: (p) => p.includes('/branding') },
      { id: 'work', label: 'Portfolio', href: prefix + 'portfolio/index.html', match: (p) => p.includes('/portfolio') },
      { id: 'about', label: 'O mnie', href: prefix + 'o-mnie/index.html', match: (p) => p.includes('/o-mnie') },
      { id: 'blog', label: 'Blog', href: prefix + 'blog/index.html', match: (p) => p.includes('/blog') },
      { id: 'contact', label: 'Kontakt', href: prefix + 'kontakt/index.html', match: (p) => p.includes('/kontakt') }
    ];

    // Build Floating Nav Container
    const menu = document.createElement('nav');
    menu.id = 'fg-menu';
    menu.className = 'fg-menu';
    menu.setAttribute('aria-label', 'Szybka nawigacja');

    // Popover Panel
    const panel = document.createElement('div');
    panel.id = 'fg-panel';
    panel.className = 'fg-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Szybkie menu');
    panel.setAttribute('aria-hidden', 'true');

    const list = document.createElement('ul');
    list.className = 'fg-list';

    navItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'fg-item';
      li.style.setProperty('--i', index);

      const a = document.createElement('a');
      a.className = 'fg-link';
      a.href = item.href;
      a.textContent = item.label;

      if (item.isHome && isHomePage) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
        a.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          closeMenu(false);
        });
      } else if (item.match && item.match(currentPath)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
        a.addEventListener('click', () => closeMenu(false));
      } else {
        a.addEventListener('click', () => closeMenu(false));
      }

      li.appendChild(a);
      list.appendChild(li);
    });
    panel.appendChild(list);

    // Floating Bar (Closed State: HOME ... [burger])
    const bar = document.createElement('div');
    bar.className = 'fg-bar';

    const homeBtn = document.createElement('a');
    homeBtn.className = 'fg-home';
    homeBtn.href = isHomePage ? '#top' : (prefix ? prefix + 'index.html' : 'index.html');
    homeBtn.textContent = 'HOME';
    homeBtn.setAttribute('aria-label', 'Grafmen: powr\u00f3t na g\u00f3r\u0119 strony');

    if (isHomePage) {
      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'fg-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'fg-panel');
    toggleBtn.setAttribute('aria-label', 'Otw\u00f3rz menu');
    toggleBtn.innerHTML = '<span class="fg-burger" aria-hidden="true"><span class="fg-line fg-line--1"></span><span class="fg-line fg-line--2"></span><span class="fg-line fg-line--3"></span></span>';

    bar.appendChild(homeBtn);
    bar.appendChild(toggleBtn);

    menu.appendChild(panel);
    menu.appendChild(bar);
    document.body.appendChild(menu);

    // Open / Close Logic
    let isOpen = false;

    const openMenu = () => {
      isOpen = true;
      menu.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Zamknij menu');
      panel.setAttribute('aria-hidden', 'false');
      const firstLink = panel.querySelector('a');
      if (firstLink) firstLink.focus();
    };

    const closeMenu = (restoreFocus = false) => {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Otw\u00f3rz menu');
      panel.setAttribute('aria-hidden', 'true');
      if (restoreFocus) {
        toggleBtn.focus();
      }
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !menu.contains(e.target)) {
        closeMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu(true);
      }
    });

    // Scroll & Intersection Observer for CTA / Footer
    let isNearFooter = false;

    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isNearFooter = entry.isIntersecting;
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
      const isScrolledPastHero = scrollY > 240;

      if (isScrolledPastHero && !isNearFooter) {
        menu.classList.add('is-visible');
        menu.classList.remove('is-hidden-footer');
      } else if (isNearFooter) {
        menu.classList.add('is-hidden-footer');
        if (isOpen) closeMenu(false);
      } else {
        menu.classList.remove('is-visible');
        menu.classList.remove('is-hidden-footer');
        if (isOpen) closeMenu(false);
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
