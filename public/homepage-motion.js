/**
 * Grafmen.com - Homepage Micro-Interactions & Motion Engine
 * Exclusively active on the homepage (.home-page).
 * 
 * Features:
 * - Smooth scrolling via Lenis (desktop with fine pointer only)
 * - Harmonious ScrollTrigger integration
 * - Staggered card reveals for portfolio & sections
 * - Subtle, elegant vertical parallax on p1 (Drewmax) & p4 (Hiker)
 * - Failsafe watchdogs ensuring 100% accessible content
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

    // 3. Wait for GSAP availability
    if (typeof gsap === 'undefined') {
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
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

    // 5. PORTFOLIO CARDS ENTRANCE (Subtle fade-in & upward glide)
    const portfolioCards = document.querySelectorAll('.portfolio .stage .work');
    if (portfolioCards.length && typeof ScrollTrigger !== 'undefined') {
      portfolioCards.forEach((workEl, index) => {
        const cardInner = workEl.querySelector('.project-card');
        if (!cardInner || workEl.dataset.entranceDone) return;
        workEl.dataset.entranceDone = 'true';

        gsap.fromTo(cardInner, 
          { 
            opacity: 0, 
            y: canHover ? 32 : 18 
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: workEl,
              start: 'top 88%',
              once: true
            },
            onComplete: () => {
              gsap.set(cardInner, { clearProps: 'transform,opacity' });
            }
          }
        );
      });
    }

    // 6. VERTICAL PARALLAX (p1 Drewmax & p4 Hiker mockups)
    // Only applied on desktop (hover: hover & pointer: fine) inside existing overflow:hidden .media wrappers
    if (canHover && !isSaveData && typeof ScrollTrigger !== 'undefined') {
      const parallaxImages = document.querySelectorAll('.portfolio .project-image[data-parallax="photo"]');
      parallaxImages.forEach(img => {
        const workParent = img.closest('.work');
        if (!workParent || img.dataset.parallaxActive) return;
        img.dataset.parallaxActive = 'true';

        gsap.fromTo(img, 
          { yPercent: -4 },
          {
            yPercent: 4,
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

    // 7. SECTION CARDS STAGGER (Współpraca & Opinie)
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
              duration: 0.7,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: collabGrid,
                start: 'top 86%',
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
              duration: 0.7,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: testimonialGrid,
                start: 'top 86%',
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

    // 8. WATCHDOG FAILSAFE: Guarantees full visibility after 2.5s even if ScrollTrigger gets throttled
    setTimeout(() => {
      const allCards = document.querySelectorAll('.portfolio .project-card, .collab-card, .testimonial-card');
      allCards.forEach(el => {
        if (window.getComputedStyle(el).opacity === '0') {
          gsap.set(el, { clearProps: 'all', opacity: 1 });
        }
      });
    }, 2500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageMotion);
  } else {
    initHomepageMotion();
  }
})();
