/* Subtle section scroll reveal - Vanilla JS, zero dependencies */
(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Target content sections, strictly excluding any Hero section across homepage and subpages
  const heroSelectors = '.hero, .service-hero, .portfolio-hero, .project-heading';
  const allCandidates = document.querySelectorAll('main > section, section.final-cta, .project-detail > section');
  const sections = Array.from(allCandidates).filter(sec => !sec.matches(heroSelectors));
  if (!sections.length) return;

  // Mark html as reveal-enabled only when script successfully runs
  document.documentElement.classList.add('js-reveal-enabled');

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
})();
