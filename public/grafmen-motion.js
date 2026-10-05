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
      document.documentElement.classList.add('hero-motion-done');
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
      document.documentElement.classList.add('hero-motion-done');
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    }

    // =========================================================================
    // WSPÓLNY STANDARD ANIMACJI WEJŚCIA (Referencja spokoju: WeCreate)
    // Parametry standardu: translateY: 24px -> 0, opacity: 0 -> 1, duration: 600ms,
    // easing: cubic-bezier(0.22, 0.61, 0.36, 1), start: 'top 85%', once: true, stagger: ~80ms
    // =========================================================================
    const createCubicBezier = (p1x, p1y, p2x, p2y) => {
      const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
      const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
      const sampleCurveX = (t) => ((ax * t + bx) * t + cx) * t;
      const sampleCurveY = (t) => ((ay * t + by) * t + cy) * t;
      const sampleCurveDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
      const solveCurveX = (x) => {
        let t2 = x;
        for (let i = 0; i < 8; i++) {
          const x2 = sampleCurveX(t2) - x;
          if (Math.abs(x2) < 1e-4) return t2;
          const d2 = sampleCurveDerivativeX(t2);
          if (Math.abs(d2) < 1e-4) break;
          t2 = t2 - x2 / d2;
        }
        return t2;
      };
      return (t) => {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        return sampleCurveY(solveCurveX(t));
      };
    };

    const MOTION_EASE_CALM = createCubicBezier(0.22, 0.61, 0.36, 1);
    const isMobileMotion = window.matchMedia('(max-width: 900px)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const MOTION_CONFIG = {
      block: {
        y: isMobileMotion ? 26 : 38,   // Zmniejszone o ~20% (komputer: 38px, telefon: 26px)
        x: isMobileMotion ? -12 : -15, // Zmniejszone o ~20% w osi X dla wejść z lewej
        opacityFrom: 0,
        opacityTo: 1,
        duration: 1.0,                 // 1000ms
        ease: MOTION_EASE_CALM,        // cubic-bezier(0.22, 0.61, 0.36, 1)
        stagger: 0.12,                 // 120ms w małych grupach
        start: 'top 88%',
        once: true
      }
    };

    // Helper: zachowanie oryginalnego kierunku wyłaniania etykiet z lewej (w osi X)
    const animKickerLeft = (kicker, timeline, position = 0) => {
      if (!kicker) return;
      kicker.dataset.kickerDone = 'true';
      let inner = kicker.querySelector('.kicker-inner');
      if (!inner) {
        inner = document.createElement('span');
        inner.className = 'kicker-inner';
        inner.style.display = 'inline-block';
        inner.style.color = 'inherit';
        inner.style.willChange = 'clip-path, transform';
        while (kicker.firstChild) {
          inner.appendChild(kicker.firstChild);
        }
        kicker.appendChild(inner);
      }

      timeline.fromTo(inner,
        {
          clipPath: 'inset(0 100% 0 0)',
          x: MOTION_CONFIG.block.x,
          opacity: 0.7
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          x: 0,
          opacity: 1,
          duration: MOTION_CONFIG.block.duration,
          ease: MOTION_CONFIG.block.ease
        },
        position
      );
    };

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
        document.documentElement.classList.remove('hero-motion-done');

        // Fresh dynamic queries for resilience against DOM updates
        const heroLines = heroH1.querySelectorAll('.hero-line');
        const lineInners = heroH1.querySelectorAll('.hero-line-inner');
        const brandRects = heroH1.querySelectorAll('.hero-wipe-brand');
        const fgRects = heroH1.querySelectorAll('.hero-wipe-fg');

        const eyebrowInner = hero.querySelector('.eyebrow .hero-mask-inner') || hero.querySelector('.eyebrow');
        const contactInner = hero.querySelector('.hero-contact .hero-mask-inner') || hero.querySelector('.hero-contact');
        const metaTop = hero.querySelector('.meta01-top');
        const metaInners = hero.querySelectorAll('.meta01-inner');
        const miniInners = hero.querySelectorAll('.hero-bottom .mini .hero-mask-inner');
        const centerIndicator = hero.querySelector('.hero-bottom .center');
        const leadText = hero.querySelector('.lead');
        const actionBtn = hero.querySelector('.actions a');

        if (!heroLines.length || !lineInners.length) return;

        // Failsafe watchdog: guarantees full text visibility after 2.2s even under heavy tab throttling or errors
        failsafeTimer = setTimeout(() => {
          document.documentElement.classList.add('hero-motion-done');
          gsap.set(heroH1.querySelectorAll('.hero-line-inner'), { clearProps: 'all', opacity: 1 });
          gsap.set(heroH1.querySelectorAll('.hero-wipe-brand, .hero-wipe-fg'), { clearProps: 'all', scaleX: 0 });
          gsap.set([eyebrowInner, contactInner, leadText, actionBtn, centerIndicator], { clearProps: 'all', opacity: 1, y: 0 });
          if (metaTop) gsap.set(metaTop, { clearProps: 'all', scaleX: 1 });
          if (metaInners.length) gsap.set(metaInners, { clearProps: 'all', opacity: 1, y: 0 });
          if (miniInners.length) gsap.set(miniInners, { clearProps: 'all', opacity: 1, y: 0 });
        }, 2200);

        gsap.set(lineInners, { opacity: 0 });
        gsap.set([brandRects, fgRects], { scaleX: 0, transformOrigin: 'left' });
        if (eyebrowInner) gsap.set(eyebrowInner, { y: 14, opacity: 0 });
        if (contactInner) gsap.set(contactInner, { y: 14, opacity: 0 });
        if (leadText) gsap.set(leadText, { y: 12, opacity: 0 });
        if (actionBtn) gsap.set(actionBtn, { y: 12, opacity: 0 });
        if (metaTop) gsap.set(metaTop, { scaleX: 0, transformOrigin: 'left' });
        if (metaInners.length) gsap.set(metaInners, { y: -16, opacity: 0 });
        if (miniInners.length) gsap.set(miniInners, { y: 14, opacity: 0 });
        if (centerIndicator) gsap.set(centerIndicator, { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            if (failsafeTimer) clearTimeout(failsafeTimer);
            document.documentElement.classList.add('hero-motion-done');
            gsap.set([lineInners, brandRects, fgRects], { clearProps: 'all' });
            gsap.set([eyebrowInner, contactInner, leadText, actionBtn, metaTop, centerIndicator], { clearProps: 'all' });
            if (metaInners.length) gsap.set(metaInners, { clearProps: 'all' });
            if (miniInners.length) gsap.set(miniInners, { clearProps: 'all' });
          }
        });

        // 1. Eyebrow i kontakt odsłaniają się płynnie od dołu w masce
        if (eyebrowInner) {
          tl.to(eyebrowInner, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out'
          }, 0.15);
        }
        if (contactInner) {
          tl.to(contactInner, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out'
          }, 0.15);
        }

        // 2. Linie H1 odsłaniają się kolejno
        heroLines.forEach((line, index) => {
          const lineInner = line.querySelector('.hero-line-inner');
          const brandRect = line.querySelector('.hero-wipe-brand');
          const fgRect = line.querySelector('.hero-wipe-fg');
          if (!lineInner || !brandRect || !fgRect) return;

          const lineStart = 0.2 + (index * 0.12);
          tl.to(brandRect, { scaleX: 1, duration: 0.42 }, lineStart);
          tl.to(fgRect, { scaleX: 1, duration: 0.42 }, lineStart + 0.06);
          tl.set(lineInner, { opacity: 1 }, lineStart + 0.48);
          tl.set([brandRect, fgRect], { transformOrigin: 'right' }, lineStart + 0.48);
          tl.to(fgRect, { scaleX: 0, duration: 0.42 }, lineStart + 0.48);
          tl.to(brandRect, { scaleX: 0, duration: 0.42 }, lineStart + 0.54);
        });

        // 3. Meta01: pomarańczowa kreska pierwsza, potem lista STRONY WWW, BRANDING, MOTION od góry do dołu
        if (metaTop) {
          tl.to(metaTop, {
            scaleX: 1,
            duration: 0.45,
            ease: 'power3.out'
          }, 0.38);
        }
        if (metaInners.length) {
          tl.to(metaInners, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out'
          }, 0.52);
        }

        // 4. Lead i Przycisk CTA
        if (leadText) {
          tl.to(leadText, {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power2.out'
          }, 0.72);
        }
        if (actionBtn) {
          tl.to(actionBtn, {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power2.out'
          }, 0.88);
        }

        // 5. Dolne podpisy .mini odsłaniają się przez maski
        if (miniInners.length) {
          tl.to(miniInners, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out'
          }, 0.9);
        }
        if (centerIndicator) {
          tl.to(centerIndicator, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
          }, 0.95);
        }

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

    // 5. SUBPAGE HERO ENTRANCE (Kinetic Horizontal Wipe Reveal matching Homepage)
    const subpageH1 = document.querySelector('.service-hero h1, .portfolio-head h1');
    if (subpageH1 && !subpageH1.dataset.motionDone) {
      subpageH1.dataset.motionDone = 'true';

      const originalHtml = subpageH1.innerHTML;
      const plainText = (subpageH1.innerHTML || '')
        .replace(/<br\s*[\/]?>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;|\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (plainText) {
        subpageH1.setAttribute('aria-label', plainText);
      }

      // Failsafe watchdog: ensures heading is 100% visible even under heavy tab throttling or errors
      let subpageFailsafe = setTimeout(() => {
        subpageH1.innerHTML = originalHtml;
        if (plainText) subpageH1.setAttribute('aria-label', plainText);
        gsap.set(subpageH1, { clearProps: 'all', opacity: 1 });
      }, 1500);

      if (typeof SplitText !== 'undefined') {
        const split = new SplitText(subpageH1, { type: 'lines', linesClass: 'hero-line-wrap', aria: 'none' });
        if (plainText) subpageH1.setAttribute('aria-label', plainText);

        split.lines.forEach((lineWrap) => {
          lineWrap.setAttribute('aria-hidden', 'true');
          const lineHtml = lineWrap.innerHTML;
          lineWrap.innerHTML =
            `<span class="hero-line">` +
              `<span class="hero-line-inner" style="opacity:0">${lineHtml}</span>` +
              `<span class="hero-wipe-brand" aria-hidden="true"></span>` +
              `<span class="hero-wipe-fg" aria-hidden="true"></span>` +
            `</span>`;
        });

        const heroLines = subpageH1.querySelectorAll('.hero-line');
        const lineInners = subpageH1.querySelectorAll('.hero-line-inner');
        const brandRects = subpageH1.querySelectorAll('.hero-wipe-brand');
        const fgRects = subpageH1.querySelectorAll('.hero-wipe-fg');

        if (!heroLines.length || !lineInners.length) {
          clearTimeout(subpageFailsafe);
          subpageH1.innerHTML = originalHtml;
          return;
        }

        gsap.set(lineInners, { opacity: 0 });
        gsap.set([brandRects, fgRects], { scaleX: 0, transformOrigin: 'left' });

        const tl = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            if (subpageFailsafe) clearTimeout(subpageFailsafe);
            // Revert cleanly to original HTML so natural word wrapping and resize remain pristine
            subpageH1.innerHTML = originalHtml;
            if (plainText) subpageH1.setAttribute('aria-label', plainText);
            gsap.set(subpageH1, { clearProps: 'all', opacity: 1 });
          }
        });

        // 0.6–0.9s total duration matching homepage kinetic wipe
        heroLines.forEach((line, index) => {
          const lineInner = line.querySelector('.hero-line-inner');
          const brandRect = line.querySelector('.hero-wipe-brand');
          const fgRect = line.querySelector('.hero-wipe-fg');
          if (!lineInner || !brandRect || !fgRect) return;

          const lineStart = index * 0.10;
          tl.to(brandRect, { scaleX: 1, duration: 0.38 }, lineStart);
          tl.to(fgRect, { scaleX: 1, duration: 0.38 }, lineStart + 0.05);
          tl.set(lineInner, { opacity: 1 }, lineStart + 0.43);
          tl.set([brandRect, fgRect], { transformOrigin: 'right' }, lineStart + 0.43);
          tl.to(fgRect, { scaleX: 0, duration: 0.36 }, lineStart + 0.43);
          tl.to(brandRect, { scaleX: 0, duration: 0.36 }, lineStart + 0.48);
        });
      } else {
        // Graceful fallback if SplitText is unavailable
        gsap.fromTo(subpageH1,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              if (subpageFailsafe) clearTimeout(subpageFailsafe);
              gsap.set(subpageH1, { clearProps: 'all' });
            }
          }
        );
      }
    }

    // 6. SCROLL REVEAL FOR DUŻE H2 (data-motion="heading-reveal")
    // Zgodnie ze standardem: animacja całych bloków bez rozbijania na wiersze i litery
    if (typeof ScrollTrigger !== 'undefined') {
      const headingReveals = document.querySelectorAll('[data-motion="heading-reveal"]');
      headingReveals.forEach(h2 => {
        if (h2.dataset.motionDone) return;
        h2.dataset.motionDone = 'true';

        gsap.fromTo(h2,
          {
            y: MOTION_CONFIG.block.y,
            opacity: 0,
            force3D: true
          },
          {
            y: 0,
            opacity: 1,
            duration: MOTION_CONFIG.block.duration,
            ease: MOTION_CONFIG.block.ease,
            scrollTrigger: {
              trigger: h2,
              start: MOTION_CONFIG.block.start, // 'top 88%'
              once: true
            },
            onComplete: () => {
              gsap.set(h2, { clearProps: 'opacity,transform' });
            }
          }
        );
      });
    }

    // 7. WSKAZÓWKA PRZEWIŃ W DÓŁ (Hero Bottom: powtarzający się cykl co ~5s)
    const scrollIndicator = document.querySelector('.hero-bottom .center');
    if (scrollIndicator && !scrollIndicator.dataset.motionDone) {
      scrollIndicator.dataset.motionDone = 'true';
      const mouseIcon = scrollIndicator.querySelector('.mouse');
      const arrowIcon = scrollIndicator.querySelector('.arrowdown');
      if (mouseIcon && arrowIcon) {
        // Jeden cykl: 1.8s spokojnego ruchu (0.9s w dół o 4.5px, 0.9s powrót), następnie 3.2s bezruchu (łącznie 5s)
        const scrollTl = gsap.timeline({
          repeat: -1,
          repeatDelay: 3.2,
          delay: 1.8 // Startuje spokojnie po zakończeniu wejścia hero, bez kolizji
        });

        scrollTl.to([mouseIcon, arrowIcon], {
          y: 4.5,
          duration: 0.9,
          ease: 'sine.inOut'
        }).to([mouseIcon, arrowIcon], {
          y: 0,
          duration: 0.9,
          ease: 'sine.inOut'
        });

        // IntersectionObserver: zatrzymanie animacji, gdy wskaźnik znika z widoku (np. po przescrollowaniu)
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                if (scrollTl.paused()) scrollTl.resume();
              } else {
                if (!scrollTl.paused()) scrollTl.pause();
              }
            });
          }, { threshold: 0.1 });
          observer.observe(scrollIndicator);
        }

        // Visibilitychange: pauzowanie w tle, brak nadrabiania cykli
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            scrollTl.pause();
          } else {
            const rect = scrollIndicator.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            if (isInView) {
              scrollTl.resume();
            }
          }
        });
      }
    }

    // 8. POMARAŃCZOWE ETYKIETY SEKCJI (Wyłanianie z lewej w osi X)
    if (typeof ScrollTrigger !== 'undefined') {
      const kickers = document.querySelectorAll(
        '.home-section .home-kicker, .portfolio-head .section-kicker, .logo-cloud-kicker, .service-hero .home-kicker, .modernisation-callout .home-kicker, .project-heading .home-kicker, .brief-intro .home-kicker, .brief-intro-kicker'
      );
      kickers.forEach(kicker => {
        if (kicker.closest('.hero') || kicker.dataset.kickerDone) return;
        kicker.dataset.kickerDone = 'true';

        let inner = kicker.querySelector('.kicker-inner');
        if (!inner) {
          inner = document.createElement('span');
          inner.className = 'kicker-inner';
          inner.style.display = 'inline-block';
          inner.style.color = 'inherit';
          inner.style.willChange = 'clip-path, transform';
          while (kicker.firstChild) {
            inner.appendChild(kicker.firstChild);
          }
          kicker.appendChild(inner);
        }

        gsap.fromTo(inner,
          {
            clipPath: 'inset(0 100% 0 0)',
            x: MOTION_CONFIG.block.x,
            opacity: 0.7
          },
          {
            clipPath: 'inset(0 0% 0 0)',
            x: 0,
            opacity: 1,
            duration: MOTION_CONFIG.block.duration,
            ease: MOTION_CONFIG.block.ease,
            scrollTrigger: {
              trigger: kicker,
              start: MOTION_CONFIG.block.start,
              once: true
            },
            onComplete: () => {
              gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        );
      });
    }

    // 9. OPISY SEKCJI I PODPISY PORTFOLIO
    if (typeof ScrollTrigger !== 'undefined') {
      // 9a. Opis i link po prawej stronie nagłówka portfolio
      const portSummary = document.querySelector('.portfolio-summary');
      if (portSummary && !portSummary.dataset.motionDone) {
        portSummary.dataset.motionDone = 'true';
        const summaryItems = portSummary.querySelectorAll('.portfolio-intro, .all');
        if (summaryItems.length) {
          gsap.fromTo(summaryItems,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              stagger: 0.08,
              ease: MOTION_CONFIG.block.ease,
              scrollTrigger: {
                trigger: portSummary,
                start: MOTION_CONFIG.block.start,
                once: true
              },
              onComplete: () => {
                gsap.set(summaryItems, { clearProps: 'all' });
              }
            }
          );
        }
      }

      // 9b. Podpisy wszystkich realizacji (własny ScrollTrigger na .caption, wejście od dołu jako spójna grupa)
      const captions = document.querySelectorAll('.portfolio .stage .work .caption');
      captions.forEach(caption => {
        if (caption.dataset.motionDone) return;
        caption.dataset.motionDone = 'true';

        const captionItems = caption.querySelectorAll('.cat, .title, .project-description, .project-ext-action, .arr-link');

        gsap.fromTo(captionItems,
          { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
          {
            opacity: 1,
            y: 0,
            duration: MOTION_CONFIG.block.duration,
            stagger: 0.08,
            ease: MOTION_CONFIG.block.ease,
            scrollTrigger: {
              trigger: caption,
              start: MOTION_CONFIG.block.start,
              once: true
            },
            onComplete: () => {
              gsap.set(captionItems, { clearProps: 'all' });
            }
          }
        );
      });

      // 9c. Krótkie wprowadzenia i leady na podstronach
      const subpageIntros = document.querySelectorAll(
        '.service-hero-bottom .home-lead, .packages-intro .home-lead, .how-intro .home-lead, .testimonials-intro .home-lead'
      );
      subpageIntros.forEach(intro => {
        if (intro.dataset.motionDone) return;
        intro.dataset.motionDone = 'true';

        gsap.fromTo(intro,
          { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
          {
            opacity: 1,
            y: 0,
            duration: MOTION_CONFIG.block.duration,
            ease: MOTION_CONFIG.block.ease,
            scrollTrigger: {
              trigger: intro,
              start: MOTION_CONFIG.block.start,
              once: true
            },
            onComplete: () => {
              gsap.set(intro, { clearProps: 'all' });
            }
          }
        );
      });
    }

    // 10. KONTAKT: ANIMACJE TREŚCI PONIŻEJ HERO
    const contactSection = document.querySelector('.contact-section');
    if (contactSection && typeof ScrollTrigger !== 'undefined' && !contactSection.dataset.motionDone) {
      contactSection.dataset.motionDone = 'true';

      const contactDetails = contactSection.querySelector('.contact-details');
      const contactNext = contactSection.querySelector('.contact-next');
      const contactBrief = contactSection.querySelector('.contact-brief');
      const contactForm = contactSection.querySelector('#contact-form');

      // Bezpieczeństwo formularza: wejście fokusu natychmiast czyści style animacji i zapewnia pełną widoczność
      if (contactForm) {
        contactForm.addEventListener('focusin', () => {
          gsap.set(contactForm, { clearProps: 'opacity,transform' });
        }, { once: true });
      }

      // Animacja grupy lewej: bezpośrednie dane kontaktowe i dalsze kroki
      if (contactDetails) {
        const directContacts = contactDetails.querySelectorAll(':scope > h2, :scope > .contact-email, :scope > .contact-phone, :scope > p');
        const leftTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: contactDetails,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            gsap.set([directContacts, contactNext].filter(Boolean), { clearProps: 'all' });
          }
        });

        if (directContacts.length) {
          leftTimeline.fromTo(directContacts,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, stagger: MOTION_CONFIG.block.stagger, ease: MOTION_CONFIG.block.ease },
            0
          );
        }
        if (contactNext) {
          leftTimeline.fromTo(contactNext,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            MOTION_CONFIG.block.stagger
          );
        }
      }

      // Animacja grupy prawej: nagłówek briefu oraz cały formularz jako jeden blok
      if (contactBrief) {
        const briefHeader = contactBrief.querySelectorAll(':scope > h2, :scope > #mail-note');
        const rightTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: contactBrief,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            if (briefHeader.length) gsap.set(briefHeader, { clearProps: 'all' });
            if (contactForm) gsap.set(contactForm, { clearProps: 'opacity,transform' });
          }
        });

        if (briefHeader.length) {
          rightTimeline.fromTo(briefHeader,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, stagger: MOTION_CONFIG.block.stagger, ease: MOTION_CONFIG.block.ease },
            0
          );
        }
        if (contactForm) {
          rightTimeline.fromTo(contactForm,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            MOTION_CONFIG.block.stagger
          );
        }
      }
    }

    // 10b. UJEDNOLICONE AKSAMITNE ANIMACJE WEJŚCIA DLA CAŁEGO SERWISU
    // Zgodne ze standardem próbki: 38px desktop / 26px mobile, 1000ms, cubic-bezier(0.22, 0.61, 0.36, 1)
    if (typeof ScrollTrigger !== 'undefined') {
      const animGroup = (containerSel, itemSel, options = {}) => {
        try {
          const containers = document.querySelectorAll(containerSel);
          containers.forEach(container => {
            if (container.dataset.entranceDone) return;
            container.dataset.entranceDone = 'true';
            const items = container.querySelectorAll(itemSel);
            if (!items.length) return;

            const yDist = options.y ?? MOTION_CONFIG.block.y;
            const dur = options.duration ?? MOTION_CONFIG.block.duration;
            const stag = options.stagger ?? MOTION_CONFIG.block.stagger;
            const startPos = options.start ?? MOTION_CONFIG.block.start;
            const easeVal = options.ease ?? MOTION_CONFIG.block.ease;

            gsap.fromTo(items,
              { opacity: 0, y: yDist, force3D: true },
              {
                opacity: 1,
                y: 0,
                duration: dur,
                stagger: stag,
                ease: easeVal,
                scrollTrigger: {
                  trigger: container,
                  start: startPos,
                  once: true
                },
                onComplete: () => {
                  gsap.set(items, { clearProps: 'opacity,transform' });
                }
              }
            );
          });
        } catch (e) {
          console.warn('animGroup error:', e);
        }
      };

      const animSingle = (sel, options = {}) => {
        try {
          const elements = document.querySelectorAll(sel);
          elements.forEach(el => {
            if (el.dataset.entranceDone) return;
            el.dataset.entranceDone = 'true';

            const yDist = options.y ?? MOTION_CONFIG.block.y;
            const dur = options.duration ?? MOTION_CONFIG.block.duration;
            const startPos = options.start ?? MOTION_CONFIG.block.start;
            const easeVal = options.ease ?? MOTION_CONFIG.block.ease;

            gsap.fromTo(el,
              { opacity: 0, y: yDist, force3D: true },
              {
                opacity: 1,
                y: 0,
                duration: dur,
                ease: easeVal,
                scrollTrigger: {
                  trigger: el,
                  start: startPos,
                  once: true
                },
                onComplete: () => {
                  gsap.set(el, { clearProps: 'opacity,transform' });
                }
              }
            );
          });
        } catch (e) {
          console.warn('animSingle error:', e);
        }
      };

      // 1. HERO PODSTRON (.service-hero na Strony WWW, Branding, Modernizacja, Oferta, Kontakt, O mnie, Blog, EN)
      const serviceHeroes = document.querySelectorAll('.service-hero');
      serviceHeroes.forEach(hero => {
        if (hero.dataset.sampleHeroDone) return;
        hero.dataset.sampleHeroDone = 'true';

        const kicker = hero.querySelector('.home-kicker');
        const lead = hero.querySelector('.service-hero-bottom .home-lead') || hero.querySelector('.home-lead');
        const btn = hero.querySelector('.service-hero-bottom .btn') || hero.querySelector('.btn');
        const visual = hero.querySelector('.service-hero-visual');
        const visualImg = visual?.querySelector('img');

        if (lead) lead.dataset.motionDone = 'true';

        const heroTl = gsap.timeline({
          delay: 0.05,
          onComplete: () => {
            const toClean = [lead, btn, visual].filter(Boolean);
            gsap.set(toClean, { clearProps: 'opacity,transform' });
            if (kicker) {
              const inner = kicker.querySelector('.kicker-inner');
              if (inner) gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        });

        if (kicker) {
          animKickerLeft(kicker, heroTl, 0);
        }

        let contentPos = 0.15;
        if (lead) {
          heroTl.fromTo(lead,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            contentPos
          );
          contentPos += MOTION_CONFIG.block.stagger;
        }

        if (btn) {
          heroTl.fromTo(btn,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            contentPos
          );
        }

        if (visual) {
          heroTl.fromTo(visual,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0.2
          );
        }
      });

      // 2. KARTY WSPÓŁPRACY NA HOMEPAGE (.collab-cards .collab-card)
      animGroup('.collab-cards', '.collab-card');
      animSingle('.collab-meta-link');

      // 3. OPINIE KLIENTÓW NA HOMEPAGE (.testimonial-grid .testimonial-card)
      animGroup('.testimonial-grid', '.testimonial-card');

      // 4. KARTY USŁUG I ZAKRES (.service-features, .branding-scope)
      const serviceFeaturesSecs = document.querySelectorAll('.service-features, .branding-scope');
      serviceFeaturesSecs.forEach(sec => {
        if (sec.dataset.entranceDone) return;
        sec.dataset.entranceDone = 'true';

        const kicker = sec.querySelector('.home-kicker');
        const heading = sec.querySelector('h2');
        const features = Array.from(sec.querySelectorAll('.feature-grid .service-feature'));
        const callout = sec.querySelector('.feature-callout-link');
        const isInitiallyVisible = sec.getBoundingClientRect().top < (window.innerHeight * 0.88);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            const allElements = [heading, ...features, callout].filter(Boolean);
            gsap.set(allElements, { clearProps: 'opacity,transform' });
            if (kicker) {
              const inner = kicker.querySelector('.kicker-inner');
              if (inner) gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        });

        let timelinePos = 0;
        if (kicker) {
          animKickerLeft(kicker, tl, timelinePos);
          timelinePos += MOTION_CONFIG.block.stagger;
        }

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            timelinePos
          );
          timelinePos += MOTION_CONFIG.block.stagger;
        }

        if (features.length) {
          tl.fromTo(features,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              stagger: MOTION_CONFIG.block.stagger,
              ease: MOTION_CONFIG.block.ease
            },
            timelinePos
          );
          timelinePos += (features.length - 1) * MOTION_CONFIG.block.stagger + MOTION_CONFIG.block.stagger;
        }

        if (callout) {
          tl.fromTo(callout,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            timelinePos
          );
        }

        if (isInitiallyVisible) {
          tl.play();
        }
      });

      // 5. POZIOMY PANEL MODERNIZACJI I CALLOUTY MOTION
      const modPanels = document.querySelectorAll('.modernizacja-panel, .branding-motion-callout');
      modPanels.forEach(modPanel => {
        if (modPanel.dataset.entranceDone) return;
        modPanel.dataset.entranceDone = 'true';

        const content = modPanel.querySelector('.modernizacja-panel-content') || modPanel.querySelector(':scope > div:first-child');
        const action = modPanel.querySelector('.modernizacja-panel-action') || modPanel.querySelector('.btn') || modPanel.querySelector('a');
        const isInitiallyVisible = modPanel.getBoundingClientRect().top < (window.innerHeight * 0.88);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: modPanel,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            gsap.set([content, action].filter(Boolean), { clearProps: 'opacity,transform' });
          }
        });

        if (content) {
          tl.fromTo(content,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0
          );
        }
        if (action) {
          tl.fromTo(action,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            MOTION_CONFIG.block.stagger
          );
        }

        if (isInitiallyVisible) {
          tl.play();
        }
      });

      // 6. PROCES WSPÓŁPRACY (.process-section na wszystkich stronach)
      const procSecs = document.querySelectorAll('.process-section');
      procSecs.forEach(procSec => {
        if (procSec.dataset.entranceDone) return;
        procSec.dataset.entranceDone = 'true';

        const kicker = procSec.querySelector('.home-kicker');
        const heading = procSec.querySelector('h2');
        const lead = procSec.querySelector('.process-intro .home-lead');
        const inputItem = procSec.querySelector('.process-input');
        const steps = Array.from(procSec.querySelectorAll('.process-steps li'));
        const ownership = procSec.querySelector('.process-ownership');

        const introContainer = procSec.querySelector('.process-intro') || procSec;
        const introTl = gsap.timeline({
          scrollTrigger: {
            trigger: introContainer,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            const toClean = [heading, lead, inputItem].filter(Boolean);
            gsap.set(toClean, { clearProps: 'opacity,transform' });
            if (kicker) {
              const inner = kicker.querySelector('.kicker-inner');
              if (inner) gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        });

        let introPos = 0;
        if (kicker) {
          animKickerLeft(kicker, introTl, introPos);
          introPos += MOTION_CONFIG.block.stagger;
        }

        if (heading) {
          introTl.fromTo(heading,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            introPos
          );
          introPos += MOTION_CONFIG.block.stagger;
        }

        if (lead) {
          introTl.fromTo(lead,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            introPos
          );
          introPos += MOTION_CONFIG.block.stagger;
        }

        if (inputItem) {
          introTl.fromTo(inputItem,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            introPos
          );
        }

        if (introContainer.getBoundingClientRect().top < (window.innerHeight * 0.88)) {
          introTl.play();
        }

        // Kroki procesu: osobny trigger
        const stepsContainer = procSec.querySelector('.process-steps');
        if (stepsContainer && steps.length) {
          const stepsTl = gsap.timeline({
            scrollTrigger: {
              trigger: stepsContainer,
              start: MOTION_CONFIG.block.start,
              once: true
            },
            onComplete: () => {
              gsap.set(steps, { clearProps: 'opacity,transform' });
            }
          });

          stepsTl.fromTo(steps,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              stagger: MOTION_CONFIG.block.stagger,
              ease: MOTION_CONFIG.block.ease
            },
            0
          );

          if (stepsContainer.getBoundingClientRect().top < (window.innerHeight * 0.88)) {
            stepsTl.play();
          }
        }

        if (ownership) {
          const ownTl = gsap.timeline({
            scrollTrigger: {
              trigger: ownership,
              start: MOTION_CONFIG.block.start,
              once: true
            },
            onComplete: () => {
              gsap.set(ownership, { clearProps: 'opacity,transform' });
            }
          });

          ownTl.fromTo(ownership,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0
          );

          if (ownership.getBoundingClientRect().top < (window.innerHeight * 0.88)) {
            ownTl.play();
          }
        }
      });

      // 7. PAKIETY OFERTOWE (.packages-section na wszystkich stronach)
      const packagesSecs = document.querySelectorAll('.packages-section');
      packagesSecs.forEach(sec => {
        if (sec.dataset.entranceDone) return;
        sec.dataset.entranceDone = 'true';

        const kicker = sec.querySelector('.home-kicker');
        const heading = sec.querySelector('h2');
        const lead = sec.querySelector('.packages-intro .home-lead') || sec.querySelector('.home-lead');
        const cards = Array.from(sec.querySelectorAll('.package-grid .package-card'));
        const linksRow = sec.querySelector('.package-links-row');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            const toClean = [heading, lead, ...cards, linksRow].filter(Boolean);
            gsap.set(toClean, { clearProps: 'opacity,transform' });
            if (kicker) {
              const inner = kicker.querySelector('.kicker-inner');
              if (inner) gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        });

        let pos = 0;
        if (kicker) {
          animKickerLeft(kicker, tl, pos);
          pos += MOTION_CONFIG.block.stagger;
        }

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }

        if (lead) {
          tl.fromTo(lead,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }

        if (cards.length) {
          tl.fromTo(cards,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              stagger: MOTION_CONFIG.block.stagger,
              ease: MOTION_CONFIG.block.ease
            },
            pos
          );
          pos += (cards.length - 1) * MOTION_CONFIG.block.stagger + MOTION_CONFIG.block.stagger;
        }

        if (linksRow) {
          tl.fromTo(linksRow,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
        }
      });

      // 7b. CALLOUT BRIEFU W PAKIECIE (.packages-brief-callout na /strony-www/, /branding/ i EN)
      const briefCallouts = document.querySelectorAll('.packages-brief-callout');
      briefCallouts.forEach(callout => {
        if (callout.dataset.entranceDone) return;
        callout.dataset.entranceDone = 'true';

        gsap.fromTo(callout,
          { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
          {
            opacity: 1,
            y: 0,
            duration: MOTION_CONFIG.block.duration,
            ease: MOTION_CONFIG.block.ease,
            scrollTrigger: {
              trigger: callout,
              start: MOTION_CONFIG.block.start, // 'top 88%'
              once: true
            },
            onComplete: () => {
              gsap.set(callout, { clearProps: 'opacity,transform' });
            }
          }
        );
      });

      // 8. FAQ (#faq .faq-grid)
      const faqSec = document.querySelector('#faq .faq-grid');
      if (faqSec && !faqSec.dataset.entranceDone) {
        faqSec.dataset.entranceDone = 'true';
        const heading = faqSec.querySelector('h2');
        const faqItems = faqSec.querySelectorAll('.faq-list details');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: faqSec,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (faqItems.length) gsap.set(faqItems, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0
          );
        }

        if (faqItems.length) {
          tl.fromTo(faqItems,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, stagger: 0.08, ease: MOTION_CONFIG.block.ease },
            heading ? 0.1 : 0
          );
        }
      }

      // 9. DWUKOLUMNOWE SEKCJE COMPACT-GRID (Case Studies, O mnie, Modernizacja)
      const compactGrids = document.querySelectorAll('.project-detail .compact-grid, .modernisation-callout, section[aria-labelledby="case-drewmar-title"] .compact-grid');
      compactGrids.forEach(grid => {
        if (grid.dataset.entranceDone) return;
        grid.dataset.entranceDone = 'true';

        const heading = grid.querySelector('h2');
        const contentItems = grid.querySelectorAll('.bio-copy > *, .scope-list > li, .testimonial-card, .home-lead, :scope > div:last-child > p, .callout-grid p');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (contentItems.length) gsap.set(contentItems, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0
          );
        }

        if (contentItems.length) {
          tl.fromTo(contentItems,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, stagger: 0.08, ease: MOTION_CONFIG.block.ease },
            heading ? 0.1 : 0
          );
        }
      });

      // 10. DOWODY, RELACJE I POZOSTAŁE KAFELKI
      animGroup('.proof-grid', '.proof-item');
      animSingle('.relationship-story');
      animSingle('.branding-portfolio-link-wrap');
      animGroup('.branding-hero-composition', '.branding-visual-item');
      animSingle('.about-portrait');

      // 11. LISTING PORTFOLIO: OKŁADKI REALIZACJI
      const portfolioWorks = document.querySelectorAll('.portfolio .stage .work');
      portfolioWorks.forEach(work => {
        if (work.dataset.entranceDone) return;
        work.dataset.entranceDone = 'true';
        const media = work.querySelector('.media-link');
        if (media) {
          gsap.fromTo(media,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              ease: MOTION_CONFIG.block.ease,
              scrollTrigger: {
                trigger: media,
                start: MOTION_CONFIG.block.start,
                once: true
              },
              onComplete: () => {
                gsap.set(media, { clearProps: 'opacity,transform' });
              }
            }
          );
        }
      });

      // 12. PODSTRONY CASE STUDY PORTFOLIO (/portfolio/[slug]/)
      const projectHeading = document.querySelector('.project-heading');
      if (projectHeading && !projectHeading.dataset.entranceDone) {
        projectHeading.dataset.entranceDone = 'true';
        const kicker = projectHeading.querySelector('.home-kicker');
        const h1 = projectHeading.querySelector('h1');
        const lead = projectHeading.querySelector('.home-lead');
        const breadcrumbs = projectHeading.querySelector('.breadcrumbs');

        const tl = gsap.timeline({
          delay: 0.05,
          onComplete: () => {
            gsap.set([breadcrumbs, h1, lead].filter(Boolean), { clearProps: 'opacity,transform' });
            if (kicker) {
              const inner = kicker.querySelector('.kicker-inner');
              if (inner) gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        });

        if (breadcrumbs) {
          tl.fromTo(breadcrumbs,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0
          );
        }
        if (kicker) {
          animKickerLeft(kicker, tl, 0.08);
        }
        if (h1) {
          tl.fromTo(h1,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0.15
          );
        }
        if (lead) {
          tl.fromTo(lead,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0.22
          );
        }
      }

      animSingle('.project-cover');
      animGroup('.project-gallery', 'figure');
      animSingle('.project-film-media figure');
      animGroup('.project-next', 'a', { stagger: 0.08 });

      // 13. O MNIE (/o-mnie/): SPOSÓB PRACY I ZASADY WSPÓŁPRACY
      const howSec = document.querySelector('#jak-pracuje');
      if (howSec && !howSec.dataset.entranceDone) {
        howSec.dataset.entranceDone = 'true';
        const kicker = howSec.querySelector('.home-kicker');
        const heading = howSec.querySelector('.how-intro h2');
        const lead = howSec.querySelector('.how-intro .home-lead');
        const steps = Array.from(howSec.querySelectorAll('.how-steps-grid .how-step'));

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: howSec,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            gsap.set([heading, lead, ...steps].filter(Boolean), { clearProps: 'opacity,transform' });
            if (kicker) {
              const inner = kicker.querySelector('.kicker-inner');
              if (inner) gsap.set(inner, { clearProps: 'clipPath,transform,opacity' });
            }
          }
        });

        let pos = 0;
        if (kicker) {
          animKickerLeft(kicker, tl, pos);
          pos += MOTION_CONFIG.block.stagger;
        }
        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }
        if (lead) {
          tl.fromTo(lead,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }
        if (steps.length) {
          tl.fromTo(steps,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              stagger: MOTION_CONFIG.block.stagger,
              ease: MOTION_CONFIG.block.ease
            },
            pos
          );
        }
      }

      const rulesSec = document.querySelector('.rules-block');
      if (rulesSec && !rulesSec.dataset.entranceDone) {
        rulesSec.dataset.entranceDone = 'true';
        const title = rulesSec.querySelector('.rules-block-title');
        const rules = Array.from(rulesSec.querySelectorAll('.rules-columns .rule-item'));
        const note = rulesSec.querySelector('.rules-note');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rulesSec,
            start: MOTION_CONFIG.block.start,
            once: true
          },
          onComplete: () => {
            gsap.set([title, ...rules, note].filter(Boolean), { clearProps: 'opacity,transform' });
          }
        });

        if (title) {
          tl.fromTo(title,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            0
          );
        }
        if (rules.length) {
          tl.fromTo(rules,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              stagger: MOTION_CONFIG.block.stagger,
              ease: MOTION_CONFIG.block.ease
            },
            title ? 0.12 : 0
          );
        }
        if (note) {
          tl.fromTo(note,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            '+=0.05'
          );
        }
      }

      // 14. BLOG (/blog/ oraz /blog/[slug]/)
      animSingle('.blog-featured-card');
      animGroup('.blog-list-grid', '.blog-card');
      animSingle('.post-cover-wrap');

      const singlePostContent = document.querySelector('.post-layout-wrap .post-content');
      if (singlePostContent && !singlePostContent.dataset.entranceDone) {
        singlePostContent.dataset.entranceDone = 'true';
        const postBlocks = singlePostContent.querySelectorAll(':scope > p, :scope > h2, :scope > ul, :scope > ol, :scope > blockquote, :scope > figure');
        postBlocks.forEach(block => {
          gsap.fromTo(block,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: MOTION_CONFIG.block.duration,
              ease: MOTION_CONFIG.block.ease,
              scrollTrigger: {
                trigger: block,
                start: MOTION_CONFIG.block.start,
                once: true
              },
              onComplete: () => {
                gsap.set(block, { clearProps: 'opacity,transform' });
              }
            }
          );
        });
      }

      // 15. FORMULARZE I KARTY BRIEFU (.brief-intro-block, .brief-stepper, .brief-card-box)
      const briefIntroBlock = document.querySelector('.brief-intro-block, .brief-intro');
      if (briefIntroBlock && !briefIntroBlock.dataset.entranceDone) {
        briefIntroBlock.dataset.entranceDone = 'true';
        const title = briefIntroBlock.querySelector('.brief-intro-title');
        const lead = briefIntroBlock.querySelector('.brief-intro-lead, .brief-intro-desc');
        const stepper = document.querySelector('.brief-stepper');
        const cardBox = document.querySelector('.brief-card-box');

        const tl = gsap.timeline({
          delay: 0.1,
          onComplete: () => {
            gsap.set([title, lead, stepper, cardBox].filter(Boolean), { clearProps: 'opacity,transform' });
          }
        });

        let pos = 0;
        if (title) {
          tl.fromTo(title,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }

        if (lead) {
          tl.fromTo(lead,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }

        if (stepper) {
          tl.fromTo(stepper,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
          pos += MOTION_CONFIG.block.stagger;
        }

        if (cardBox) {
          tl.fromTo(cardBox,
            { opacity: 0, y: MOTION_CONFIG.block.y, force3D: true },
            { opacity: 1, y: 0, duration: MOTION_CONFIG.block.duration, ease: MOTION_CONFIG.block.ease },
            pos
          );
        }
      }
    }

    // 11. FUTURE THREE HOVER EFFECT (homepage i podstrony)
    const initFutureThree = () => {

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const applyToElement = (el, isOrange = false, isCta = false) => {
        if (!el) return;

        // Wykluczenia kontrolek technicznych
        if (
          el.classList.contains('footer-cookies-btn') ||
          el.classList.contains('motion-toggle') ||
          el.classList.contains('menu-toggle') ||
          el.classList.contains('back-to-top') ||
          el.classList.contains('home-logo')
        ) {
          return;
        }

        // Pobierz czysty tekst i strzałkę z elementu
        let arrow = el.getAttribute('data-f3-arrow') || null;
        let arrowPosition = el.getAttribute('data-f3-arrow-pos') || 'right';
        let rawText = el.getAttribute('data-f3-raw');

        if (!rawText) {
          const flipFront = el.querySelector('.nav-flip-front');
          if (flipFront) {
            rawText = flipFront.textContent.replace(/\s+/g, ' ').trim();
          } else {
            // Wykryj strzałkę na początku lub końcu (w tekście głównym lub w spanach aria-hidden)
            const fullText = (el.textContent || '').replace(/\s+/g, ' ').trim();
            const leftArrowMatch = fullText.match(/^([←\u2190])\s*/);
            const rightArrowMatch = fullText.match(/\s*([→↗\u2192\u2197\u21B3])$/);

            if (leftArrowMatch) {
              arrow = leftArrowMatch[1];
              arrowPosition = 'left';
            } else if (rightArrowMatch) {
              arrow = rightArrowMatch[1];
              arrowPosition = 'right';
            } else if (isCta) {
              arrow = '→';
              arrowPosition = 'right';
            }

            // Pobierz tekst bez zbędnych grafik SVG i kontenerów cta-arrow
            const clone = el.cloneNode(true);
            clone.querySelectorAll('svg, .cta-arrow-box, .cta-arrow').forEach(n => n.remove());
            rawText = (clone.textContent || '').replace(/\s+/g, ' ').trim();
            if (arrow && arrowPosition === 'left' && rawText.startsWith(arrow)) {
              rawText = rawText.slice(arrow.length).trim();
            } else if (arrow && arrowPosition === 'right' && rawText.endsWith(arrow)) {
              rawText = rawText.slice(0, -arrow.length).trim();
            }
          }
          if (!rawText) return;
          el.setAttribute('data-f3-raw', rawText);
          if (arrow) {
            el.setAttribute('data-f3-arrow', arrow);
            el.setAttribute('data-f3-arrow-pos', arrowPosition);
          }
        } else if (!arrow && isCta) {
          arrow = '→';
          arrowPosition = 'right';
        }

        const textOnly = rawText;

        // Zapewnienie dostępności: czytnik otrzymuje jeden czysty pełny napis
        el.setAttribute('aria-label', arrowPosition === 'left' ? `${arrow || ''} ${textOnly}`.trim() : `${textOnly} ${arrow || ''}`.trim());

        // Usuń poprzednią zawartość f3 jeśli istniała (np. przy przełączaniu języka lub kroku briefu)
        const oldClip = el.querySelector('.f3-clip');
        if (oldClip) oldClip.remove();

        const words = textOnly.split(' ');
        let charIndex = 0;

        const clip = document.createElement('span');
        clip.className = 'f3-clip';
        clip.setAttribute('aria-hidden', 'true');

        if (arrow && arrowPosition === 'left') {
          const arrowSpan = document.createElement('span');
          arrowSpan.className = 'f3-arrow f3-arrow--left';
          arrowSpan.style.setProperty('--char', charIndex);
          arrowSpan.textContent = arrow;
          clip.appendChild(arrowSpan);
          charIndex++;

          const space = document.createElement('span');
          space.className = 'f3-space';
          space.innerHTML = '&nbsp;';
          clip.appendChild(space);
        }

        words.forEach((word, wIdx) => {
          if (wIdx > 0) {
            const space = document.createElement('span');
            space.className = 'f3-space';
            space.innerHTML = '&nbsp;';
            clip.appendChild(space);
          }

          const wordSpan = document.createElement('span');
          wordSpan.className = 'f3-word';

          const letters = Array.from(word);
          letters.forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.className = 'f3-char';
            charSpan.style.setProperty('--char', charIndex);
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
            charIndex++;
          });

          clip.appendChild(wordSpan);
        });

        if (arrow && arrowPosition === 'right') {
          const arrowSpan = document.createElement('span');
          arrowSpan.className = 'f3-arrow';
          arrowSpan.style.setProperty('--char', charIndex);
          arrowSpan.textContent = arrow;
          clip.appendChild(arrowSpan);
        }

        el.classList.add('f3-link');
        if (isOrange) el.classList.add('f3-link--orange');

        // Ukryj pierwotne dzieci wizualne (np. .nav-flip, stary span, .cta-arrow-box)
        Array.from(el.children).forEach(child => {
          if (child !== clip) {
            child.style.display = 'none';
          }
        });

        // Wyczyść tekst bezpośredni w węzłach tekstowych
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = '';
          }
        });

        el.appendChild(clip);
        el.dataset.f3Ready = 'true';
      };

      window.__applyFutureThreeToElement = applyToElement;

      const isHomePage = document.body.classList.contains('home-page');

      // 1. UNIVERSAL: menu i stopka – wszystkie strony
      document.querySelectorAll('#main-nav a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.language-switch a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.footer-nav a, .footer-contact a, .social-links a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.tools .quote').forEach(el => applyToElement(el, false, true));

      // 2. PRZYCISKI CTA (ciemne przyciski, briefy i formularz kontaktowy)
      document.querySelectorAll('.hero .actions .btn.dark, .service-hero .btn.dark, .final-cta .cta-button, .contact-brief .cta-button, button.cta-button, .project-film-section .cta-button, .packages-brief-callout-btn, .btn-primary, .btn-secondary').forEach(el => applyToElement(el, false, true));

      // 3. POMARAŃCZOWY PANEL MODERNIZACJI (podstrona strony-www i modernizacja)
      document.querySelectorAll('.modernizacja-panel .btn').forEach(el => applyToElement(el, false, true));

      // 4. PAKIETY (strony-www, branding)
      document.querySelectorAll('.package-link').forEach(el => applyToElement(el, false, false));

      // 5. LINKI PORTFOLIO ZEWNĘTRZNE (homepage, podstrona /portfolio/ oraz case studies)
      document.querySelectorAll('.project-ext-action a, .project-ext-link').forEach(el => applyToElement(el, true, false));

      // 6. LINKI WSPÓŁPRACY, PROCESU, PORTFOLIO WSZYSTKIE
      document.querySelectorAll('.portfolio-summary .all, .portfolio .all').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.collab-card-action').forEach(el => applyToElement(el, true, false));
      document.querySelectorAll('.collab-meta-link a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.process-ownership a').forEach(el => applyToElement(el, false, false));

      // 7. LINKI TEKSTOWE .text-link (branding, o-mnie, case studies, blog)
      document.querySelectorAll('.text-link').forEach(el => applyToElement(el, false, false));

      // 8. BLOG: "Czytaj artykuł"
      document.querySelectorAll('.blog-featured-link').forEach(el => applyToElement(el, true, false));
      document.querySelectorAll('.blog-card-link').forEach(el => applyToElement(el, false, false));
    };

    window.__reinitFutureThreeHover = initFutureThree;
    initFutureThree();

    // Odświeżenie pozycji przy powrocie z pamięci podręcznej przeglądarki (bfcache)
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.documentElement.classList.add('hero-motion-done');
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
