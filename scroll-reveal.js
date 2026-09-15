/* Subtle section scroll reveal - Vanilla JS, zero dependencies */
(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Target main sections, strictly excluding Hero homepage
  const sections = document.querySelectorAll('main > section:not(.hero)');
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
    threshold: 0.08
  });

  sections.forEach(section => {
    section.classList.add('reveal-section');
    observer.observe(section);
  });
})();
