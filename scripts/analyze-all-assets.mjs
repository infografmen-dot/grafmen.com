import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const LOGO_FILES = [
  'drewmax.svg',
  'drewmar.png',
  'unitrans.png',
  'salmax.png',
  'kancelaria-lampa.png',
  'pervita24.png',
  'sourcetech.png',
  'quero.png',
  'resto.png',
  'infosekret.png',
  'e-projektowanie.png'
];

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });

  const fileData = [];

  for (const filename of LOGO_FILES) {
    const filePath = path.join('public/assets/clients/marquee', filename);
    const fileUrl = `http://localhost:4321/assets/clients/marquee/${filename}`;
    
    const analysis = await page.evaluate(async (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const w = img.naturalWidth || 150;
          const h = img.naturalHeight || 43;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          let minX = w, maxX = 0, minY = h, maxY = 0;
          let nonTransparent = 0;
          
          try {
            const imgData = ctx.getImageData(0, 0, w, h).data;
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const a = imgData[(y * w + x) * 4 + 3];
                if (a > 15) {
                  nonTransparent++;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
          } catch (e) {
            // np. dla svg jeśli tainting
            resolve({ width: w, height: h, error: e.message });
            return;
          }

          resolve({
            width: w,
            height: h,
            minX, maxX, minY, maxY,
            visibleW: nonTransparent ? maxX - minX + 1 : w,
            visibleH: nonTransparent ? maxY - minY + 1 : h,
            paddingLeft: minX,
            paddingRight: w - 1 - maxX,
            paddingTop: minY,
            paddingBottom: h - 1 - maxY,
            aspectRatio: w / h,
            visibleAspectRatio: (maxX - minX + 1) / (maxY - minY + 1)
          });
        };
        img.onerror = () => resolve({ error: 'Failed to load ' + url });
        img.src = url;
      });
    }, fileUrl);

    fileData.push({ filename, ...analysis });
  }

  console.log(JSON.stringify(fileData, null, 2));
  await browser.close();
}

main().catch(console.error);
