import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const distDir = path.resolve('./dist');

// Prosty serwer HTTP dla dist
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  let filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  const mimeMap = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };

  res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4329, async () => {
  console.log('Serwer testowy działa na http://localhost:4329');

  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const results = {
    menuDesktop: {},
    touchTargetsDesktop: {},
    touchTargetsMobile: {},
    responsiveImages: {},
    savings: []
  };

  // 1. DESKTOP TEST (1440x900)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4329/portfolio/drewmax/', { waitUntil: 'networkidle' });

    // Menu font-size i touch targets
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header nav a'));
      return links.map(a => {
        const rect = a.getBoundingClientRect();
        const cs = window.getComputedStyle(a);
        return {
          text: a.innerText.trim(),
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          minHeight: cs.minHeight,
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
    });

    // Language switch buttons
    const langButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.language-switch button'));
      return btns.map(b => {
        const rect = b.getBoundingClientRect();
        const cs = window.getComputedStyle(b);
        return {
          text: b.innerText.trim(),
          ariaPressed: b.getAttribute('aria-pressed'),
          fontSize: cs.fontSize,
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
    });

    // Quote button
    const quoteBtn = await page.evaluate(() => {
      const q = document.querySelector('.quote');
      if (!q) return null;
      const rect = q.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    });

    // Responsive image test - cover
    const coverData = await page.evaluate(() => {
      const img = document.querySelector('.project-cover img');
      if (!img) return null;
      return {
        src: img.getAttribute('src'),
        srcset: img.getAttribute('srcset'),
        sizes: img.getAttribute('sizes'),
        fetchpriority: img.getAttribute('fetchpriority'),
        decoding: img.getAttribute('decoding'),
        loading: img.getAttribute('loading'),
        currentSrc: img.currentSrc,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      };
    });

    // Responsive image test - gallery
    const galleryData = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('.project-gallery img'));
      return imgs.map(img => ({
        src: img.getAttribute('src'),
        srcset: img.getAttribute('srcset'),
        sizes: img.getAttribute('sizes'),
        loading: img.getAttribute('loading'),
        decoding: img.getAttribute('decoding')
      }));
    });

    results.menuDesktop = navLinks;
    results.touchTargetsDesktop = { langButtons, quoteBtn };
    results.responsiveImages = { cover: coverData, galleryCount: galleryData.length, firstGalleryItem: galleryData[0] };

    await page.close();
  }

  // 2. MOBILE TEST (390x844)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4329/portfolio/drewmax/', { waitUntil: 'networkidle' });

    // Menu toggle (hamburger)
    const menuToggle = await page.evaluate(() => {
      const btn = document.querySelector('.menu-toggle');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      const cs = window.getComputedStyle(btn);
      return {
        display: cs.display,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });

    // Language buttons on mobile
    const langButtonsMobile = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.language-switch button'));
      return btns.map(b => {
        const rect = b.getBoundingClientRect();
        return {
          text: b.innerText.trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
    });

    // Sprawdzenie wybranego currentSrc na urządzeniu mobilnym dla cover
    const mobileCoverSrc = await page.evaluate(() => {
      const img = document.querySelector('.project-cover img');
      return img ? img.currentSrc : null;
    });

    // Otwarcie menu mobilnego i sprawdzenie linków
    await page.click('.menu-toggle');
    await page.waitForTimeout(200);

    const mobileNavLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header nav.is-open a'));
      return links.map(a => {
        const rect = a.getBoundingClientRect();
        return {
          text: a.innerText.trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
    });

    results.touchTargetsMobile = {
      menuToggle,
      langButtonsMobile,
      mobileCoverCurrentSrc: mobileCoverSrc,
      mobileNavLinks: mobileNavLinks.slice(0, 3)
    };

    await page.close();
  }

  // 3. VERTICAL GALLERY TEST (Drew-Art)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:4329/portfolio/drew-art/', { waitUntil: 'networkidle' });

    const verticalItem = await page.evaluate(() => {
      const fig = document.querySelector('.gallery-item-vertical');
      if (!fig) return null;
      const rect = fig.getBoundingClientRect();
      const cs = window.getComputedStyle(fig);
      return {
        found: true,
        maxWidth: cs.maxWidth,
        marginInline: cs.marginInline,
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });

    results.verticalGallery = verticalItem;
    await page.close();
  }

  // 4. PRZYKŁADOWE OSZCZĘDNOŚCI WAGI (KB)
  const sampleImages = [
    { name: 'drewmax-site-en', orig: 'public/assets/portfolio/drewmax-site-en.png' },
    { name: 'drew-art', orig: 'public/assets/portfolio/drew-art.webp' },
    { name: 'jd-ubezpieczenia', orig: 'public/assets/portfolio/jd-ubezpieczenia.webp' },
    { name: 'hiker', orig: 'public/assets/portfolio/hiker.webp' },
    { name: 'szkola-best', orig: 'public/assets/portfolio/szkola-best.webp' }
  ];

  for (const item of sampleImages) {
    if (!fs.existsSync(item.orig)) continue;
    const origStat = fs.statSync(item.orig);
    const dir = path.dirname(item.orig);
    const ext = path.extname(item.orig);
    const base = path.basename(item.orig, ext);

    const f480 = path.join(dir, `${base}-480w.webp`);
    const f800 = path.join(dir, `${base}-800w.webp`);
    const f1200 = path.join(dir, `${base}-1200w.webp`);

    const s480 = fs.existsSync(f480) ? Math.round(fs.statSync(f480).size / 1024) : null;
    const s800 = fs.existsSync(f800) ? Math.round(fs.statSync(f800).size / 1024) : null;
    const s1200 = fs.existsSync(f1200) ? Math.round(fs.statSync(f1200).size / 1024) : null;

    results.savings.push({
      image: path.basename(item.orig),
      originalKb: Math.round(origStat.size / 1024),
      w480Kb: s480,
      w800Kb: s800,
      w1200Kb: s1200,
      savingsMobilePercent: s480 ? Math.round((1 - s480 / (origStat.size / 1024)) * 100) : null
    });
  }

  await browser.close();
  server.close();

  console.log('=== PEŁNY RAPORT POMIAROWY W PRZEGLĄDARCE (CHROME) ===');
  console.log(JSON.stringify(results, null, 2));
});
