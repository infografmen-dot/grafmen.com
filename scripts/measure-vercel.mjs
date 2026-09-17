import { chromium } from 'playwright-core';
import fs from 'node:fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function measureVercel() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  
  const viewports = [
    { name: 'desktop_1920', width: 1920, height: 1080 },
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'desktop_1280', width: 1280, height: 800 },
    { name: 'desktop_1024', width: 1024, height: 768 },
    { name: 'mobile_768', width: 768, height: 1024 },
    { name: 'mobile_430', width: 430, height: 932 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_360', width: 360, height: 800 }
  ];

  const results = {};

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    try {
      await page.goto('https://grafmen-com.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.warn('Networkidle timeout, proceeding with domcontentloaded...');
      await page.goto('https://grafmen-com.vercel.app/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }

    const data = await page.evaluate(() => {
      const getS = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          text: el.innerText.trim().slice(0, 40).replace(/\n/g, ' '),
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          fontWeight: cs.fontWeight,
          letterSpacing: cs.letterSpacing,
          fontFamily: cs.fontFamily
        };
      };

      const heroH1 = document.querySelector('h1');
      const h2List = Array.from(document.querySelectorAll('h2')).map(el => getS(el));
      const h3List = Array.from(document.querySelectorAll('h3')).map(el => getS(el));
      const lead = document.querySelector('.lead, .home-lead');
      const finalCtaH2 = document.querySelector('.final-cta h2');

      return {
        heroH1: getS(heroH1),
        h2List,
        h3List: h3List.slice(0, 6),
        lead: getS(lead),
        finalCtaH2: getS(finalCtaH2)
      };
    });

    results[vp.name] = data;

    // Save screenshots for BEFORE comparison
    if (['desktop_1440', 'mobile_390'].includes(vp.name)) {
      await page.waitForTimeout(1600); // allow hero animation
      await page.screenshot({ path: `docs/screenshots/vercel_before_${vp.name}.webp`, fullPage: false });
      
      // Scroll to audience section for H2 reference
      if (vp.name === 'desktop_1440') {
        await page.evaluate(() => {
          const el = document.querySelector('.audience-section');
          if (el) el.scrollIntoView();
        });
        await page.waitForTimeout(400);
        await page.screenshot({ path: `docs/screenshots/vercel_before_sections_1440.webp`, fullPage: false });
      }
    }

    await page.close();
  }

  await browser.close();

  fs.writeFileSync('docs/vercel-reference.json', JSON.stringify(results, null, 2));
  console.log('✅ Vercel reference measurements saved to docs/vercel-reference.json');
}

measureVercel().catch(console.error);
