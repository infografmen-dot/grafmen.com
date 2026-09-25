import { chromium } from 'playwright-core';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const viewports = [320, 390, 430, 1440];
  const fullReport = {};

  for (const vpWidth of viewports) {
    const page = await browser.newPage({
      viewport: { width: vpWidth, height: 844 },
      deviceScaleFactor: 1
    });

    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

    // Upewnij się, że obrazki są załadowane
    await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('#klienci img'));
      await Promise.all(imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.removeAttribute('loading');
        });
      }));
    });

    await page.waitForTimeout(400);

    const vpMetrics = await page.evaluate((vpWidth) => {
      const section = document.getElementById('klienci');
      const kicker = section.querySelector('.logo-cloud-kicker');
      const cloud = section.querySelector('.logo-cloud');
      const track = section.querySelector('.logo-marquee-track');
      const groups = Array.from(track.querySelectorAll('.logo-track-group'));
      const g1 = groups[0];
      const g2 = groups[1];

      // Pomiary dla każdego logotypu w grupie 1
      const logos = Array.from(g1.querySelectorAll('.logo-item img')).map(img => {
        const rect = img.getBoundingClientRect();
        const alt = img.getAttribute('alt') || img.src.split('/').pop().replace(/\.[^.]+$/, '');
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        
        let visibleW = Math.round(rect.width);
        let visibleH = Math.round(rect.height);

        // Specyficzne wyliczenia dla kluczowych znaków:
        let extra = {};
        if (img.src.includes('infosekret')) {
          visibleW = Math.round(rect.width * (325 / 337));
          visibleH = Math.round(rect.height * (74 / 86));
          extra = { visibleTextWidth: visibleW, visibleTextHeight: visibleH };
        } else if (img.src.includes('e-projektowanie')) {
          // Symbol puzzla (Y=7..117 w 174px = 110px)
          const symbolH = Math.round(rect.height * (110 / 174));
          const textH = Math.round(rect.height * (25 / 174));
          const totalVisibleH = Math.round(rect.height * (161 / 174));
          extra = { symbolHeight: symbolH, textHeight: textH, totalVisibleHeight: totalVisibleH };
        }

        return {
          alt,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          visibleWidth: visibleW,
          visibleHeight: visibleH,
          opacity: window.getComputedStyle(img).opacity,
          ...extra
        };
      });

      const g1Rect = g1.getBoundingClientRect();
      const g2Rect = g2.getBoundingClientRect();

      return {
        viewportWidth: vpWidth,
        sectionHeight: Math.round(section.getBoundingClientRect().height),
        cloudHeight: Math.round(cloud.getBoundingClientRect().height),
        kicker: {
          text: kicker.textContent.trim(),
          fontSize: window.getComputedStyle(kicker).fontSize,
          marginBottom: window.getComputedStyle(kicker).marginBottom
        },
        groupGap: window.getComputedStyle(g1).gap,
        groupWidth: Math.round(g1Rect.width),
        loopEqual: Math.abs(Math.round(g1Rect.width) - Math.round(g2Rect.width)) <= 1,
        logos
      };
    }, vpWidth);

    fullReport[vpWidth] = vpMetrics;

    // Screenshoty
    if (vpWidth === 390) {
      await page.evaluate(() => {
        const track = document.querySelector('.logo-marquee-track');
        const groups = track.querySelectorAll('.logo-track-group');
        groups[0].style.animation = 'none';
        if (groups[1]) groups[1].style.animation = 'none';
        const infoItem = groups[0].querySelector('img[src*="infosekret"]').closest('.logo-item');
        groups[0].style.transform = `translateX(-${infoItem.offsetLeft - 24}px)`;
        if (groups[1]) groups[1].style.transform = `translateX(-${infoItem.offsetLeft - 24}px)`;
      });
      await page.locator('#klienci').screenshot({ path: 'scripts/klienci-390-final.png' });
      await page.screenshot({ path: 'scripts/page-390-final.png' });
    } else if (vpWidth === 320) {
      await page.evaluate(() => {
        const track = document.querySelector('.logo-marquee-track');
        const groups = track.querySelectorAll('.logo-track-group');
        groups[0].style.animation = 'none';
        if (groups[1]) groups[1].style.animation = 'none';
        const infoItem = groups[0].querySelector('img[src*="infosekret"]').closest('.logo-item');
        groups[0].style.transform = `translateX(-${infoItem.offsetLeft - 12}px)`;
        if (groups[1]) groups[1].style.transform = `translateX(-${infoItem.offsetLeft - 12}px)`;
      });
      await page.locator('#klienci').screenshot({ path: 'scripts/klienci-320-final.png' });
    } else if (vpWidth === 430) {
      await page.evaluate(() => {
        const track = document.querySelector('.logo-marquee-track');
        const groups = track.querySelectorAll('.logo-track-group');
        groups[0].style.animation = 'none';
        if (groups[1]) groups[1].style.animation = 'none';
        const infoItem = groups[0].querySelector('img[src*="infosekret"]').closest('.logo-item');
        groups[0].style.transform = `translateX(-${infoItem.offsetLeft - 28}px)`;
        if (groups[1]) groups[1].style.transform = `translateX(-${infoItem.offsetLeft - 28}px)`;
      });
      await page.locator('#klienci').screenshot({ path: 'scripts/klienci-430-final.png' });
    } else if (vpWidth === 1440) {
      await page.locator('#klienci').screenshot({ path: 'scripts/klienci-1440-final.png' });
    }

    await page.close();
  }

  // Sprawdźmy pełen obieg animacji (płynność marquee)
  const animPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await animPage.goto('http://localhost:4321/');
  const animCheck = await animPage.evaluate(() => {
    const track = document.querySelector('.logo-marquee-track');
    const group = track.querySelector('.logo-track-group');
    const comp = window.getComputedStyle(group);
    return {
      animationName: comp.animationName,
      animationDuration: comp.animationDuration,
      animationTimingFunction: comp.animationTimingFunction,
      animationIterationCount: comp.animationIterationCount
    };
  });
  fullReport.animationCheck = animCheck;
  await animPage.close();

  fs.writeFileSync('scripts/verification-report.json', JSON.stringify(fullReport, null, 2));
  console.log('Raport zapisany do scripts/verification-report.json');
  console.log(JSON.stringify(fullReport, null, 2));

  await browser.close();
}

main().catch(console.error);
