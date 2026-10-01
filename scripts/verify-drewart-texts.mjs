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
await page.waitForTimeout(500);

// Zrzut sekcji ZAKRES
const scopeEl = await page.$('.project-scope');
if (scopeEl) {
  await scopeEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await scopeEl.screenshot({ path: 'scripts/verify-scope.png' });
  console.log('Saved scripts/verify-scope.png');
}

// Zrzut sekcji REZULTAT
const resultHeading = await page.$('p.home-kicker:has-text("REZULTAT")');
if (resultHeading) {
  const sectionEl = await resultHeading.evaluateHandle(el => el.closest('section'));
  if (sectionEl) {
    await sectionEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await sectionEl.screenshot({ path: 'scripts/verify-result.png' });
    console.log('Saved scripts/verify-result.png');
  }
}

// Sprawdź tekst podpisów w galerii
const captions = await page.$$eval('.project-gallery figcaption', els => els.map(e => e.innerText.trim()));
console.log('Gallery captions:', captions);

// Sprawdź pozycje w zakresie
const scopeItems = await page.$$eval('.project-scope .scope-list li', els => els.map(e => e.innerText.trim()));
console.log('Scope items:', scopeItems);

await browser.close();
