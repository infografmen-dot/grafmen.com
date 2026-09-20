import { createServer } from 'node:http';
import { readFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4178;
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
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (!extname(urlPath)) urlPath += '/index.html';

  let filePath = join(distDir, urlPath);
  if (!existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }
  res.setHeader('Content-Type', mimeTypes[extname(filePath)] || 'application/octet-stream');
  res.end(readFileSync(filePath));
});

await new Promise(resolve => server.listen(port, resolve));

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const pages = [
  { name: 'home', path: 'index.html' },
  { name: 'o-mnie', path: 'o-mnie/index.html' },
  { name: 'strony-www', path: 'strony-www/index.html' },
  { name: 'branding', path: 'branding/index.html' },
  { name: 'modernizacja', path: 'modernizacja/index.html' }
];

for (const pg of pages) {
  // Desktop
  const pDesk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pDesk.goto(`http://localhost:${port}/${pg.path}`, { waitUntil: 'networkidle' });
  await pDesk.evaluate(() => {
    document.querySelectorAll('.reveal-section').forEach(s => s.classList.add('is-revealed'));
  });
  await pDesk.waitForTimeout(300);
  const deskFile = `docs/screenshots/${pg.name}_desktop_full.png`;
  await pDesk.screenshot({ path: deskFile, fullPage: true });
  copyFileSync(deskFile, join(artifactDir, `${pg.name}_desktop_full.png`));
  await pDesk.close();

  // Mobile
  const pMob = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await pMob.goto(`http://localhost:${port}/${pg.path}`, { waitUntil: 'networkidle' });
  await pMob.evaluate(() => {
    document.querySelectorAll('.reveal-section').forEach(s => s.classList.add('is-revealed'));
  });
  await pMob.waitForTimeout(300);
  const mobFile = `docs/screenshots/${pg.name}_mobile_full.png`;
  await pMob.screenshot({ path: mobFile, fullPage: true });
  copyFileSync(mobFile, join(artifactDir, `${pg.name}_mobile_full.png`));
  await pMob.close();

  console.log(`Saved screenshots for ${pg.name} (desktop & mobile)`);
}

await browser.close();
server.close();
console.log('Finished capturing all screenshots!');
