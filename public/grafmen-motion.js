/**
 * Grafmen.com - Unified Motion Engine
 * Built on GSAP 3.x, ScrollTrigger, and SplitText.
 * Good Fella text reveal on homepage, calm unified reveal on subpages.
 * Progressive enhancement: HTML text is always visible by default.
 */
(() => {
  if (typeof window === 'undefined') return;

  const initMotion = async () => {
    // 1. Accessibility: check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Respect accessibility setting: immediate display, no overrides
      return;
    }

    // 2. Safe font readiness check with 350ms timeout (avoids freeze on older/custom browsers)
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 350))
      ]);
    }

    // 3. Verify GSAP availability
    if (typeof gsap === 'undefined') {
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    }

    // 4. HOMEPAGE HERO ENTRANCE (Kinetic Horizontal Wipe Reveal)
    const hero = document.querySelector('.hero');
    const heroH1 = hero?.querySelector('h1');

    if (hero && heroH1) {
      let failsafeTimer = null;

      const buildHeroTimeline = () => {
        if (window.__heroTimeline) {
          window.__heroTimeline.kill();
        }
        if (failsafeTimer) {
          clearTimeout(failsafeTimer);
        }

        // Fresh dynamic queries for resilience against DOM updates
        const heroLines = heroH1.querySelectorAll('.hero-line');
        const lineInners = heroH1.querySelectorAll('.hero-line-inner');
        const brandRects = heroH1.querySelectorAll('.hero-wipe-brand');
        const fgRects = heroH1.querySelectorAll('.hero-wipe-fg');
        const calmElements = hero.querySelectorAll('.eyebrow, .lead, .actions a, .meta01, .hero-bottom');

        if (!heroLines.length || !lineInners.length) return;

        // Failsafe watchdog: guarantees full text visibility after 2.0s even under heavy tab throttling or errors
        failsafeTimer = setTimeout(() => {
          gsap.set(heroH1.querySelectorAll('.hero-line-inner'), { clearProps: 'all', opacity: 1 });
          gsap.set(heroH1.querySelectorAll('.hero-wipe-brand, .hero-wipe-fg'), { clearProps: 'all', scaleX: 0 });
          gsap.set(hero.querySelectorAll('.eyebrow, .lead, .actions a, .meta01, .hero-bottom'), { clearProps: 'all', opacity: 1 });
        }, 2000);

        gsap.set(lineInners, { opacity: 0 });
        gsap.set([brandRects, fgRects], { scaleX: 0, transformOrigin: 'left' });
        gsap.set(calmElements, { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            if (failsafeTimer) clearTimeout(failsafeTimer);
            gsap.set([lineInners, brandRects, fgRects], { clearProps: 'all' });
            gsap.set(calmElements, { clearProps: 'opacity' });
          }
        });

        heroLines.forEach((line, index) => {
          const lineInner = line.querySelector('.hero-line-inner');
          const brandRect = line.querySelector('.hero-wipe-brand');
          const fgRect = line.querySelector('.hero-wipe-fg');
          if (!lineInner || !brandRect || !fgRect) return;

          const lineStart = index * 0.12;
          tl.to(brandRect, { scaleX: 1, duration: 0.42 }, lineStart);
          tl.to(fgRect, { scaleX: 1, duration: 0.42 }, lineStart + 0.06);
          tl.set(lineInner, { opacity: 1 }, lineStart + 0.48);
          tl.set([brandRect, fgRect], { transformOrigin: 'right' }, lineStart + 0.48);
          tl.to(fgRect, { scaleX: 0, duration: 0.42 }, lineStart + 0.48);
          tl.to(brandRect, { scaleX: 0, duration: 0.42 }, lineStart + 0.54);
        });

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

      // Ensure that returning from an inactive background tab plays the timeline or completes it
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          if (window.__heroTimeline && window.__heroTimeline.progress() < 1) {
            window.__heroTimeline.play();
          }
        }
      });
    }

    // 5. SUBPAGE HERO ENTRANCE (Calm 0.6s text reveal on subpages)
    const subpageH1 = document.querySelector('.service-hero h1, .blog-hero h1, .portfolio-hero h1, .post-hero h1');
    if (subpageH1 && !subpageH1.dataset.motionDone) {
      subpageH1.dataset.motionDone = 'true';
      if (typeof SplitText !== 'undefined') {
        const split = new SplitText(subpageH1, { type: 'lines', linesClass: 'subpage-line' });
        const mask = new SplitText(subpageH1, { type: 'lines', linesClass: 'subpage-mask' });
        gsap.fromTo(split.lines,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.07,
            ease: 'power2.out',
            onComplete: () => {
              gsap.set(split.lines, { clearProps: 'all' });
              mask.lines.forEach(l => { l.style.overflow = 'visible'; });
            }
          }
        );
      } else {
        gsap.fromTo(subpageH1,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => gsap.set(subpageH1, { clearProps: 'all' })
          }
        );
      }
    }

    // 6. SCROLL REVEAL FOR DUŻE H2 (data-motion="heading-reveal")
    if (typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined') {
      const headingReveals = document.querySelectorAll('[data-motion="heading-reveal"]');
      headingReveals.forEach(h2 => {
        if (h2.dataset.motionDone) return;
        h2.dataset.motionDone = 'true';
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
              once: true
            },
            onComplete: () => {
              gsap.set(child.lines, { clearProps: 'transform,opacity,willChange' });
              parent.lines.forEach(line => {
                line.classList.add('is-revealed');
                line.style.overflow = 'visible';
              });
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
