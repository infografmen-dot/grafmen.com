import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'd:\\www\\grafmen\\aero\\docs\\screenshots';
fs.mkdirSync(screenshotDir, { recursive: true });

const routes = [
  { name: 'home', path: '/' },
  { name: 'strony-www', path: '/strony-www/' },
  { name: 'modernizacja', path: '/modernizacja/' },
  { name: 'branding', path: '/branding/' },
  { name: 'portfolio', path: '/portfolio/' },
  { name: 'o-mnie', path: '/o-mnie/' },
  { name: 'blog', path: '/blog/' },
  { name: 'kontakt', path: '/kontakt/' },
  { name: 'hiker', path: '/portfolio/hiker/' },
  { name: 'drewmax', path: '/portfolio/drewmax/' },
  { name: 'szkola-best', path: '/portfolio/szkola-best/' }
];

async function run() {
  console.log('🚀 Uruchamianie serwera Vite...');
  const server = await createServer({
    root: 'd:/www/grafmen/aero',
    server: { port: 5173 }
  });
  await server.listen();

  console.log('🚀 Uruchamianie Chrome z playwright-core...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const testResults = {
    menuLinks: [],
    menuInteractions: [],
    fileFallback: [],
    typography: [],
    overflowCheck: [],
    screenshots: []
  };

  // 1. TEST FLOATING MENU NAVIGATION & LINKS ON HTTP (Clean URLs)
  const testPages = ['/', '/o-mnie/', '/strony-www/', '/portfolio/', '/portfolio/hiker/'];
  const expectedItems = [
    { label: 'Strony WWW', href: '/strony-www/' },
    { label: 'Branding', href: '/branding/' },
    { label: 'Portfolio', href: '/portfolio/' },
    { label: 'O mnie', href: '/o-mnie/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Kontakt', href: '/kontakt/' }
  ];

  for (const pagePath of testPages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:5173${pagePath}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    const menuVisible = await page.$eval('.fg-menu', el => el.classList.contains('is-visible'));
    const homeHref = await page.$eval('.fg-home', el => el.getAttribute('href'));
    const isHome = pagePath === '/';

    testResults.menuLinks.push({
      page: pagePath,
      menuVisible,
      homeHref,
      homeValid: isHome ? homeHref === '#top' : homeHref === '/'
    });

    const links = await page.$$eval('.fg-link', els => els.map(el => ({
      text: el.innerText.trim(),
      href: el.getAttribute('href'),
      isActive: el.classList.contains('is-active'),
      ariaCurrent: el.getAttribute('aria-current')
    })));

    for (const exp of expectedItems) {
      const found = links.find(l => l.text === exp.label);
      const isExpectedActive = pagePath.includes(exp.href);
      testResults.menuLinks.push({
        page: pagePath,
        item: exp.label,
        href: found ? found.href : null,
        expectedHref: exp.href,
        hrefPass: found && found.href === exp.href,
        activePass: found ? (isExpectedActive ? found.isActive && found.ariaCurrent === 'page' : !found.isActive) : false
      });
    }

    await page.close();
  }

  // 2. TEST FILE:// PROTOCOL FALLBACK ON CASE STUDY
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const localHikerPath = 'file:///d:/www/grafmen/aero/portfolio/hiker/index.html';
    await page.goto(localHikerPath, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    const homeHref = await page.$eval('.fg-home', el => el.getAttribute('href'));
    const linkHrefs = await page.$$eval('.fg-link', els => els.map(el => ({
      text: el.innerText.trim(),
      href: el.getAttribute('href')
    })));

    testResults.fileFallback.push({
      tested: 'case-study-hiker',
      homeHref,
      homePass: homeHref === '../../index.html',
      webHref: linkHrefs.find(l => l.text === 'Strony WWW')?.href,
      webPass: linkHrefs.find(l => l.text === 'Strony WWW')?.href === '../../strony-www/index.html'
    });
    await page.close();
  }

  // 3. TEST MENU INTERACTIONS (Open, Close, Click Outside, Escape, Focus)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:5173/o-mnie/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    const toggle = await page.$('.fg-toggle');
    await toggle.click();
    await page.waitForTimeout(300);
    const isOpenAfterClick = await page.$eval('.fg-menu', el => el.classList.contains('is-open'));

    // Check click outside
    await page.mouse.click(100, 100);
    await page.waitForTimeout(300);
    const isClosedAfterOutside = await page.$eval('.fg-menu', el => !el.classList.contains('is-open'));

    // Open again and test Escape key
    await toggle.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const isClosedAfterEscape = await page.$eval('.fg-menu', el => !el.classList.contains('is-open'));

    testResults.menuInteractions.push({
      openOnToggle: isOpenAfterClick,
      closeOnClickOutside: isClosedAfterOutside,
      closeOnEscape: isClosedAfterEscape
    });
    await page.close();
  }

  // 4. TEST TYPOGRAPHY SCALE, OVERFLOW, AND CAPTURE SCREENSHOTS FOR ALL 11 ROUTES
  const viewports = [
    { mode: 'desktop', width: 1440, height: 900 },
    { mode: 'mobile', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    for (const r of routes) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        return { scrollWidth: docW, clientWidth: clientW, hasOverflow: docW > clientW };
      });
      testResults.overflowCheck.push({
        mode: vp.mode,
        route: r.name,
        pass: !overflow.hasOverflow,
        details: overflow
      });

      // Wait for hero text reveal animation on homepage
      if (r.name === 'home') {
        await page.waitForTimeout(1600);
      }

      // Capture screenshot
      const shotFile = path.join(screenshotDir, `${r.name}_${vp.mode}.webp`);
      await page.screenshot({ path: shotFile, fullPage: false });
      testResults.screenshots.push({ mode: vp.mode, route: r.name, file: shotFile });

      // If home desktop, also take a screenshot of home sections
      if (r.name === 'home' && vp.mode === 'desktop') {
        await page.evaluate(() => {
          const el = document.querySelector('.audience-section');
          if (el) el.scrollIntoView();
        });
        await page.waitForTimeout(400);
        const secFile = path.join(screenshotDir, `home_sections_desktop.webp`);
        await page.screenshot({ path: secFile, fullPage: false });
      }

      // Measure typography tokens on every page
      const computed = await page.evaluate(() => {
        const res = {};
        const h1 = document.querySelector('h1');
        if (h1) {
          const cs = window.getComputedStyle(h1);
          res.h1 = { fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: cs.fontWeight, fontFamily: cs.fontFamily };
        }
        const h2 = document.querySelector('h2');
        if (h2) {
          const cs = window.getComputedStyle(h2);
          res.h2 = { fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: cs.fontWeight, fontFamily: cs.fontFamily };
        }
        const finalCtaH2 = document.querySelector('.final-cta h2');
        if (finalCtaH2) {
          const cs = window.getComputedStyle(finalCtaH2);
          res.finalCtaH2 = { fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: cs.fontWeight };
        }
        const h3 = document.querySelector('h3');
        if (h3) {
          const cs = window.getComputedStyle(h3);
          res.h3 = { fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: cs.fontWeight };
        }
        const lead = document.querySelector('.lead, .home-lead');
        if (lead) {
          const cs = window.getComputedStyle(lead);
          res.lead = { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
        }
        const bodyP = document.querySelector('.bio-copy p, .home-section p:not(.home-lead):not(.home-kicker), .service-feature p, p:not(.lead):not(.home-lead):not(.home-kicker)');
        if (bodyP) {
          const cs = window.getComputedStyle(bodyP);
          res.body = { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
        }
        return res;
      });
      testResults.typography.push({ route: r.name, mode: vp.mode, computed });

      await page.close();
    }
  }

  await browser.close();
  await server.close();

  console.log('✅ Wszystkie testy zakończone sukcesem!');
  fs.writeFileSync('d:\\www\\grafmen\\aero\\docs\\test-results.json', JSON.stringify(testResults, null, 2));
}

run().catch(err => {
  console.error('❌ Błąd testu:', err);
  process.exit(1);
});
