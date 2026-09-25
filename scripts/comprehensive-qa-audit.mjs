import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const TEST_URLS = [
  '/',
  '/en/',
  '/strony-www/',
  '/en/websites/',
  '/modernizacja/',
  '/en/redesign/',
  '/branding/',
  '/en/branding/',
  '/portfolio/',
  '/en/portfolio/',
  '/portfolio/drewmax/',
  '/portfolio/pobudka/',
  '/portfolio/hiker/',
  '/o-mnie/',
  '/en/about/',
  '/kontakt/',
  '/en/contact/',
  '/blog/',
  '/en/blog/',
  '/polityka-prywatnosci/',
  '/en/privacy-policy/'
];

const VIEWPORTS = [
  { name: 'Mobile Mini (320px)', width: 320, height: 640 },
  { name: 'Mobile Standard (390px)', width: 390, height: 844 },
  { name: 'Mobile Large (430px)', width: 430, height: 932 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop Standard (1440px)', width: 1440, height: 900 },
  { name: 'Desktop Ultrawide (1920px)', width: 1920, height: 1080 }
];

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const issues = [];
  const networkFailures = [];
  const consoleErrors = [];

  console.log('=== ROZPOCZĘCIE KOMPLEKSOWEGO AUDYTU DESKTOP & MOBILE ===\n');

  // 1. Sprawdzenie błędów konsoli i 404 dla wszystkich stron
  console.log('--- 1. SPRAWDZANIE BŁĘDÓW KONSOLI I ZASOBÓW SIECIOWYCH (PL & EN) ---');
  for (const urlPath of TEST_URLS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({ url: urlPath, message: msg.text() });
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push({ url: urlPath, message: err.message, stack: err.stack });
    });

    page.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon')) {
        networkFailures.push({ page: urlPath, url: resp.url(), status: resp.status() });
      }
    });

    try {
      await page.goto(`http://localhost:4321${urlPath}`, { waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
      issues.push(`Nie udało się załadować ${urlPath}: ${e.message}`);
    }

    await page.close();
  }

  // 2. Sprawdzanie poziomego overflow na wszystkich breakpointach
  console.log('--- 2. SPRAWDZANIE POZIOMEGO OVERFLOW NA 6 ROZDZIELCZOŚCIACH ---');
  const overflowIssues = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    for (const urlPath of ['/', '/strony-www/', '/branding/', '/portfolio/', '/kontakt/', '/en/', '/en/websites/']) {
      await page.goto(`http://localhost:4321${urlPath}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(150);

      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const bodyScrollW = document.body.scrollWidth;
        const docScrollW = document.documentElement.scrollWidth;
        const maxScrollW = Math.max(bodyScrollW, docScrollW);

        if (maxScrollW > docW + 1) {
          // Znajdź winny element
          const elements = Array.from(document.querySelectorAll('*'));
          const overflowing = [];
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > docW + 1 || rect.left < -1) {
              overflowing.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
              });
            }
          }
          return { docW, maxScrollW, diff: maxScrollW - docW, overflowing: overflowing.slice(0, 5) };
        }
        return null;
      });

      if (overflow) {
        overflowIssues.push({
          viewport: vp.name,
          url: urlPath,
          ...overflow
        });
      }
    }
    await page.close();
  }

  // 3. Testy interakcji mobilnych (390px)
  console.log('--- 3. TESTY INTERAKCJI MOBILNYCH (Menu mobilne, baner cookies, dropdown) ---');
  const mobileInteractions = {};
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

    // 3a. Hamburger menu mobilne
    const hamburger = page.locator('.menu-toggle');
    const hasHamburger = await hamburger.count() > 0;
    let menuOpenOk = false;
    let menuCloseOk = false;

    if (hasHamburger) {
      await hamburger.first().click();
      await page.waitForTimeout(300);
      const isNavVisible = await page.evaluate(() => {
        const nav = document.querySelector('#main-nav');
        if (!nav) return false;
        const comp = window.getComputedStyle(nav);
        return nav.classList.contains('is-open') && comp.display !== 'none' && comp.visibility !== 'hidden';
      });
      menuOpenOk = isNavVisible;

      // Sprawdź czy jest link kontakt w menu
      const contactInMenu = await page.evaluate(() => {
        const nav = document.querySelector('#main-nav');
        return nav ? !!nav.querySelector('a[href*="kontakt"], a[href*="contact"]') : false;
      });

      // Zamknij
      await hamburger.first().click();
      await page.waitForTimeout(300);
      const isClosed = await page.evaluate(() => {
        const nav = document.querySelector('#main-nav');
        return !nav || !nav.classList.contains('is-open');
      });
      menuCloseOk = isClosed;

      mobileInteractions.mobileMenu = {
        exists: true,
        openOk: menuOpenOk,
        contactButtonInMenu: contactInMenu,
        closeOk: menuCloseOk
      };
    } else {
      mobileInteractions.mobileMenu = { exists: false };
    }

    // 3b. Baner Cookies na mobilce
    await page.waitForTimeout(1000); // baner pojawia się po 800ms
    const cookieBanner = page.locator('#cookie-banner');
    const hasCookieBanner = await cookieBanner.count() > 0;
    let cookieAcceptOk = false;

    if (hasCookieBanner) {
      const isVisible = await page.evaluate(() => {
        const banner = document.querySelector('#cookie-banner');
        if (!banner) return false;
        const comp = window.getComputedStyle(banner);
        return !banner.hasAttribute('hidden') && comp.display !== 'none';
      });
      const closeBtn = page.locator('#cookie-banner-close');
      if (await closeBtn.count() > 0 && isVisible) {
        await closeBtn.first().click();
        await page.waitForTimeout(400); // animacja ukrywania 280ms
        cookieAcceptOk = await page.evaluate(() => {
          const banner = document.querySelector('#cookie-banner');
          return !banner || banner.hasAttribute('hidden') || window.getComputedStyle(banner).display === 'none';
        });
      }
      mobileInteractions.cookieBanner = { exists: true, initiallyVisible: isVisible, closeOk: cookieAcceptOk };
    }

    // 3c. Pasek logotypów na mobilce
    const logoCloud = page.locator('#klienci .logo-cloud');
    const hasLogos = await logoCloud.count() > 0;
    const logoMetrics = await page.evaluate(() => {
      const g = document.querySelector('#klienci .logo-track-group');
      if (!g) return null;
      const comp = window.getComputedStyle(g);
      return {
        animation: comp.animationName,
        duration: comp.animationDuration,
        gap: comp.gap,
        itemsCount: g.querySelectorAll('.logo-item').length
      };
    });
    mobileInteractions.logoCloud = { exists: hasLogos, metrics: logoMetrics };

    await page.close();
  }

  // 4. Testy interakcji desktopowych (1440px)
  console.log('--- 4. TESTY INTERAKCJI DESKTOP (Główne menu, animacje hero, kontakt) ---');
  const desktopInteractions = {};
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

    // 4a. Główne menu nawigacyjne
    const nav = page.locator('#main-nav');
    const navCount = await nav.count();
    const navMetrics = await page.evaluate(() => {
      const el = document.querySelector('#main-nav');
      if (!el) return null;
      const comp = window.getComputedStyle(el);
      return {
        display: comp.display,
        visibility: comp.visibility,
        linksCount: el.querySelectorAll('a').length
      };
    });
    desktopInteractions.nav = { exists: navCount > 0, metrics: navMetrics };

    // 4b. Hero Cubes Motion / Video
    const heroVid = page.locator('#hero-cubes-vid, .hero-cubes-vid');
    const hasHeroVid = await heroVid.count() > 0;
    const heroMetrics = await page.evaluate(() => {
      const v = document.querySelector('#hero-cubes-vid, .hero-cubes-vid');
      const pauseBtn = document.querySelector('#hero-cubes-pause');
      return {
        hasVideo: !!v,
        videoTag: v ? v.tagName : null,
        hasPauseButton: !!pauseBtn
      };
    });
    desktopInteractions.heroMotion = heroMetrics;

    // 4c. FAQ Akordeon
    const faqDetails = page.locator('.faq-list details');
    const faqCount = await faqDetails.count();
    let faqToggleOk = false;
    if (faqCount > 1) {
      const secondFaq = faqDetails.nth(1);
      const isInitiallyOpen = await secondFaq.getAttribute('open') !== null;
      await secondFaq.locator('summary').click();
      await page.waitForTimeout(150);
      const isOpenAfter = await secondFaq.getAttribute('open') !== null;
      faqToggleOk = isInitiallyOpen !== isOpenAfter;
    }
    desktopInteractions.faq = { count: faqCount, toggleWorks: faqToggleOk };

    await page.close();
  }

  // 5. Test formularza kontaktowego na /kontakt/ oraz /en/contact/
  console.log('--- 5. WERYFIKACJA FORMULARZA KONTAKTOWEGO (Desktop + Mobile) ---');
  const contactResults = [];
  for (const cUrl of ['/kontakt/', '/en/contact/']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:4321${cUrl}`, { waitUntil: 'networkidle' });

    const trigger = page.locator('#topic-trigger');
    const menu = page.locator('#topic-listbox');
    const opt3 = page.locator('#topic-opt-3');

    await trigger.click();
    await page.waitForTimeout(150);
    const opened = await menu.isVisible();

    await opt3.click();
    await page.waitForTimeout(150);
    const closed = await menu.isHidden();
    const selectedText = await page.locator('#topic-value-display').textContent();

    let validationTriggered = false;
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(200);
      const invalidCount = await page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return 0;
        return form.querySelectorAll(':invalid').length;
      });
      validationTriggered = invalidCount > 0;
    }

    contactResults.push({
      url: cUrl,
      openOk: opened,
      selectAndCloseOk: closed,
      selectedValue: selectedText.trim(),
      validationTriggered
    });

    await page.close();
  }

  // 6. Test przełącznika językowego w nagłówku
  console.log('--- 6. TEST PRZEŁĄCZNIKA JĘZYKÓW (PL <-> EN) ---');
  let langSwitchOk = false;
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
    const enBtn = page.locator('.language-switch a[href*="/en/"]');
    if (await enBtn.count() > 0) {
      await enBtn.click();
      await page.waitForURL('**/en/**', { timeout: 5000 });
      const currentUrl = page.url();
      const plBtn = page.locator('.language-switch a[href="/"]');
      let returnOk = false;
      if (await plBtn.count() > 0) {
        await plBtn.click();
        await page.waitForURL('http://localhost:4321/', { timeout: 5000 });
        returnOk = page.url() === 'http://localhost:4321/';
      }
      langSwitchOk = currentUrl.includes('/en/') && returnOk;
    }
    await page.close();
  }

  // 7. Test stron case study (portfolio slug)
  console.log('--- 7. WERYFIKACJA STRON CASE STUDY (DREWMAX, POBUDKA, HIKER) ---');
  const caseStudyResults = [];
  for (const slug of ['drewmax', 'pobudka', 'hiker']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`http://localhost:4321/portfolio/${slug}/`, { waitUntil: 'networkidle' });
    const title = await page.title();
    const heroImage = await page.locator('img, picture').count();
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const maxScrollW = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
      return maxScrollW > docW + 1;
    });
    caseStudyResults.push({
      slug,
      title,
      imagesCount: heroImage,
      hasOverflow: overflow
    });
    await page.close();
  }

  const finalReport = {
    consoleErrors,
    networkFailures,
    overflowIssues,
    mobileInteractions,
    desktopInteractions,
    contactResults,
    langSwitchOk,
    caseStudyResults
  };

  fs.writeFileSync('scripts/comprehensive-audit-report.json', JSON.stringify(finalReport, null, 2));
  console.log('\n=== WYNIKI AUDYTU ===');
  console.log(`Błędy w konsoli: ${consoleErrors.length}`);
  console.log(`Błędy sieciowe (404/500): ${networkFailures.length}`);
  console.log(`Problemy z poziomym overflow: ${overflowIssues.length}`);
  console.log('Szczegóły raportu zapisane do scripts/comprehensive-audit-report.json');

  if (consoleErrors.length > 0) {
    console.log('\nBŁĘDY KONSOLI:', JSON.stringify(consoleErrors, null, 2));
  }
  if (networkFailures.length > 0) {
    console.log('\nBŁĘDY SIECIOWE:', JSON.stringify(networkFailures, null, 2));
  }
  if (overflowIssues.length > 0) {
    console.log('\nOVERFLOW:', JSON.stringify(overflowIssues, null, 2));
  }

  await browser.close();
}

main().catch(err => {
  console.error('BŁĄD AUDYTU:', err);
  process.exit(1);
});
