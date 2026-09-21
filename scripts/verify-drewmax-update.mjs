import { createServer } from 'node:http';
import { readFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4197;
const distDir = resolve('./dist');
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\fd0e55ad-018d-4807-bc3a-e47313c8366d';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (!extname(urlPath)) urlPath += '/index.html';

  let filePath = join(distDir, urlPath);
  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found: ' + filePath);
    return;
  }
  res.setHeader('Content-Type', mimeTypes[extname(filePath)] || 'application/octet-stream');
  res.end(readFileSync(filePath));
});

await new Promise(r => server.listen(port, r));
console.log(`Preview server running at http://localhost:${port}`);

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://localhost:${port}/portfolio/drewmax/`, { waitUntil: 'networkidle' });

  // 1. Kickers check (no 01, 02, 03, 04 or dots)
  const kickers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.home-section .home-kicker')).map(el => el.textContent.trim());
  });
  console.log('Kickers:', kickers);

  // 2. Lead description check
  const leadDesc = await page.evaluate(() => document.querySelector('.project-heading .home-lead')?.textContent.trim());
  console.log('Lead description:', leadDesc);

  // 3. Deliverables check
  const deliverables = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.scope-list li')).map(el => el.textContent.trim());
  });
  console.log('Deliverables:', deliverables);

  // 4. Gallery headings count
  const galleryHeadings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.project-gallery-section h2')).map(el => el.textContent.trim());
  });
  console.log('Gallery headings:', galleryHeadings);

  // 5. Gallery images check
  const galleryImages = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.project-gallery figure img')).map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      loading: img.getAttribute('loading'),
      width: img.getAttribute('width'),
      height: img.getAttribute('height')
    }));
  });
  console.log('Gallery images:', JSON.stringify(galleryImages, null, 2));

  // 6. Result copy check
  const resultCopy = await page.evaluate(() => document.querySelectorAll('.home-section')[3]?.querySelector('.bio-copy p')?.textContent.trim());
  console.log('Result copy:', resultCopy);

  // 7. Overflow check at 1440, 768, 390, 360
  for (const w of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width: w, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Overflow at ${w}px:`, overflow ? 'YES (ERROR)' : 'NO (OK)');
  }

  // 8. Screenshots
  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${port}/portfolio/drewmax/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('.reveal-section').forEach(s => s.classList.add('is-revealed'));
  });
  await page.waitForTimeout(300);
  const deskPath = 'docs/screenshots/drewmax_desktop_after.png';
  await page.screenshot({ path: deskPath, fullPage: true });
  copyFileSync(deskPath, join(artifactDir, 'drewmax_desktop_after.png'));
  console.log('Saved desktop screenshot:', deskPath);

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`http://localhost:${port}/portfolio/drewmax/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('.reveal-section').forEach(s => s.classList.add('is-revealed'));
  });
  await page.waitForTimeout(300);
  const mobPath = 'docs/screenshots/drewmax_mobile_390_after.png';
  await page.screenshot({ path: mobPath, fullPage: true });
  copyFileSync(mobPath, join(artifactDir, 'drewmax_mobile_390_after.png'));
  console.log('Saved mobile screenshot:', mobPath);

} finally {
  await browser.close();
  server.close();
}
