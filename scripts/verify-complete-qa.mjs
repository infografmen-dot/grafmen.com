import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const distDir = path.resolve('./dist');

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
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
  };

  res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4331, async () => {
  console.log('Serwer testowy QA działa na http://localhost:4331');

  const browser = await chromium.launch({ executablePath: chromePath, headless: true });

  const viewports = [
    { name: 'mobile_320', width: 320, height: 568, dpr: 2 },
    { name: 'mobile_390', width: 390, height: 844, dpr: 2 },
    { name: 'mobile_430', width: 430, height: 932, dpr: 2 },
    { name: 'desktop_1440', width: 1440, height: 900, dpr: 1 }
  ];

  const fullReport = {
    viewports: {},
    clsMeasurements: {},
    responsiveImageChecks: {}
  };

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr
    });
    const page = await context.newPage();

    // Rejestrator CLS przez PerformanceObserver
    await page.addInitScript(() => {
      window.__clsScore = 0;
      window.__clsEntries = [];
      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__clsScore += entry.value;
              window.__clsEntries.push({
                value: entry.value,
                startTime: entry.startTime
              });
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('PerformanceObserver error', e);
      }
    });

    await page.goto('http://localhost:4331/portfolio/drewmax/', { waitUntil: 'networkidle' });

    // Przewiń stronę w dół, aby wywołać pojawienie się fluid menu i załadować sekcje
    await page.evaluate(() => {
      window.scrollTo(0, 600);
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(300);

    const vpData = {};

    // 1. GÓRNE MENU
    if (vp.width < 1024) {
      // Mobile upper menu
      const toggleRect = await page.evaluate(() => {
        const t = document.querySelector('.menu-toggle');
        if (!t) return null;
        const r = t.getBoundingClientRect();
        return { width: Math.round(r.width), height: Math.round(r.height), display: window.getComputedStyle(t).display };
      });

      // Otwarcie górnego menu
      await page.click('.menu-toggle');
      await page.waitForTimeout(200);

      const upperNavLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('header nav.is-open a')).map(a => {
          const r = a.getBoundingClientRect();
          const cs = window.getComputedStyle(a);
          return {
            text: a.innerText.trim(),
            fontSize: cs.fontSize,
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        });
      });

      // Zamknięcie górnego menu
      await page.click('.menu-toggle');
      await page.waitForTimeout(200);

      vpData.upperMenu = { toggle: toggleRect, openLinks: upperNavLinks };
    } else {
      // Desktop upper menu
      const desktopNavLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('header nav a')).map(a => {
          const r = a.getBoundingClientRect();
          const cs = window.getComputedStyle(a);
          return {
            text: a.innerText.trim(),
            fontSize: cs.fontSize,
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        });
      });
      vpData.upperMenu = { links: desktopNavLinks };
    }

    // 2. PRZEŁĄCZNIK JĘZYKOWY PL / EN
    const langBtns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.language-switch button')).map(b => {
        const r = b.getBoundingClientRect();
        const cs = window.getComputedStyle(b);
        return {
          text: b.innerText.trim(),
          fontSize: cs.fontSize,
          width: Math.round(r.width),
          height: Math.round(r.height)
        };
      });
    });
    vpData.languageSwitch = langBtns;

    // 3. DOLNE PŁYWAJĄCE MENU (FLUID GLASS MENU) - STAN ZAMKNIĘTY
    const fgClosed = await page.evaluate(() => {
      const menu = document.querySelector('.fg-menu');
      if (!menu) return null;
      const capsule = menu.querySelector('.fg-capsule');
      const home = menu.querySelector('.fg-home');
      const toggle = menu.querySelector('.fg-toggle');
      const capRect = capsule.getBoundingClientRect();
      const homeRect = home.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      return {
        isVisible: menu.classList.contains('is-visible'),
        capsule: { width: Math.round(capRect.width), height: Math.round(capRect.height) },
        homeLink: { width: Math.round(homeRect.width), height: Math.round(homeRect.height), fontSize: window.getComputedStyle(home).fontSize },
        toggleBtn: { width: Math.round(toggleRect.width), height: Math.round(toggleRect.height) }
      };
    });
    vpData.fluidMenuClosed = fgClosed;

    // 4. OTWARCIE DOLNEGO MENU
    await page.evaluate(() => {
      window.scrollTo(0, 600);
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForSelector('.fg-menu.is-visible .fg-toggle', { timeout: 5000 });
    await page.click('.fg-menu.is-visible .fg-toggle', { force: true });
    await page.waitForTimeout(400); // czas animacji capsule

    const fgOpen = await page.evaluate(() => {
      const menu = document.querySelector('.fg-menu');
      if (!menu) return null;
      const capsule = menu.querySelector('.fg-capsule');
      const capRect = capsule.getBoundingClientRect();
      const body = menu.querySelector('.fg-body');

      const links = Array.from(menu.querySelectorAll('.fg-link')).map(a => {
        const r = a.getBoundingClientRect();
        const cs = window.getComputedStyle(a);
        const isClickable = r.height > 0 && r.width > 0 && r.bottom <= window.innerHeight + 2;
        return {
          text: a.innerText.trim(),
          fontSize: cs.fontSize,
          width: Math.round(r.width),
          height: Math.round(r.height),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          isWithinViewport: isClickable
        };
      });

      // Sprawdzenie kolizji z back-to-top
      const backBtn = document.querySelector('.back-to-top');
      let backBtnStatus = 'not-found';
      if (backBtn) {
        const bcs = window.getComputedStyle(backBtn);
        backBtnStatus = {
          display: bcs.display,
          opacity: bcs.opacity,
          pointerEvents: bcs.pointerEvents
        };
      }

      return {
        isOpenClass: menu.classList.contains('is-open'),
        hasFgOpenOnBody: document.body.classList.contains('has-fg-open'),
        capsule: { width: Math.round(capRect.width), height: Math.round(capRect.height) },
        linksCount: links.length,
        links,
        lastLinkAccessible: links[links.length - 1]?.isWithinViewport,
        backToTopCollisionGuard: backBtnStatus
      };
    });
    vpData.fluidMenuOpen = fgOpen;

    // 5. TEST KLAWIATURY (Escape zamyka menu)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const isClosedAfterEscape = await page.evaluate(() => {
      const menu = document.querySelector('.fg-menu');
      return menu && !menu.classList.contains('is-open');
    });
    vpData.escapeClosesMenu = isClosedAfterEscape;

    // 6. RZECZYWISTY POMIAR CLS (przewinięcie całej strony)
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);

    // Stopniowy scroll w dół do stopki i z powrotem
    await page.evaluate(async () => {
      const step = 400;
      const max = document.body.scrollHeight;
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 100));
    });

    const clsScore = await page.evaluate(() => window.__clsScore || 0);
    fullReport.clsMeasurements[vp.name] = {
      score: Number(clsScore.toFixed(4)),
      status: clsScore < 0.1 ? 'DOBRY (Zielony < 0.1)' : 'DO POPRAWY'
    };

    // 7. WERYFIKACJA CURRENTSRC I METADANYCH OBRAZÓW NA TELEFONIE
    if (vp.name === 'mobile_390') {
      const imgData = await page.evaluate(() => {
        const cover = document.querySelector('.project-cover img');
        const firstGallery = document.querySelector('.project-gallery img');
        return {
          cover: {
            currentSrc: cover?.currentSrc,
            naturalWidth: cover?.naturalWidth,
            naturalHeight: cover?.naturalHeight,
            renderedWidth: Math.round(cover?.getBoundingClientRect().width),
            renderedHeight: Math.round(cover?.getBoundingClientRect().height),
            aspectRatio: cover?.naturalWidth && cover?.naturalHeight ? (cover.naturalWidth / cover.naturalHeight).toFixed(2) : null
          },
          gallery1: {
            currentSrc: firstGallery?.currentSrc,
            naturalWidth: firstGallery?.naturalWidth,
            naturalHeight: firstGallery?.naturalHeight
          }
        };
      });
      fullReport.responsiveImageChecks = imgData;
    }

    fullReport.viewports[vp.name] = vpData;
    await context.close();
  }

  await browser.close();
  server.close();

  console.log('=== PEŁNY AUDYT QA W PRZEGLĄDARCE CHROME ===');
  console.log(JSON.stringify(fullReport, null, 2));

  fs.writeFileSync('docs/qa-audit-final.json', JSON.stringify(fullReport, null, 2));
});
