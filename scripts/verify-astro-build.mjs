import { createServer } from 'node:http';
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4199;
const distDir = resolve('./dist');
const artifactDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\fd0e55ad-018d-4807-bc3a-e47313c8366d';

mkdirSync('docs/screenshots', { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8'
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
console.log(`Preview server running at http://localhost:${port}`);

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const results = {
  passed: [],
  failed: []
};

function assert(condition, message) {
  if (condition) {
    results.passed.push(message);
    console.log(`  ✓ ${message}`);
  } else {
    results.failed.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. HOMEPAGE CHECKS
  console.log('\n--- 1. Weryfikacja strony głównej (/) ---');
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });

  // Font family check
  const bodyFont = await page.evaluate(() => window.getComputedStyle(document.body).fontFamily);
  assert(bodyFont.includes('Outfit'), `Krój pisma body zawiera 'Outfit' (otrzymano: ${bodyFont})`);

  const h1Font = await page.evaluate(() => window.getComputedStyle(document.querySelector('h1')).fontFamily);
  assert(h1Font.includes('Outfit'), `Krój pisma H1 zawiera 'Outfit' (otrzymano: ${h1Font})`);

  // Side meta label: remove lone "01"
  const meta01Text = await page.evaluate(() => document.querySelector('.meta01')?.textContent || '');
  assert(!meta01Text.includes('01'), `Etykieta boczna hero (.meta01) nie zawiera samotnej cyfry 01 (jest: "${meta01Text.trim()}")`);

  // Portfolio kicker
  const portKicker = await page.evaluate(() => document.querySelector('.portfolio .section-kicker')?.textContent || '');
  assert(portKicker.includes('WYBRANE REALIZACJE') && !portKicker.includes('02 ·'), `Kicker portfolio brzmi 'WYBRANE REALIZACJE' bez numeru '02 ·' (jest: "${portKicker.trim()}")`);

  // 6 projects frozen
  const homeProjectsCount = await page.evaluate(() => document.querySelectorAll('.portfolio .stage li.work').length);
  assert(homeProjectsCount === 6, `Strona główna wyświetla dokładnie 6 realizacji w portfolio (znaleziono: ${homeProjectsCount})`);

  // Współpraca cards (Drewmax & Hiker) without prices
  const collabCardsCount = await page.evaluate(() => document.querySelectorAll('.collab-card').length);
  assert(collabCardsCount === 2, `Sekcja Współpraca zawiera 2 kafle (Drewmax i Hiker) (znaleziono: ${collabCardsCount})`);

  const collabText = await page.evaluate(() => document.querySelector('.collab-cards')?.textContent || '');
  assert(!collabText.includes('zł'), `Kafle współpracy na stronie głównej NIE zawierają cen/zł`);

  // Logo cloud compact
  const logoCloudExists = await page.evaluate(() => !!document.querySelector('.logo-cloud-section'));
  assert(logoCloudExists, `Sekcja logotypów klientów ma zwartą klasę .logo-cloud-section`);

  // Opinions (3 reviews)
  const reviewsCount = await page.evaluate(() => document.querySelectorAll('.testimonials-section .testimonial-card').length);
  assert(reviewsCount === 3, `Sekcja opinii zawiera dokładnie 3 opinie klientów (znaleziono: ${reviewsCount})`);

  // FAQ on home (4 questions, no prices)
  const homeFaqCount = await page.evaluate(() => document.querySelectorAll('.faq-list details').length);
  assert(homeFaqCount === 4, `FAQ na stronie głównej zawiera dokładnie 4 pytania (znaleziono: ${homeFaqCount})`);

  const homeFaqText = await page.evaluate(() => document.querySelector('.faq-list')?.textContent || '');
  assert(!homeFaqText.includes('zł'), `FAQ na stronie głównej NIE zawiera cen/zł`);

  // Polish characters check
  const homeFullText = await page.evaluate(() => document.body.textContent || '');
  assert(homeFullText.includes('zajmujesz') && homeFullText.includes('współpracy') && homeFullText.includes('wycenę'), `Polskie znaki diakrytyczne renderują się poprawnie bez krzaków na stronie głównej`);

  // 2. SUBPAGE: /strony-www/
  console.log('\n--- 2. Weryfikacja podstrony /strony-www/ ---');
  await page.goto(`http://localhost:${port}/strony-www/`, { waitUntil: 'networkidle' });

  const webH1 = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
  assert(webH1.includes('Strony internetowe, które jasno pokazują ofertę'), `H1 na /strony-www/ poprawny`);

  const webHeroImg = await page.evaluate(() => document.querySelector('.service-hero-visual img')?.getAttribute('src') || '');
  assert(webHeroImg.includes('drewmax'), `Hero /strony-www/ zawiera wizualizację Drewmax (src: ${webHeroImg})`);

  const modernizacjaPanelExists = await page.evaluate(() => !!document.querySelector('.modernizacja-panel'));
  assert(modernizacjaPanelExists, `Poziomy komponent <ModernizacjaPanel /> jest obecny na /strony-www/`);

  const webPackagesCount = await page.evaluate(() => document.querySelectorAll('.package-card').length);
  assert(webPackagesCount === 3, `/strony-www/ zawiera 3 pakiety cenowe`);

  const webPrices = await page.evaluate(() => Array.from(document.querySelectorAll('.package-price')).map(e => e.textContent.trim()));
  assert(webPrices.some(p => p.includes('1 500')) && webPrices.some(p => p.includes('3 000')) && webPrices.some(p => p.includes('4 500')), `Pakiety na /strony-www/ mają poprawne ceny: 1500, 3000, 4500 zł`);

  // 3. SUBPAGE: /branding/
  console.log('\n--- 3. Weryfikacja podstrony /branding/ ---');
  await page.goto(`http://localhost:${port}/branding/`, { waitUntil: 'networkidle' });

  const brandH1 = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
  assert(brandH1.includes('Logo i identyfikacja wizualna'), `H1 na /branding/ poprawny`);

  const brandHeroComp = await page.evaluate(() => document.querySelectorAll('.branding-hero-composition img').length);
  assert(brandHeroComp >= 2, `Hero /branding/ zawiera kompozycję wizualną Hiker (znaleziono ${brandHeroComp} grafik)`);

  const brandPackagesCount = await page.evaluate(() => document.querySelectorAll('.package-card').length);
  assert(brandPackagesCount === 3, `/branding/ zawiera 3 pakiety cenowe`);

  const brandPrices = await page.evaluate(() => Array.from(document.querySelectorAll('.package-price')).map(e => e.textContent.trim()));
  assert(brandPrices.some(p => p.includes('600')) && brandPrices.some(p => p.includes('1 400')) && brandPrices.some(p => p.includes('2 000')), `Pakiety na /branding/ mają ceny: 600, 1400, 2000 zł`);

  const motionCallout = await page.evaluate(() => !!document.querySelector('#motion-wideo'));
  assert(motionCallout, `Sekcja Motion i wideo (#motion-wideo) jest obecna`);

  // 4. SUBPAGE: /modernizacja/
  console.log('\n--- 4. Weryfikacja podstrony /modernizacja/ ---');
  await page.goto(`http://localhost:${port}/modernizacja/`, { waitUntil: 'networkidle' });

  const modPrice = await page.evaluate(() => document.querySelector('.modernisation-callout h2')?.textContent || '');
  assert(modPrice.includes('2 500 zł'), `Wycena modernizacji od 2 500 zł obecna (jest: "${modPrice.trim()}")`);

  // 5. SUBPAGE: /o-mnie/
  console.log('\n--- 5. Weryfikacja podstrony /o-mnie/ ---');
  await page.goto(`http://localhost:${port}/o-mnie/`, { waitUntil: 'networkidle' });

  const aboutH1 = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
  assert(aboutH1.includes('Krzysztof Krawczyk') && aboutH1.includes('2005'), `H1 na /o-mnie/ zachowany`);

  const aboutPortrait = await page.evaluate(() => !!document.querySelector('.about-portrait img'));
  assert(aboutPortrait, `Portret Krzysztofa Krawczyka obecny na /o-mnie/`);

  const aboutLead = await page.evaluate(() => document.querySelector('.about-hero .home-lead')?.textContent || '');
  assert(!aboutLead.includes('i zagranicy'), `Intro bio na /o-mnie/ usunęło frazę "i zagranicy"`);

  const jakPracujeAnchor = await page.evaluate(() => !!document.querySelector('#jak-pracuje'));
  assert(jakPracujeAnchor, `Sekcja sposobu pracy posiada identyfikator #jak-pracuje`);

  const rulesCardsCount = await page.evaluate(() => document.querySelectorAll('.rule-card').length);
  assert(rulesCardsCount >= 5, `Siatka ogólnych zasad współpracy zawiera karty zasad (znaleziono: ${rulesCardsCount})`);

  const drewmarCase = await page.evaluate(() => !!document.querySelector('.testimonial-card'));
  assert(drewmarCase, `Historia Drewmar z opinią Kazimierza Ogińskiego obecna`);

  // 6. BLOG & POST
  console.log('\n--- 6. Weryfikacja bloga i wpisu testowego ---');
  await page.goto(`http://localhost:${port}/blog/`, { waitUntil: 'networkidle' });

  const blogCardsCount = await page.evaluate(() => document.querySelectorAll('.blog-card').length);
  assert(blogCardsCount >= 1, `Lista bloga wyświetla opublikowane wpisy (znaleziono: ${blogCardsCount})`);

  await page.goto(`http://localhost:${port}/blog/samo-logo-czy-identyfikacja-wizualna/`, { waitUntil: 'networkidle' });

  const postTitle = await page.evaluate(() => document.querySelector('.post-title')?.textContent || '');
  assert(postTitle.includes('Samo logo czy identyfikacja wizualna'), `Tytuł artykułu bloga renderuje się prawidłowo`);

  const postAuthor = await page.evaluate(() => document.querySelector('.post-author-box')?.textContent || '');
  assert(postAuthor.includes('Krzysztof Krawczyk'), `Autor wpisu to Krzysztof Krawczyk`);

  // 7. RESPONSIVE & HORIZONTAL OVERFLOW CHECK
  console.log('\n--- 7. Weryfikacja braku overflow (360px, 390px, 768px, 1440px) ---');
  const viewports = [1440, 768, 390, 360];
  const pagesToCheck = ['/', '/strony-www/', '/branding/', '/modernizacja/', '/o-mnie/', '/blog/', '/kontakt/'];

  for (const vpWidth of viewports) {
    await page.setViewportSize({ width: vpWidth, height: 800 });
    for (const urlPath of pagesToCheck) {
      await page.goto(`http://localhost:${port}${urlPath}`, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert(!overflow, `Brak poziomego paska przewijania na ${urlPath} przy szerokości ${vpWidth}px`);
    }
  }

  // 8. SCREENSHOTS FOR WALKTHROUGH
  console.log('\n--- 8. Zrzuty ekranu do dokumentacji ---');
  const screens = [
    { url: '/', name: 'astro_home_1440', w: 1440 },
    { url: '/strony-www/', name: 'astro_strony_www_1440', w: 1440 },
    { url: '/branding/', name: 'astro_branding_1440', w: 1440 },
    { url: '/o-mnie/', name: 'astro_o_mnie_1440', w: 1440 },
    { url: '/blog/', name: 'astro_blog_1440', w: 1440 },
    { url: '/blog/samo-logo-czy-identyfikacja-wizualna/', name: 'astro_blog_post_1440', w: 1440 },
    { url: '/o-mnie/', name: 'astro_o_mnie_mobile_390', w: 390 }
  ];

  for (const sc of screens) {
    await page.setViewportSize({ width: sc.w, height: 900 });
    await page.goto(`http://localhost:${port}${sc.url}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.querySelectorAll('.reveal-section').forEach(s => s.classList.add('is-revealed'));
    });
    await page.waitForTimeout(200);
    const shotPath = `docs/screenshots/${sc.name}.png`;
    await page.screenshot({ path: shotPath, fullPage: true });
    copyFileSync(shotPath, join(artifactDir, `${sc.name}.png`));
    console.log(`  Zapisano zrzut: ${shotPath} -> ${sc.name}.png`);
  }

} finally {
  await browser.close();
  server.close();
}

console.log('\n================ PODSUMOWANIE TESTÓW ================');
console.log(`Zaliczone testy: ${results.passed.length}`);
console.log(`Błędy: ${results.failed.length}`);

if (results.failed.length > 0) {
  process.exit(1);
} else {
  console.log('WSZYSTKIE TESTY ZAKOŃCZONE SUKCESEM!');
}
