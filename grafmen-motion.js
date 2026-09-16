/**
 * Grafmen.com - Unified Motion Engine (Motion Pass 01)
 * Built on GSAP 3.x, ScrollTrigger, and SplitText.
 * Good Fella text reveal, calm easing, progressive enhancement.
 */
(() => {
  if (typeof window === 'undefined') return;

  const initMotion = async () => {
    // 1. Accessibility & Progressive Enhancement: check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Retain standard immediate display, no GSAP overrides
      return;
    }

    // 2. Ensure fonts are fully rendered before calculating SplitText line breaks
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 3. Verify GSAP & plugins availability
    if (typeof gsap === 'undefined') {
      console.warn('[Grafmen Motion] GSAP is not loaded.');
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    }

    // 4. HERO ENTRANCE CHOREOGRAPHY (Good Fella Style Line Mask Reveal)
    const hero = document.querySelector('.hero');
    const heroH1 = hero?.querySelector('h1');

    if (hero && heroH1 && typeof SplitText !== 'undefined') {
      const terminal = heroH1.querySelector('.terminal');
      if (terminal) terminal.remove();

      // Nested SplitText: parent clips overflow, child slides up
      const childSplit = new SplitText(heroH1, { type: 'lines', linesClass: 'gf-line-inner' });
      const parentSplit = new SplitText(heroH1, { type: 'lines', linesClass: 'gf-line-mask' });

      // Put terminal at the end of the last line
      if (terminal) {
        const lastLine = childSplit.lines[childSplit.lines.length - 1];
        if (lastLine) {
          lastLine.appendChild(terminal);
        }
      }

      const heroTl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          gsap.set(childSplit.lines, { clearProps: 'transform,opacity,willChange' });
          gsap.set(['.eyebrow', '.hero .lead', '.hero .actions a', '.meta01', '.hero-bottom'], { clearProps: 'transform,opacity' });
        }
      });

      // 0.00: Location eyebrow
      heroTl.fromTo('.eyebrow', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.5 }, 
        0
      );

      // 0.10: H1 lines cascade reveal
      heroTl.fromTo(childSplit.lines, 
        { yPercent: 110, opacity: 0 }, 
        { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.085 }, 
        0.10
      );

      // 0.42: Underline on "swoją" (scaleX: 0 -> 1)
      const uword = hero.querySelector('.uword');
      if (uword) {
        heroTl.fromTo(uword, 
          { '--u-scale': 0 }, 
          { '--u-scale': 1, duration: 0.65, ease: 'power3.out' }, 
          0.42
        );
      }

      // 0.50: Block meta01 (STRONY WWW / BRANDING / MOTION)
      heroTl.fromTo('.meta01', 
        { opacity: 0, y: 14 }, 
        { opacity: 1, y: 0, duration: 0.6 }, 
        0.50
      );

      // 0.52: Orange dot reveal
      if (terminal) {
        heroTl.fromTo(terminal, 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }, 
          0.52
        );
      }

      // 0.65: Lead paragraph
      heroTl.fromTo('.hero .lead', 
        { opacity: 0, y: 16 }, 
        { opacity: 1, y: 0, duration: 0.6 }, 
        0.65
      );

      // 0.80: CTA buttons
      heroTl.fromTo('.hero .actions a', 
        { opacity: 0, y: 14 }, 
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, 
        0.80
      );

      // 0.95: Hero bottom bar
      heroTl.fromTo('.hero-bottom', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.5 }, 
        0.95
      );
    }

    // 5. SCROLL REVEAL FOR DUŻE H2 (data-motion="heading-reveal")
    if (typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined') {
      const headingReveals = document.querySelectorAll('[data-motion="heading-reveal"]');
      headingReveals.forEach(h2 => {
        const child = new SplitText(h2, { type: 'lines', linesClass: 'gf-line-inner' });
        const parent = new SplitText(h2, { type: 'lines', linesClass: 'gf-line-mask' });

        gsap.fromTo(child.lines, 
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.06,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: h2,
              start: 'top 85%',
              once: true,
              onComplete: () => {
                gsap.set(child.lines, { clearProps: 'transform,opacity,willChange' });
              }
            }
          }
        );
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
