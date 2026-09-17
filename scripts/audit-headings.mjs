import { chromium } from 'playwright-core';
import { createServer } from 'vite';

async function audit() {
  const server = await createServer({
    root: 'd:/www/grafmen/aero',
    server: { port: 5173 }
  });
  await server.listen();

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  
  const routes = [
    { name: 'Home', url: 'http://localhost:5173/' },
    { name: 'Strony WWW', url: 'http://localhost:5173/strony-www/' },
    { name: 'Branding', url: 'http://localhost:5173/branding/' },
    { name: 'O mnie', url: 'http://localhost:5173/o-mnie/' },
    { name: 'Portfolio', url: 'http://localhost:5173/portfolio/' },
    { name: 'Modernizacja', url: 'http://localhost:5173/modernizacja/' },
    { name: 'Blog', url: 'http://localhost:5173/blog/' },
    { name: 'Kontakt', url: 'http://localhost:5173/kontakt/' },
    { name: 'Case Study: Hiker', url: 'http://localhost:5173/portfolio/hiker/' },
    { name: 'Case Study: Drewmax', url: 'http://localhost:5173/portfolio/drewmax/' }
  ];

  const viewports = [
    { name: 'Desktop 1440', width: 1440, height: 900 },
    { name: 'Mobile 390', width: 390, height: 844 }
  ];

  const results = {};

  for (const vp of viewports) {
    results[vp.name] = {};
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    for (const r of routes) {
      await page.goto(r.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const data = await page.evaluate(() => {
        const getStyles = (el) => {
          if (!el) return null;
          const s = window.getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            text: el.innerText.trim().slice(0, 35).replace(/\n/g, ' '),
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            fontWeight: s.fontWeight,
            letterSpacing: s.letterSpacing,
            fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, '')
          };
        };

        const heroH1 = document.querySelector('h1');
        const h2s = Array.from(document.querySelectorAll('h2')).map(el => getStyles(el));
        const h3s = Array.from(document.querySelectorAll('h3')).map(el => getStyles(el));
        const leads = Array.from(document.querySelectorAll('.home-lead, .lead, .hero-lead, .portfolio-intro')).map(el => getStyles(el));
        const kickers = Array.from(document.querySelectorAll('.home-kicker, .section-kicker, .eyebrow')).map(el => getStyles(el));

        return {
          h1: getStyles(heroH1),
          h2Count: h2s.length,
          h2Samples: h2s.slice(0, 5),
          h3Count: h3s.length,
          h3Samples: h3s.slice(0, 5),
          leadSample: leads[0] || null,
          kickerSample: kickers[0] || null
        };
      });

      results[vp.name][r.name] = data;
    }
    await page.close();
  }

  await browser.close();
  await server.close();

  console.log(JSON.stringify(results, null, 2));
}

audit().catch(console.error);
