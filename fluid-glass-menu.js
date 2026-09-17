/**
 * Fluid Glass Menu - Morphing Capsule Navigation
 * Single-object morph architecture inspired by fluid.glass
 */
(() => {
  if (typeof window === 'undefined') return;

  const init = () => {
    if (document.getElementById('fg-menu')) return;

    // Protocol check: clean root-relative URLs on HTTP/HTTPS vs relative fallback on file:
    const isFileProto = window.location.protocol === 'file:';

    let prefix = '';
    if (isFileProto) {
      const homeLogoHref = document.querySelector('header a.home-logo')?.getAttribute('href') || '';
      if (homeLogoHref.startsWith('../../')) {
        prefix = '../../';
      } else if (homeLogoHref.startsWith('../')) {
        prefix = '../';
      }
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

    const getHref = (cleanUrl, fileRel) => {
      if (isFileProto) {
        return prefix + fileRel;
      }
      return cleanUrl;
    };

    const navItems = [
      { id: 'web', label: 'Strony WWW', href: getHref('/strony-www/', 'strony-www/index.html'), match: (p) => p.includes('/strony-www') },
      { id: 'brand', label: 'Branding', href: getHref('/branding/', 'branding/index.html'), match: (p) => p.includes('/branding') },
      { id: 'work', label: 'Portfolio', href: getHref('/portfolio/', 'portfolio/index.html'), match: (p) => p.includes('/portfolio') },
      { id: 'about', label: 'O mnie', href: getHref('/o-mnie/', 'o-mnie/index.html'), match: (p) => p.includes('/o-mnie') },
      { id: 'blog', label: 'Blog', href: getHref('/blog/', 'blog/index.html'), match: (p) => p.includes('/blog') },
      { id: 'contact', label: 'Kontakt', href: getHref('/kontakt/', 'kontakt/index.html'), match: (p) => p.includes('/kontakt') }
    ];

    // Nav Root
    const menu = document.createElement('nav');
    menu.id = 'fg-menu';
    menu.className = 'fg-menu';
    menu.setAttribute('aria-label', 'Szybka nawigacja');

    // Single Morphing Capsule Container
    const capsule = document.createElement('div');
    capsule.className = 'fg-capsule';

    // 1. Bottom Bar Row: HOME + Hamburger
    const bar = document.createElement('div');
    bar.className = 'fg-bar';

    const homeBtn = document.createElement('a');
    homeBtn.className = 'fg-home';
    homeBtn.href = isHomePage ? '#top' : (isFileProto ? (prefix ? prefix + 'index.html' : 'index.html') : '/');
    homeBtn.textContent = 'HOME';
    homeBtn.setAttribute('aria-label', 'Grafmen: powr\u00f3t na g\u00f3r\u0119 strony');

    if (isHomePage) {
      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeMenu();
      });
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'fg-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'fg-body');
    toggleBtn.setAttribute('aria-label', 'Otw\u00f3rz menu');
    toggleBtn.innerHTML = '<span class="fg-burger" aria-hidden="true"><span class="fg-line fg-line--1"></span><span class="fg-line fg-line--2"></span><span class="fg-line fg-line--3"></span></span>';

    bar.appendChild(homeBtn);
    bar.appendChild(toggleBtn);

    // 2. Expandable Body with links
    const body = document.createElement('div');
    body.id = 'fg-body';
    body.className = 'fg-body';
    body.setAttribute('role', 'region');
    body.setAttribute('aria-label', 'Szybkie menu');
    body.setAttribute('aria-hidden', 'true');

    const list = document.createElement('ul');
    list.className = 'fg-list';

    navItems.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'fg-item';

      const a = document.createElement('a');
      a.className = 'fg-link';
      a.href = item.href;
      a.textContent = item.label;

      if (item.match && item.match(currentPath)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
        a.addEventListener('click', (e) => {
          e.preventDefault();
          closeMenu(true);
        });
      } else {
        a.addEventListener('click', () => {
          setTimeout(() => closeMenu(false), 80);
        });
      }

      li.appendChild(a);
      list.appendChild(li);
    });

    const sep = document.createElement('div');
    sep.className = 'fg-separator';
    sep.setAttribute('aria-hidden', 'true');

    body.appendChild(list);
    body.appendChild(sep);

    capsule.appendChild(bar);
    capsule.appendChild(body);
    menu.appendChild(capsule);
    document.body.appendChild(menu);

    // Interaction state
    let isOpen = false;

    const openMenu = () => {
      if (isOpen) return;
      isOpen = true;
      menu.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Zamknij menu');
      body.setAttribute('aria-hidden', 'false');
      const firstLink = body.querySelector('a');
      if (firstLink) firstLink.focus();
    };

    const closeMenu = (restoreFocus = false) => {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Otw\u00f3rz menu');
      body.setAttribute('aria-hidden', 'true');
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

    // Visibility observer: show past Hero, hide at footer
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
