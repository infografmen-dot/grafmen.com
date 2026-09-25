/* Subtle section scroll reveal & Footer fluid entrance - Vanilla JS, zero dependencies */
(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Mark html as reveal-enabled only when script successfully runs
  document.documentElement.classList.add('js-reveal-enabled');

  // 1. Content sections reveal
  const heroSelectors = '.hero, .service-hero, .portfolio-hero, .project-heading';
  const allCandidates = document.querySelectorAll('main > section, section.final-cta, .project-detail > section');
  const sections = Array.from(allCandidates).filter(sec => {
    if (sec.matches(heroSelectors)) return false;
    if (sec.querySelector('[data-motion="heading-reveal"]')) return false;
    if (sec.querySelector('.feature-grid, .package-grid, .process-steps, .how-steps-grid, .rules-columns, .proof-grid, .blog-list-grid, .project-gallery, .contact-brief, .faq-grid, .compact-grid, .branding-motion-callout, .logo-cloud')) return false;
    return true;
  });

  if (sections.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.06
    });

    sections.forEach(section => {
      section.classList.add('reveal-section');
      observer.observe(section);
    });
  }

  // 2. Footer fluid entrance (Solox-style)
  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.classList.add('footer-reveal-ready');
    const footerObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05
    });

    footerObserver.observe(footer);
  }
})();
