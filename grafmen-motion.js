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

        const eyebrowInner = hero.querySelector('.eyebrow .hero-mask-inner') || hero.querySelector('.eyebrow');
        const metaTop = hero.querySelector('.meta01-top');
        const metaInners = hero.querySelectorAll('.meta01-inner');
        const miniInners = hero.querySelectorAll('.hero-bottom .mini .hero-mask-inner');
        const centerIndicator = hero.querySelector('.hero-bottom .center');
        const leadText = hero.querySelector('.lead');
        const actionBtn = hero.querySelector('.actions a');

        if (!heroLines.length || !lineInners.length) return;

        // Failsafe watchdog: guarantees full text visibility after 2.2s even under heavy tab throttling or errors
        failsafeTimer = setTimeout(() => {
          gsap.set(heroH1.querySelectorAll('.hero-line-inner'), { clearProps: 'all', opacity: 1 });
          gsap.set(heroH1.querySelectorAll('.hero-wipe-brand, .hero-wipe-fg'), { clearProps: 'all', scaleX: 0 });
          gsap.set([eyebrowInner, leadText, actionBtn, centerIndicator], { clearProps: 'all', opacity: 1, y: 0 });
          if (metaTop) gsap.set(metaTop, { clearProps: 'all', scaleX: 1 });
          if (metaInners.length) gsap.set(metaInners, { clearProps: 'all', opacity: 1, y: 0 });
          if (miniInners.length) gsap.set(miniInners, { clearProps: 'all', opacity: 1, y: 0 });
        }, 2200);

        gsap.set(lineInners, { opacity: 0 });
        gsap.set([brandRects, fgRects], { scaleX: 0, transformOrigin: 'left' });
        if (eyebrowInner) gsap.set(eyebrowInner, { y: 14, opacity: 0 });
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
            gsap.set([lineInners, brandRects, fgRects], { clearProps: 'all' });
            gsap.set([eyebrowInner, leadText, actionBtn, metaTop, centerIndicator], { clearProps: 'all' });
            if (metaInners.length) gsap.set(metaInners, { clearProps: 'all' });
            if (miniInners.length) gsap.set(miniInners, { clearProps: 'all' });
          }
        });

        // 1. Eyebrow odsłania się płynnie od dołu w masce
        if (eyebrowInner) {
          tl.to(eyebrowInner, {
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
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            gsap.set([directContacts, contactNext], { clearProps: 'all' });
          }
        });

        if (directContacts.length) {
          leftTimeline.fromTo(directContacts,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out' },
            0
          );
        }
        if (contactNext) {
          leftTimeline.fromTo(contactNext,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
            0.15
          );
        }
      }

      // Animacja grupy prawej: nagłówek briefu oraz cały formularz jako jeden blok
      if (contactBrief) {
        const briefHeader = contactBrief.querySelectorAll(':scope > h2, :scope > #mail-note');
        const rightTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: contactBrief,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (briefHeader.length) gsap.set(briefHeader, { clearProps: 'all' });
            if (contactForm) gsap.set(contactForm, { clearProps: 'opacity,transform' });
          }
        });

        if (briefHeader.length) {
          rightTimeline.fromTo(briefHeader,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
            0
          );
        }
        if (contactForm) {
          rightTimeline.fromTo(contactForm,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
            0.15
          );
        }
      }
    }

    // 10b. UJEDNOLICONE AKSAMITNE ANIMACJE WEJŚCIA DLA BLOKÓW NA PODSTRONACH
    if (typeof ScrollTrigger !== 'undefined') {
      const animGroup = (containerSel, itemSel, options = {}) => {
        try {
          const containers = document.querySelectorAll(containerSel);
          containers.forEach(container => {
            if (container.dataset.entranceDone) return;
            container.dataset.entranceDone = 'true';
            const items = container.querySelectorAll(itemSel);
            if (!items.length) return;

            const yDist = options.y ?? 18;
            const dur = options.duration ?? 0.95;
            const stag = options.stagger ?? 0.12;
            const startPos = options.start ?? 'top 82%';

            gsap.fromTo(items,
              { opacity: 0, y: yDist, force3D: true },
              {
                opacity: 1,
                y: 0,
                duration: dur,
                stagger: stag,
                ease: 'power3.out',
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

            const yDist = options.y ?? 18;
            const dur = options.duration ?? 0.85;
            const startPos = options.start ?? 'top 82%';

            gsap.fromTo(el,
              { opacity: 0, y: yDist, force3D: true },
              {
                opacity: 1,
                y: 0,
                duration: dur,
                ease: 'power3.out',
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

      // 1. Hero visuals na podstronach
      animSingle('.service-hero-visual', { y: 20, duration: 0.9, start: 'top 85%' });
      animGroup('.branding-hero-composition', '.branding-visual-item', { y: 20, duration: 0.9, stagger: 0.12, start: 'top 85%' });
      animSingle('.about-portrait', { y: 20, duration: 0.9, start: 'top 85%' });
      animSingle('.project-cover', { y: 20, duration: 0.9, start: 'top 85%' });
      animSingle('.post-cover-wrap', { y: 20, duration: 0.9, start: 'top 85%' });

      // 2. Karty usług i nagłówki (.service-features na Stronach WWW oraz .branding-scope na Branding)
      const serviceFeaturesSecs = document.querySelectorAll('.service-features, .branding-scope');
      serviceFeaturesSecs.forEach(sec => {
        if (sec.dataset.entranceDone) return;
        sec.dataset.entranceDone = 'true';
        const heading = sec.querySelector('h2');
        const features = sec.querySelectorAll('.feature-grid .service-feature');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (features.length) gsap.set(features, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (features.length) {
          tl.fromTo(features,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out' },
            heading ? 0.12 : 0
          );
        }
      });

      // 3. Poziomy panel modernizacji (Strony WWW) i Motion/wideo (Branding)
      animSingle('.modernizacja-panel', { y: 20, duration: 0.9, start: 'top 82%' });
      animSingle('.branding-motion-callout', { y: 20, duration: 0.9, start: 'top 82%' });

      // 4. Proces współpracy (.process-section na Stronach WWW)
      const processSecs = document.querySelectorAll('.process-section');
      processSecs.forEach(sec => {
        if (sec.dataset.entranceDone) return;
        sec.dataset.entranceDone = 'true';
        const heading = sec.querySelector('h2');
        const introItems = sec.querySelectorAll('.process-intro .home-lead, .process-input');
        const steps = sec.querySelectorAll('.process-steps li');
        const ownership = sec.querySelector('.process-ownership');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (introItems.length) gsap.set(introItems, { clearProps: 'opacity,transform' });
            if (steps.length) gsap.set(steps, { clearProps: 'opacity,transform' });
            if (ownership) gsap.set(ownership, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (introItems.length) {
          tl.fromTo(introItems,
            { opacity: 0, y: 16, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out' },
            0.08
          );
        }

        if (steps.length) {
          tl.fromTo(steps,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' },
            0.12
          );
        }

        if (ownership) {
          tl.fromTo(ownership,
            { opacity: 0, y: 16, force3D: true },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '+=0.05'
          );
        }
      });

      // 5. Pakiety ofertowe (Strony WWW i Branding)
      const packagesSecs = document.querySelectorAll('.packages-section');
      packagesSecs.forEach(sec => {
        if (sec.dataset.entranceDone) return;
        sec.dataset.entranceDone = 'true';
        const heading = sec.querySelector('h2');
        const lead = sec.querySelector('.packages-intro .home-lead');
        const cards = sec.querySelectorAll('.package-grid .package-card');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (lead) gsap.set(lead, { clearProps: 'opacity,transform' });
            if (cards.length) gsap.set(cards, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (lead) {
          tl.fromTo(lead,
            { opacity: 0, y: 16, force3D: true },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            0.08
          );
        }

        if (cards.length) {
          tl.fromTo(cards,
            { opacity: 0, y: 20, force3D: true },
            { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out' },
            0.12
          );
        }
      });

      // 6. FAQ na podstronie Strony WWW (#faq .faq-grid)
      const faqSec = document.querySelector('#faq .faq-grid');
      if (faqSec && !faqSec.dataset.entranceDone) {
        faqSec.dataset.entranceDone = 'true';
        const heading = faqSec.querySelector('h2');
        const faqItems = faqSec.querySelectorAll('.faq-list details');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: faqSec,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (faqItems.length) gsap.set(faqItems, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (faqItems.length) {
          tl.fromTo(faqItems,
            { opacity: 0, y: 16, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.06, ease: 'power3.out' },
            heading ? 0.1 : 0
          );
        }
      }

      // 7. Sekcje compact-grid na podstronach (Case Studies: Potrzeba, Zakres, Rezultat oraz O mnie: Doświadczenie)
      const compactGrids = document.querySelectorAll('.project-detail .compact-grid, section[aria-labelledby="case-drewmar-title"] .compact-grid');
      compactGrids.forEach(grid => {
        if (grid.dataset.entranceDone) return;
        grid.dataset.entranceDone = 'true';

        const heading = grid.querySelector('h2');
        const contentItems = grid.querySelectorAll('.bio-copy > *, .scope-list > li, .testimonial-card, .home-lead, :scope > div:last-child > p');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (contentItems.length) gsap.set(contentItems, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (contentItems.length) {
          tl.fromTo(contentItems,
            { opacity: 0, y: 16, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out' },
            heading ? 0.1 : 0
          );
        }
      });

      // 8. Dowody i relacje (Strony WWW i Branding)
      animGroup('.proof-grid', '.proof-item', { y: 18, duration: 0.85, stagger: 0.08, start: 'top 85%' });
      animSingle('.relationship-story', { y: 18, duration: 0.85, start: 'top 85%' });
      animSingle('.branding-portfolio-link-wrap', { y: 16, duration: 0.8, start: 'top 88%' });

      // 9. Listing portfolio: okładki realizacji wchodzą płynnie
      const portfolioWorks = document.querySelectorAll('.portfolio .stage .work');
      portfolioWorks.forEach(work => {
        if (work.dataset.entranceDone) return;
        work.dataset.entranceDone = 'true';
        const media = work.querySelector('.media-link');
        if (media) {
          gsap.fromTo(media,
            { opacity: 0, y: 20, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.95,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: media,
                start: 'top 85%',
                once: true
              },
              onComplete: () => {
                gsap.set(media, { clearProps: 'opacity,transform' });
              }
            }
          );
        }
      });

      // 10. Strony case study portfolio (/portfolio/[slug]/)
      animGroup('.project-gallery', 'figure', { y: 20, duration: 0.9, stagger: 0.1, start: 'top 85%' });
      animSingle('.project-film-media figure', { y: 20, duration: 0.9, start: 'top 85%' });
      animGroup('.project-next', 'a', { y: 16, duration: 0.8, stagger: 0.06, start: 'top 88%' });

      // 11. O mnie (/o-mnie/): Sposób pracy i Zasady współpracy
      const howSec = document.querySelector('#jak-pracuje');
      if (howSec && !howSec.dataset.entranceDone) {
        howSec.dataset.entranceDone = 'true';
        const heading = howSec.querySelector('.how-intro h2');
        const lead = howSec.querySelector('.how-intro .home-lead');
        const steps = howSec.querySelectorAll('.how-steps-grid .how-step');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: howSec,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (heading) gsap.set(heading, { clearProps: 'opacity,transform' });
            if (lead) gsap.set(lead, { clearProps: 'opacity,transform' });
            if (steps.length) gsap.set(steps, { clearProps: 'opacity,transform' });
          }
        });

        if (heading) {
          tl.fromTo(heading,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (lead) {
          tl.fromTo(lead,
            { opacity: 0, y: 16, force3D: true },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            0.08
          );
        }

        if (steps.length) {
          tl.fromTo(steps,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out' },
            0.12
          );
        }
      }

      const rulesSec = document.querySelector('.rules-block');
      if (rulesSec && !rulesSec.dataset.entranceDone) {
        rulesSec.dataset.entranceDone = 'true';
        const title = rulesSec.querySelector('.rules-block-title');
        const rules = rulesSec.querySelectorAll('.rules-columns .rule-item');
        const note = rulesSec.querySelector('.rules-note');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rulesSec,
            start: 'top 82%',
            once: true
          },
          onComplete: () => {
            if (title) gsap.set(title, { clearProps: 'opacity,transform' });
            if (rules.length) gsap.set(rules, { clearProps: 'opacity,transform' });
            if (note) gsap.set(note, { clearProps: 'opacity,transform' });
          }
        });

        if (title) {
          tl.fromTo(title,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
            0
          );
        }

        if (rules.length) {
          tl.fromTo(rules,
            { opacity: 0, y: 18, force3D: true },
            { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out' },
            title ? 0.12 : 0
          );
        }

        if (note) {
          tl.fromTo(note,
            { opacity: 0, y: 14, force3D: true },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '+=0.05'
          );
        }
      }

      // 12. Blog (/blog/ oraz /blog/[slug]/)
      animSingle('.blog-featured-card', { y: 20, duration: 0.95, start: 'top 82%' });
      animGroup('.blog-list-grid', '.blog-card', { y: 20, duration: 0.95, stagger: 0.12, start: 'top 82%' });

      const singlePostContent = document.querySelector('.post-layout-wrap .post-content');
      if (singlePostContent && !singlePostContent.dataset.entranceDone) {
        singlePostContent.dataset.entranceDone = 'true';
        const postBlocks = singlePostContent.querySelectorAll(':scope > p, :scope > h2, :scope > ul, :scope > ol, :scope > blockquote, :scope > figure');
        postBlocks.forEach(block => {
          gsap.fromTo(block,
            { opacity: 0, y: 16, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: block,
                start: 'top 88%',
                once: true
              },
              onComplete: () => {
                gsap.set(block, { clearProps: 'opacity,transform' });
              }
            }
          );
        });
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
        let rawText = el.getAttribute('data-f3-raw');

        if (!rawText) {
          const flipFront = el.querySelector('.nav-flip-front');
          if (flipFront) {
            rawText = flipFront.textContent.replace(/\s+/g, ' ').trim();
          } else {
            // Wykryj strzałkę na końcu (w tekście głównym lub w spanach aria-hidden)
            const fullText = (el.textContent || '').replace(/\s+/g, ' ').trim();
            const arrowMatch = fullText.match(/\s*([→↗\u2192\u2197\u21B3])$/);
            if (arrowMatch) {
              arrow = arrowMatch[1];
            } else if (isCta) {
              arrow = '→';
            }

            // Pobierz tekst bez zbędnych grafik SVG i kontenerów cta-arrow
            const clone = el.cloneNode(true);
            clone.querySelectorAll('svg, .cta-arrow-box, .cta-arrow').forEach(n => n.remove());
            rawText = (clone.textContent || '').replace(/\s+/g, ' ').trim();
            if (arrow && rawText.endsWith(arrow)) {
              rawText = rawText.slice(0, -arrow.length).trim();
            }
          }
          if (!rawText) return;
          el.setAttribute('data-f3-raw', rawText);
          if (arrow) el.setAttribute('data-f3-arrow', arrow);
        } else if (!arrow && isCta) {
          arrow = '→';
        }

        const textOnly = rawText;

        // Zapewnienie dostępności: czytnik otrzymuje jeden czysty pełny napis
        if (!el.hasAttribute('aria-label')) {
          el.setAttribute('aria-label', `${textOnly} ${arrow || ''}`.trim());
        }

        // Usuń poprzednią zawartość f3 jeśli istniała (np. przy przełączaniu języka)
        const oldClip = el.querySelector('.f3-clip');
        if (oldClip) oldClip.remove();

        const words = textOnly.split(' ');
        let charIndex = 0;

        const clip = document.createElement('span');
        clip.className = 'f3-clip';
        clip.setAttribute('aria-hidden', 'true');

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

        if (arrow) {
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

      const isHomePage = document.body.classList.contains('home-page');

      // 1. UNIVERSAL: menu i stopka – wszystkie strony
      document.querySelectorAll('#main-nav a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.language-switch a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.footer-nav a, .footer-contact a, .social-links a').forEach(el => applyToElement(el, false, false));
      document.querySelectorAll('.tools .quote').forEach(el => applyToElement(el, false, true));

      // 2. PRZYCISKI CTA (ciemne przyciski i formularz kontaktowy)
      document.querySelectorAll('.hero .actions .btn.dark, .service-hero .btn.dark, .final-cta .cta-button, .contact-brief .cta-button, button.cta-button, .project-film-section .cta-button').forEach(el => applyToElement(el, false, true));

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
