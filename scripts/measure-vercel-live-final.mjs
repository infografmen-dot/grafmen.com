import { chromium } from 'playwright-core';
import fs from 'node:fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyLiveVercel() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });

  // 1. DESKTOP LIVE
  const pageDesk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesk.goto('https://grafmen-com.vercel.app/portfolio/drewmax/', { waitUntil: 'networkidle' });

  const desktopMenu = await pageDesk.evaluate(() => {
    return Array.from(document.querySelectorAll('header nav a')).map(a => {
      const rect = a.getBoundingClientRect();
      const cs = window.getComputedStyle(a);
      return {
        text: a.innerText.trim(),
        fontSize: cs.fontSize,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
  });

  const desktopLang = await pageDesk.evaluate(() => {
    return Array.from(document.querySelectorAll('.language-switch button')).map(b => {
      const rect = b.getBoundingClientRect();
      const cs = window.getComputedStyle(b);
      return {
        text: b.innerText.trim(),
        fontSize: cs.fontSize,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
  });

  const coverLive = await pageDesk.evaluate(() => {
    const img = document.querySelector('.project-cover img');
    return {
      src: img?.getAttribute('src'),
      hasSrcset: !!img?.getAttribute('srcset'),
      srcset: img?.getAttribute('srcset'),
      sizes: img?.getAttribute('sizes'),
      fetchpriority: img?.getAttribute('fetchpriority'),
      loading: img?.getAttribute('loading')
    };
  });

  // 2. MOBILE LIVE (390x844)
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await pageMobile.goto('https://grafmen-com.vercel.app/portfolio/drewmax/', { waitUntil: 'networkidle' });

  const mobileTargets = await pageMobile.evaluate(() => {
    const toggle = document.querySelector('.menu-toggle');
    const tRect = toggle ? toggle.getBoundingClientRect() : null;
    const langBtns = Array.from(document.querySelectorAll('.language-switch button')).map(b => {
      const r = b.getBoundingClientRect();
      return { text: b.innerText.trim(), width: Math.round(r.width), height: Math.round(r.height) };
    });
    const coverImg = document.querySelector('.project-cover img');
    return {
      menuToggle: tRect ? { width: Math.round(tRect.width), height: Math.round(tRect.height) } : null,
      langBtns,
      currentSrc: coverImg?.currentSrc
    };
  });

  // Vertical gallery check live
  await pageDesk.goto('https://grafmen-com.vercel.app/portfolio/drew-art/', { waitUntil: 'networkidle' });
  const verticalLive = await pageDesk.evaluate(() => {
    const fig = document.querySelector('.gallery-item-vertical');
    if (!fig) return null;
    const rect = fig.getBoundingClientRect();
    const cs = window.getComputedStyle(fig);
    return {
      maxWidth: cs.maxWidth,
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  });

  await browser.close();

  const report = {
    url: 'https://grafmen-com.vercel.app/',
    desktopMenu,
    desktopLang,
    coverLive,
    mobileTargets,
    verticalLive
  };

  console.log('=== RAPORT WERYFIKACJI LIVE NA VERCEL ===');
  console.log(JSON.stringify(report, null, 2));
}

verifyLiveVercel().catch(console.error);
