import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyLive() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });

  const results = {};

  // 1. DREW-ART LIVE CHECK
  const pageDrewArt = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDrewArt.goto('https://grafmen-com.vercel.app/portfolio/drew-art/', { waitUntil: 'networkidle' });

  const drewArtData = await pageDrewArt.evaluate(() => {
    const cover = document.querySelector('.project-cover img');
    return {
      src: cover?.getAttribute('src'),
      width: cover?.getAttribute('width'),
      height: cover?.getAttribute('height'),
      srcset: cover?.getAttribute('srcset'),
      naturalWidth: cover?.naturalWidth,
      naturalHeight: cover?.naturalHeight
    };
  });
  results.drewArtCover = drewArtData;
  await pageDrewArt.close();

  // 2. DREWMAX LIVE FLUID MENU & CLS ON MOBILE (390)
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const pageMobile = await contextMobile.newPage();

  await pageMobile.addInitScript(() => {
    window.__clsScore = 0;
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__clsScore += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  });

  await pageMobile.goto('https://grafmen-com.vercel.app/portfolio/drewmax/', { waitUntil: 'networkidle' });

  // Scroll to trigger fluid menu
  await pageMobile.evaluate(() => {
    window.scrollTo(0, 600);
    window.dispatchEvent(new Event('scroll'));
  });
  await pageMobile.waitForSelector('.fg-menu.is-visible', { timeout: 5000 });

  // Pomiary zamkniętego menu
  const closedFg = await pageMobile.evaluate(() => {
    const home = document.querySelector('.fg-home');
    const toggle = document.querySelector('.fg-toggle');
    const hRect = home.getBoundingClientRect();
    const tRect = toggle.getBoundingClientRect();
    return {
      home: { width: Math.round(hRect.width), height: Math.round(hRect.height) },
      toggle: { width: Math.round(tRect.width), height: Math.round(tRect.height) }
    };
  });

  // Otwarcie menu
  await pageMobile.click('.fg-menu.is-visible .fg-toggle', { force: true });
  await pageMobile.waitForTimeout(400);

  const openFg = await pageMobile.evaluate(() => {
    const menu = document.querySelector('.fg-menu');
    const cap = menu.querySelector('.fg-capsule');
    const capRect = cap.getBoundingClientRect();
    const links = Array.from(menu.querySelectorAll('.fg-link')).map(a => {
      const r = a.getBoundingClientRect();
      const cs = window.getComputedStyle(a);
      return {
        text: a.innerText.trim(),
        fontSize: cs.fontSize,
        width: Math.round(r.width),
        height: Math.round(r.height),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom)
      };
    });
    const backBtn = document.querySelector('.back-to-top');
    const bcs = backBtn ? window.getComputedStyle(backBtn) : null;
    return {
      capsule: { width: Math.round(capRect.width), height: Math.round(capRect.height) },
      links,
      backBtnGuard: bcs ? { opacity: bcs.opacity, pointerEvents: bcs.pointerEvents } : null
    };
  });

  // CLS po przewinięciu całej strony
  await pageMobile.evaluate(async () => {
    window.scrollTo(0, 0);
    const step = 400;
    const max = document.body.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 100));
  });

  const mobileCls = await pageMobile.evaluate(() => window.__clsScore || 0);

  results.mobileAudit = {
    closedFg,
    openFg,
    clsScore: Number(mobileCls.toFixed(4))
  };

  await contextMobile.close();
  await browser.close();

  console.log('=== RAPORT AUDYTU NA ŻYWO Z VERCEL ===');
  console.log(JSON.stringify(results, null, 2));
}

verifyLive().catch(console.error);
