/**
 * Grafmen.com - Homepage Micro-Interactions & Motion Engine
 * Exclusively active on the homepage (.home-page).
 * 
 * Features:
 * - Smooth scrolling via Lenis (desktop with fine pointer only)
 * - Harmonious ScrollTrigger integration
 * - Calmed line-by-line reveal for section headings (Portfolio, Współpraca, Opinie, FAQ, CTA)
 * - Safe entrance for portfolio cards & section grids
 * - Controlled subtle parallax on p4 (Hiker) only (Drewmax is strictly static)
 * - Resilient architecture ensuring 100% accessible content without premature timeouts
 */
(() => {
  if (typeof window === 'undefined') return;

  const initHomepageMotion = async () => {
    // 1. Target homepage exclusively
    if (!document.body.classList.contains('home-page')) {
      return;
    }

    // 2. Accessibility & Environment checks
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData = Boolean(navigator.connection?.saveData);
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (prefersReducedMotion) {
      // Respect user accessibility preference immediately
      return;
    }

    // Safe font readiness check
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

    // 4. LENIS SMOOTH SCROLL (Desktop with fine pointer only)
    let lenis = null;
    if (canHover && !isSaveData && typeof Lenis !== 'undefined') {
      try {
        lenis = new Lenis({
          lerp: 0.08,
          duration: 1.1,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false
        });

        // Synchronize Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        const lenisTicker = (time) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(lenisTicker);
        gsap.ticker.lagSmoothing(0);

        window.__grafmenLenis = lenis;

        // Cleanup on Astro page transition
        document.addEventListener('astro:before-swap', () => {
          if (window.__grafmenLenis) {
            gsap.ticker.remove(lenisTicker);
            window.__grafmenLenis.destroy();
            window.__grafmenLenis = null;
          }
        }, { once: true });
      } catch (err) {
        console.warn('Lenis initialization skipped:', err);
      }
    }

    // 5. UNIFIED HEADING REVEAL (Portfolio, Współpraca, Opinie, FAQ, CTA)
    // Specifications:
    // - Entry from bottom: y 24px -> 0
    // - Opacity: 0 -> 1
    // - Desktop blur: 3px -> 0px (none on mobile)
    // - Duration: 0.8s
    // - Line stagger: 0.08s
    // - Smooth deceleration: power2.out
    // - Trigger start: 'top 80%'
    // - Execution: once per page load
    if (typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined') {
      const headingSelectors = [
        '#portfolio-title',
        '.audience-section h2',
        '#testimonials-title',
        '#faq-title',
        '#cta-title',
        '[data-motion="heading-reveal"]'
      ];
      const allFound = document.querySelectorAll(headingSelectors.join(', '));
      const uniqueHeadings = Array.from(new Set(allFound));

      uniqueHeadings.forEach((h2) => {
        if (h2.dataset.motionDone) return;
        h2.dataset.motionDone = 'true';

        const originalHtml = h2.innerHTML;
        const split = new SplitText(h2, { type: 'lines', linesClass: 'gf-heading-line', aria: 'none' });

        if (!split.lines || !split.lines.length) {
          h2.innerHTML = originalHtml;
          return;
        }

        split.lines.forEach((line) => {
          line.style.display = 'block';
          line.style.willChange = 'transform, opacity, filter';
        });

        gsap.fromTo(split.lines,
          {
            opacity: 0,
            y: 24,
            filter: canHover ? 'blur(3px)' : 'none'
          },
          {
            opacity: 1,
            y: 0,
            filter: canHover ? 'blur(0px)' : 'none',
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: h2,
              start: 'top 80%',
              once: true
            },
            onComplete: () => {
              gsap.set(split.lines, { clearProps: 'all' });
            }
          }
        );
      });
    }

    // 6. PORTFOLIO CARDS ENTRANCE
    // Drewmax is strictly static (no scale, no parallax); cards fade in gently
    const portfolioCards = document.querySelectorAll('.portfolio .stage .work');
    if (portfolioCards.length && typeof ScrollTrigger !== 'undefined') {
      portfolioCards.forEach((workEl) => {
        const mediaLink = workEl.querySelector('.media-link');
        if (!mediaLink || workEl.dataset.entranceDone) return;
        workEl.dataset.entranceDone = 'true';

        gsap.fromTo(mediaLink, 
          { 
            opacity: 0, 
            y: canHover ? 24 : 16 
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: workEl,
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(mediaLink, { clearProps: 'transform,opacity' });
            }
          }
        );
      });
    }

    // 7. CONTROLLED VERTICAL PARALLAX (Hiker branding mockup p4 only)
    // Strictly checked: never applied to Drewmax or text-heavy screenshots
    if (canHover && !isSaveData && typeof ScrollTrigger !== 'undefined') {
      const parallaxImages = document.querySelectorAll('.portfolio .p4 .project-image[data-parallax="photo"]');
      parallaxImages.forEach(img => {
        const workParent = img.closest('.work');
        if (!workParent || img.dataset.parallaxActive) return;
        img.dataset.parallaxActive = 'true';

        gsap.fromTo(img, 
          { yPercent: -2.5 },
          {
            yPercent: 2.5,
            ease: 'none',
            scrollTrigger: {
              trigger: workParent,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8
            }
          }
        );
      });
    }

    // 8. SECTION CARDS STAGGER (Współpraca & Opinie)
    if (typeof ScrollTrigger !== 'undefined') {
      // Współpraca cards
      const collabGrid = document.querySelector('.collab-cards');
      if (collabGrid && !collabGrid.dataset.motionDone) {
        collabGrid.dataset.motionDone = 'true';
        const cards = collabGrid.querySelectorAll('.collab-card');
        if (cards.length) {
          gsap.fromTo(cards,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: collabGrid,
                start: 'top 85%',
                once: true
              },
              onComplete: () => {
                gsap.set(cards, { clearProps: 'transform,opacity' });
              }
            }
          );
        }
      }

      // Testimonial cards
      const testimonialGrid = document.querySelector('.testimonial-grid');
      if (testimonialGrid && !testimonialGrid.dataset.motionDone) {
        testimonialGrid.dataset.motionDone = 'true';
        const tCards = testimonialGrid.querySelectorAll('.testimonial-card');
        if (tCards.length) {
          gsap.fromTo(tCards,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: testimonialGrid,
                start: 'top 85%',
                once: true
              },
              onComplete: () => {
                gsap.set(tCards, { clearProps: 'transform,opacity' });
              }
            }
          );
        }
      }
    }

    // 9. ACCESSIBILITY & SAFETY WATCHDOG:
    // Only rescues elements that are actually within the current viewport if an animation got interrupted.
    // DOES NOT clear elements below the fold, ensuring animations fire normally even after waiting 5+ seconds on hero!
    const rescueVisibleElements = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const allTargets = document.querySelectorAll(
        '.portfolio .media-link, .collab-card, .testimonial-card, .gf-heading-line'
      );
      allTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Only if element is in the viewport and stuck at 0 opacity
        if (rect.top < vh && rect.bottom > 0) {
          const comp = window.getComputedStyle(el);
          if (comp.opacity === '0') {
            gsap.set(el, { clearProps: 'all', opacity: 1 });
          }
        }
      });
    };

    // Run rescue watchdog on window blur/visibility change or after prolonged interaction
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        ScrollTrigger.refresh();
        rescueVisibleElements();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageMotion);
  } else {
    initHomepageMotion();
  }
})();
