import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const port = 4198;
const distDir = resolve('./dist');
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\61316bef-67f2-4e99-9282-5633b779d76d';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4'
};

const server = createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
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
console.log('Server running on port', port);

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true
});

const slugs = [
  'drewmax', 'szkola-best', 'hiker', 'drew-art', 'jd-ubezpieczenia',
  'katalog-drew-art', 'montessori', 'piworob', 'katalog-drewmar', 'ja-i-moj-biznes',
  'gazetka-drewmar', 'self-invest', 'unitrans-katalog', 'mpec-przemysl', 'te-solutions',
  'kancelaria-lampa', 'broszura-pervita24', 'gearexpert', 'katalog-targowy-drewmar', 'pobudka'
];

const mobileWidths = [320, 360, 390, 430, 768];

console.log('=== 1. AUDYT WSZYSTKICH 20 PODSTRON PORTFOLIO ===');
const projectAuditResults = [];

for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${port}/portfolio/${slug}/`, { waitUntil: 'domcontentloaded', timeout: 8000 });
  await page.waitForTimeout(150);

  const pageData = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText.trim();
    const kicker = document.querySelector('.project-heading .home-kicker')?.innerText.trim();
    const cover = document.querySelector('.project-cover img');
    const coverSrc = cover?.getAttribute('src');
    const coverPriority = cover?.getAttribute('fetchpriority');
    const galleryItems = Array.from(document.querySelectorAll('.project-gallery figure'));
    const verticalItems = Array.from(document.querySelectorAll('.project-gallery figure.gallery-item-vertical'));
    const ytFacade = document.querySelector('.youtube-facade');
    const prevLink = document.querySelector('.project-next a[rel="prev"]');
    const nextLink = document.querySelector('.project-next a[rel="next"]');
    const allLink = document.querySelector('.project-next a[href="/portfolio/"]');
    const scopeList = Array.from(document.querySelectorAll('.scope-list li')).map(li => li.innerText.trim());

    return {
      h1,
      kicker,
      coverSrc,
      coverPriority,
      galleryCount: galleryItems.length,
      verticalCount: verticalItems.length,
      hasYt: Boolean(ytFacade),
      prevText: prevLink?.innerText.trim(),
      prevHref: prevLink?.getAttribute('href'),
      nextText: nextLink?.innerText.trim(),
      nextHref: nextLink?.getAttribute('href'),
      hasAllLink: Boolean(allLink),
      scopeCount: scopeList.length,
      hasHorizScroll: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  const mobileOverflows = [];
  for (const w of mobileWidths) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(50);
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (hasScroll) mobileOverflows.push(w);
  }

  projectAuditResults.push({
    slug,
    title: pageData.h1,
    coverSrc: pageData.coverSrc,
    galleryCount: pageData.galleryCount,
    verticalCount: pageData.verticalCount,
    hasYt: pageData.hasYt,
    prevHref: pageData.prevHref,
    nextHref: pageData.nextHref,
    mobileOverflows: mobileOverflows.length > 0 ? mobileOverflows.join(',') : 'none',
  });

  console.log(`[${i+1}/20] ${slug}: title="${pageData.h1}", gallery=${pageData.galleryCount}, vertical=${pageData.verticalCount}, overflow=${mobileOverflows.length ? mobileOverflows.join(',') : 'none'}`);
  await page.close();
}

console.log('=== 2. AUDYT GŁÓWNYCH STRON SERWISU ===');
const mainPages = [
  { name: 'home', url: '' },
  { name: 'strony-www', url: 'strony-www/' },
  { name: 'branding', url: 'branding/' },
  { name: 'modernizacja', url: 'modernizacja/' },
  { name: 'o-mnie', url: 'o-mnie/' },
  { name: 'kontakt', url: 'kontakt/' },
  { name: 'portfolio-list', url: 'portfolio/' },
  { name: 'blog', url: 'blog/' },
  { name: 'article', url: 'blog/samo-logo-czy-identyfikacja-wizualna/' }
];

const mainPageResults = [];

for (const p of mainPages) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${port}/${p.url}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
  await page.waitForTimeout(150);

  const overflows = [];
  for (const w of [1440, ...mobileWidths]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(50);
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (hasScroll) overflows.push(w);
  }

  mainPageResults.push({
    name: p.name,
    url: p.url,
    overflows: overflows.length > 0 ? overflows.join(',') : 'none'
  });

  console.log(`[MAIN] ${p.name}: overflow=${overflows.length ? overflows.join(',') : 'none'}`);
  await page.close();
}

console.log('=== 3. WYKONYWANIE REPREZENTATYWNYCH ZRZUTÓW EKRANU ===');
const screenshotsToTake = [
  { name: 'portfolio_index_desktop', url: 'portfolio/', width: 1440, height: 900, full: false },
  { name: 'portfolio_index_mobile_360', url: 'portfolio/', width: 360, height: 800, full: false },
  { name: 'project_drewmax_desktop', url: 'portfolio/drewmax/', width: 1440, height: 900, full: false },
  { name: 'project_hiker_film_desktop', url: 'portfolio/hiker/#film', width: 1440, height: 900, full: false },
  { name: 'project_hiker_mobile_390', url: 'portfolio/hiker/', width: 390, height: 844, full: false },
  { name: 'project_drew_art_vertical', url: 'portfolio/drew-art/', width: 1440, height: 900, full: false },
  { name: 'project_unitrans_rollup_vertical', url: 'portfolio/unitrans-katalog/', width: 1440, height: 900, full: false },
  { name: 'project_szkola_best_mobile_320', url: 'portfolio/szkola-best/', width: 320, height: 700, full: false },
  { name: 'project_montessori_mobile_390', url: 'portfolio/montessori/', width: 390, height: 844, full: false },
  { name: 'blog_index_desktop', url: 'blog/', width: 1440, height: 900, full: false },
  { name: 'blog_index_mobile_390', url: 'blog/', width: 390, height: 844, full: false },
  { name: 'blog_article_desktop', url: 'blog/samo-logo-czy-identyfikacja-wizualna/', width: 1440, height: 900, full: false },
  { name: 'blog_article_mobile_360', url: 'blog/samo-logo-czy-identyfikacja-wizualna/', width: 360, height: 780, full: false }
];

for (const sc of screenshotsToTake) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: sc.width, height: sc.height });
  await page.goto(`http://localhost:${port}/${sc.url}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
  await page.waitForTimeout(200);
  const outPath = join(artifactDir, `${sc.name}.png`);
  await page.screenshot({ path: outPath, fullPage: sc.full });
  console.log('Saved screenshot:', sc.name + '.png');
  await page.close();
}

await browser.close();
server.close();
console.log('ALL AUDITS AND SCREENSHOTS COMPLETED SUCCESSFULLY!');
