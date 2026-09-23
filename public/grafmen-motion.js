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
    // Działa spójnie na homepage i podstronach dla wszystkich nagłówków z data-motion="heading-reveal"
    if (typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined') {
      const headingReveals = document.querySelectorAll('[data-motion="heading-reveal"]');
      const isDesktopMotion = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !Boolean(navigator.connection?.saveData);

      headingReveals.forEach(h2 => {
        if (h2.dataset.motionDone) return;
        h2.dataset.motionDone = 'true';

        // Podział nagłówka na linie
        const split = new SplitText(h2, { type: 'lines', linesClass: 'gf-line-inner' });
        if (!split.lines || !split.lines.length) return;

        // Czytelne, spokojne odsłanianie wierszy:
        // - wejście od dołu o około 24 px
        // - opacity 0 -> 1
        // - delikatne rozmycie do 3 px -> 0 na desktopie (na mobile brak rozmycia)
        // - czas około 0,8 sekundy
        // - odstęp między wierszami około 0,08 sekundy
        // - płynne wyhamowanie (power2.out)
        // - start, gdy góra nagłówka dochodzi do około 80% wysokości okna
        gsap.fromTo(split.lines,
          {
            y: 24,
            opacity: 0,
            filter: isDesktopMotion ? 'blur(3px)' : 'none'
          },
          {
            y: 0,
            opacity: 1,
            filter: isDesktopMotion ? 'blur(0px)' : 'none',
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

    // 7. WSKAZÓWKA PRZEWIŃ W DÓŁ (Hero Bottom: subtelny ruch pionowy myszy i strzałki)
    const scrollIndicator = document.querySelector('.hero-bottom .center');
    if (scrollIndicator && !scrollIndicator.dataset.motionDone) {
      scrollIndicator.dataset.motionDone = 'true';
      const mouseIcon = scrollIndicator.querySelector('.mouse');
      const arrowIcon = scrollIndicator.querySelector('.arrowdown');
      if (mouseIcon && arrowIcon) {
        const scrollTween = gsap.to([mouseIcon, arrowIcon], {
          y: 3.5,
          duration: 0.9,
          repeat: 3, // 4 przejścia = 2 spokojne cykle (góra-dół-góra x2), ~3.6s
          yoyo: true,
          ease: 'sine.inOut',
          onComplete: () => {
            gsap.set([mouseIcon, arrowIcon], { clearProps: 'y' });
          }
        });

        const stopScrollTween = () => {
          if (scrollTween && scrollTween.isActive()) {
            scrollTween.kill();
            gsap.set([mouseIcon, arrowIcon], { clearProps: 'y' });
          }
        };
        window.addEventListener('scroll', stopScrollTween, { once: true, passive: true });
      }
    }

    // 8. POMARAŃCZOWE ETYKIETY SEKCJI (Odsłanianie maską na szerokości tekstu + przesunięcie z lewej)
    if (typeof ScrollTrigger !== 'undefined') {
      const kickers = document.querySelectorAll(
        '.home-section .home-kicker, .portfolio-head .section-kicker, .logo-cloud-kicker, .service-hero .home-kicker, .modernisation-callout .home-kicker'
      );
      kickers.forEach(kicker => {
        if (kicker.closest('.hero') || kicker.dataset.kickerDone) return;
        kicker.dataset.kickerDone = 'true';

        // Ograniczenie maskowania ściśle do szerokości tekstu (inline-block), by nie animować pustej przestrzeni
        let inner = kicker.querySelector('.kicker-inner');
        if (!inner) {
          inner = document.createElement('span');
          inner.className = 'kicker-inner';
          inner.style.display = 'inline-block';
          inner.style.willChange = 'clip-path, transform';
          while (kicker.firstChild) {
            inner.appendChild(kicker.firstChild);
          }
          kicker.appendChild(inner);
        }

        gsap.fromTo(inner,
          {
            clipPath: 'inset(0 100% 0 0)',
            x: -18,
            opacity: 0.7
          },
          {
            clipPath: 'inset(0 0% 0 0)',
            x: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: kicker,
              start: 'top 82%',
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
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: portSummary,
                start: 'top 82%',
                once: true
              },
              onComplete: () => {
                gsap.set(summaryItems, { clearProps: 'all' });
              }
            }
          );
        }
      }

      // 9b. Podpisy wszystkich realizacji (własny ScrollTrigger na .caption, mask reveal tytułu)
      const captions = document.querySelectorAll('.portfolio .stage .work .caption');
      captions.forEach(caption => {
        if (caption.dataset.motionDone) return;
        caption.dataset.motionDone = 'true';

        const cat = caption.querySelector('.cat');
        const title = caption.querySelector('.title');
        const desc = caption.querySelector('.project-description');
        const actions = caption.querySelectorAll('.project-ext-action, .arr-link');

        // Maska overflow-hidden na tytule do odsłaniania wierszami od dołu
        let titleInner = null;
        if (title) {
          title.style.overflow = 'hidden';
          title.style.display = 'block';
          let inner = title.querySelector('.title-inner');
          if (!inner) {
            inner = document.createElement('span');
            inner.className = 'title-inner';
            inner.style.display = 'inline-block';
            inner.style.willChange = 'transform, opacity';
            while (title.firstChild) {
              inner.appendChild(title.firstChild);
            }
            title.appendChild(inner);
          }
          titleInner = inner;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: caption,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (cat) gsap.set(cat, { clearProps: 'all' });
            if (title) {
              gsap.set(title, { clearProps: 'overflow,display' });
              if (titleInner) gsap.set(titleInner, { clearProps: 'all' });
            }
            if (desc) gsap.set(desc, { clearProps: 'all' });
            if (actions.length) gsap.set(actions, { clearProps: 'all' });
          }
        });

        if (cat) {
          tl.fromTo(cat,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
            0
          );
        }

        if (titleInner) {
          tl.fromTo(titleInner,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
            0.05
          );
        }

        if (desc) {
          tl.fromTo(desc,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
            0.12
          );
        }

        if (actions.length) {
          tl.fromTo(actions,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power2.out' },
            0.18
          );
        }
      });

      // 9c. Krótkie wprowadzenia i leady na pozostałych podstronach
      const subpageIntros = document.querySelectorAll(
        '.service-hero-bottom .home-lead, .packages-intro .home-lead, .how-intro .home-lead, .testimonials-intro .home-lead'
      );
      subpageIntros.forEach(intro => {
        if (intro.dataset.motionDone) return;
        intro.dataset.motionDone = 'true';

        gsap.fromTo(intro,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: intro,
              start: 'top 85%',
              once: true
            },
            onComplete: () => {
              gsap.set(intro, { clearProps: 'all' });
            }
          }
        );
      });
    }

    // Odświeżenie pozycji przy powrocie z pamięci podręcznej przeglądarki (bfcache)
    window.addEventListener('pageshow', (e) => {
      if (e.persisted && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
