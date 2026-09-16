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

    // 4. HERO ENTRANCE CHOREOGRAPHY (Good Fella Kinetic Horizontal Wipe Reveal)
    const hero = document.querySelector('.hero');
    const heroH1 = hero?.querySelector('h1');
    const heroLines = heroH1 ? heroH1.querySelectorAll('.hero-line') : [];

    if (hero && heroH1 && heroLines.length > 0) {
      const lineInners = heroH1.querySelectorAll('.hero-line-inner');
      const brandRects = heroH1.querySelectorAll('.hero-wipe-brand');
      const fgRects = heroH1.querySelectorAll('.hero-wipe-fg');
      const calmElements = hero.querySelectorAll('.eyebrow, .lead, .actions a, .meta01, .hero-bottom');

      const buildHeroTimeline = () => {
        if (window.__heroTimeline) {
          window.__heroTimeline.kill();
        }
        gsap.set(lineInners, { opacity: 0 });
        gsap.set([brandRects, fgRects], { scaleX: 0, transformOrigin: 'left' });
        gsap.set(calmElements, { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            gsap.set([lineInners, brandRects, fgRects], { clearProps: 'all' });
            gsap.set(calmElements, { clearProps: 'opacity' });
          }
        });

        // Animate each of the 4 explicit lines with a stagger (0.12s)
        heroLines.forEach((line, index) => {
          const lineInner = line.querySelector('.hero-line-inner');
          const brandRect = line.querySelector('.hero-wipe-brand');
          const fgRect = line.querySelector('.hero-wipe-fg');
          if (!lineInner || !brandRect || !fgRect) return;

          // Timing cascade: Line 0: 0.00s, Line 1: 0.12s, Line 2: 0.24s, Line 3: 0.36s
          const lineStart = index * 0.12;

          // 1. Orange accent block (brand) sweeps across from left to right
          tl.to(brandRect, { scaleX: 1, duration: 0.42 }, lineStart);

          // 2. Main block (fg) sweeps from left with 0.06s offset (orange tip leads)
          tl.to(fgRect, { scaleX: 1, duration: 0.42 }, lineStart + 0.06);

          // 3. Midpoint: text becomes visible under full cover, origin flips to right
          tl.set(lineInner, { opacity: 1 }, lineStart + 0.48);
          tl.set([brandRect, fgRect], { transformOrigin: 'right' }, lineStart + 0.48);

          // 4. Main block collapses to right, revealing text
          tl.to(fgRect, { scaleX: 0, duration: 0.42 }, lineStart + 0.48);

          // 5. Orange block collapses to right with 0.06s offset (crisp trailing orange tip)
          tl.to(brandRect, { scaleX: 0, duration: 0.42 }, lineStart + 0.54);
        });

        // Calm subtle fade for the rest of Hero elements after H1 finishes (~1.25s)
        tl.to(calmElements, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.04
        }, 1.25);

        window.__heroTimeline = tl;
        return tl;
      };

      buildHeroTimeline();

      window.__replayHeroMotion = () => {
        buildHeroTimeline();
      };
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
