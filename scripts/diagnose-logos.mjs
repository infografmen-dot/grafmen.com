import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });

  console.log('Nawigacja do http://localhost:4321/ ...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // Pobierz informacje o wszystkich logotypach w sekcji #klienci
  const logosData = await page.evaluate(async () => {
    const track = document.querySelector('.logo-marquee-track');
    const firstGroup = track ? track.querySelector('.logo-track-group:not([aria-hidden="true"])') : null;
    const secondGroup = track ? track.querySelector('.logo-track-group[aria-hidden="true"]') : null;

    if (!firstGroup) return { error: 'Brak grupy logotypów' };

    // Funkcja do pomiaru widocznego znaku na canvasie (bounding box pikseli alpha > 10)
    async function measureVisibleBounds(imgEl) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const naturalW = img.naturalWidth;
          const naturalH = img.naturalHeight;
          const canvas = document.createElement('canvas');
          canvas.width = naturalW;
          canvas.height = naturalH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, naturalW, naturalH).data;

          let minX = naturalW, maxX = 0, minY = naturalH, maxY = 0;
          let nonTransparentCount = 0;

          for (let y = 0; y < naturalH; y++) {
            for (let x = 0; x < naturalW; x++) {
              const alpha = data[(y * naturalW + x) * 4 + 3];
              if (alpha > 15) {
                nonTransparentCount++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (nonTransparentCount === 0) {
            resolve({ naturalW, naturalH, visibleW: 0, visibleH: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 });
            return;
          }

          const visibleW = maxX - minX + 1;
          const visibleH = maxY - minY + 1;

          resolve({
            naturalW,
            naturalH,
            visibleW,
            visibleH,
            minX,
            maxX,
            minY,
            maxY,
            ratioW: visibleW / naturalW,
            ratioH: visibleH / naturalH
          });
        };
        img.onerror = () => resolve({ error: 'Nie udało się załadować obrazu: ' + imgEl.src });
        img.src = imgEl.src;
      });
    }

    const results = [];
    const items = firstGroup.querySelectorAll('.logo-item img');

    for (const img of items) {
      const rect = img.getBoundingClientRect();
      const itemRect = img.closest('.logo-item').getBoundingClientRect();
      const computed = window.getComputedStyle(img);
      const itemComputed = window.getComputedStyle(img.closest('.logo-item'));
      
      const bounds = await measureVisibleBounds(img);

      // Oblicz ile pikseli na ekranie zajmuje sam widoczny znak
      const renderedScaleX = rect.width / (bounds.naturalW || rect.width);
      const renderedScaleY = rect.height / (bounds.naturalH || rect.height);
      const renderedVisibleW = bounds.visibleW * renderedScaleX;
      const renderedVisibleH = bounds.visibleH * renderedScaleY;

      results.push({
        alt: img.getAttribute('alt'),
        src: img.getAttribute('src'),
        currentSrc: img.currentSrc,
        renderedRect: { width: Math.round(rect.width), height: Math.round(rect.height) },
        itemRect: { width: Math.round(itemRect.width), height: Math.round(itemRect.height) },
        cssWidth: computed.width,
        cssHeight: computed.height,
        cssMaxHeight: computed.maxHeight,
        cssMaxWidth: computed.maxWidth,
        cssOpacity: computed.opacity,
        itemPadding: itemComputed.padding,
        bounds,
        renderedVisibleW: Math.round(renderedVisibleW),
        renderedVisibleH: Math.round(renderedVisibleH)
      });
    }

    // Informacje o sekcji i kontenerze
    const section = document.querySelector('.logo-cloud-section');
    const kicker = document.querySelector('.logo-cloud-kicker');
    const cloud = document.querySelector('.logo-cloud');
    const trackGroup = firstGroup;

    return {
      sectionHeight: section ? section.getBoundingClientRect().height : null,
      sectionPadding: section ? window.getComputedStyle(section).padding : null,
      kickerRect: kicker ? kicker.getBoundingClientRect() : null,
      kickerComputed: kicker ? {
        fontSize: window.getComputedStyle(kicker).fontSize,
        marginBottom: window.getComputedStyle(kicker).marginBottom,
      } : null,
      cloudHeight: cloud ? cloud.getBoundingClientRect().height : null,
      groupGap: trackGroup ? window.getComputedStyle(trackGroup).gap : null,
      results
    };
  });

  console.log(JSON.stringify(logosData, null, 2));
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
