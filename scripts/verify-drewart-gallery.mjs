import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }
  const filePath = path.join(distDir, pathname.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2'
    };
    const body = fs.readFileSync(filePath);
    await route.fulfill({
      status: 200,
      contentType: contentTypeMap[ext] || 'application/octet-stream',
      body
    });
  } else {
    await route.continue();
  }
});

await page.goto('https://grafmen.local/portfolio/katalog-drew-art/', { waitUntil: 'networkidle' });

const galleryEl = await page.$('.project-gallery-section');
if (galleryEl) {
  await galleryEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

const galleryImages = await page.$$eval('.project-gallery img', imgs => imgs.map(img => ({
  src: img.src,
  alt: img.alt,
  naturalWidth: img.naturalWidth,
  naturalHeight: img.naturalHeight,
  displayedWidth: img.clientWidth,
  displayedHeight: img.clientHeight
})));

console.log('Gallery images found:', galleryImages.length);
console.log(JSON.stringify(galleryImages, null, 2));

if (galleryEl) {
  await galleryEl.screenshot({ path: 'scripts/verify-drewart-gallery.png' });
  console.log('Screenshot saved to scripts/verify-drewart-gallery.png');
}

await browser.close();
