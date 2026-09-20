import { createServer } from 'node:http';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const port = 4173;
const distDir = resolve('./dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
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

  const ext = extname(filePath);
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.end(readFileSync(filePath));
});

await new Promise(resolve => server.listen(port, resolve));
console.log(`Test server running at http://localhost:${port}`);

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});
const results = { passed: [], failed: [] };

function assert(condition, message) {
  if (condition) {
    results.passed.push(message);
    console.log(`  ✓ ${message}`);
  } else {
    results.failed.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

const norm = (str) => (str || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

try {
  // 1. HOMEPAGE CHECKS
  console.log('\n--- Testowanie Homepage (/) ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'networkidle' });

  // Hero H1
  const h1 = norm(await page.locator('h1').innerText());
  assert(h1.includes('Ty zajmujesz się') && h1.includes('swoją firmą') && h1.includes('Ja dbam o to') && h1.includes('jak ją widać'), 'Hero H1 zgodne z zamrożonym wzorcem');

  // 6 realizacji w portfolio
  const portfolioItems = await page.locator('.portfolio .work').count();
  assert(portfolioItems === 6, `Portfolio zawiera dokładnie 6 realizacji (jest: ${portfolioItems})`);

  // Sprawdzenie cen i kwot na głównej
  // Otwórz wszystkie szczegóły FAQ
  await page.evaluate(() => {
    document.querySelectorAll('details').forEach(d => d.open = true);
  });
  const mainText = await page.locator('main').innerText();
  const hasCurrency = /\d[\d\s]*\s*(?:zł|PLN)/i.test(mainText);
  assert(!hasCurrency, `Brak jakichkolwiek kwot/cen na stronie głównej (w tym w rozwiniętym FAQ)`);

  // Sprawdzenie sekcji Współpraca
  const wspolpracaHeading = await page.locator('#pakiety h2').innerText();
  assert(wspolpracaHeading.includes('Jednorazowy projekt') && wspolpracaHeading.includes('stała współpraca'), 'Sekcja współpraca ma nagłówek "Jednorazowy projekt lub stała współpraca."');

  const links = await page.locator('#pakiety .package-links-row a').all();
  assert(links.length === 2, 'Sekcja współpraca zawiera 2 równorzędne linki do pakietów');
  const href1 = await links[0].getAttribute('href');
  const href2 = await links[1].getAttribute('href');
  assert(href1.includes('strony-www') && href1.includes('#pakiety'), 'Pierwszy link prowadzi do /strony-www/#pakiety');
  assert(href2.includes('branding') && href2.includes('#pakiety'), 'Drugi link prowadzi do /branding/#pakiety');

  // Sprawdzenie opinii
  const testimonialCards = await page.locator('.testimonials-section .testimonial-card').count();
  assert(testimonialCards === 3, `Sekcja opinii zawiera dokładnie 3 opinie (jest: ${testimonialCards})`);
  const oginski = await page.locator('.testimonials-section').innerText();
  assert(oginski.includes('Kazimierz Ogiński') && oginski.includes('Marzena Drabińska') && oginski.includes('Joanna Brzeska'), 'Wszystkie 3 oryginalne nazwiska klientów są obecne');

  // Sprawdzenie FAQ - 4 pytania
  const faqQuestions = await page.locator('.faq-section details').count();
  assert(faqQuestions === 4, `FAQ na głównej zawiera dokładnie 4 pytania (jest: ${faqQuestions})`);

  // Zrzuty ekranu Homepage 1440
  await page.screenshot({ path: 'docs/screenshots/current_home_desktop_1440.png', fullPage: true });
  await page.locator('.hero').screenshot({ path: 'docs/screenshots/current_home_hero_1440.png' });
  await page.locator('#pakiety').screenshot({ path: 'docs/screenshots/current_home_wspolpraca_1440.png' });
  await page.locator('.testimonials-section').screenshot({ path: 'docs/screenshots/current_home_opinie_1440.png' });
  await page.locator('.faq-section').screenshot({ path: 'docs/screenshots/current_home_faq_1440.png' });

  // Mobile 375
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'docs/screenshots/current_home_mobile_375.png', fullPage: true });
  await page.locator('.hero').screenshot({ path: 'docs/screenshots/current_home_hero_375.png' });
  await page.locator('#pakiety').screenshot({ path: 'docs/screenshots/current_home_wspolpraca_375.png' });

  // 2. STRONY-WWW
  console.log('\n--- Testowanie /strony-www/ ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${port}/strony-www/index.html`, { waitUntil: 'networkidle' });
  const wwwH1 = norm(await page.locator('h1').innerText());
  assert(wwwH1.includes('Strony internetowe, które jasno pokazują ofertę'), 'H1 stron WWW zaktualizowany');
  const wwwFeatures = await page.locator('.service-features .service-feature').count();
  assert(wwwFeatures === 3, 'Scalony blok zakresu zawiera 3 pozycje');
  const modLink = await page.locator('.service-features a[href*="modernizacja"]').count();
  assert(modLink === 1, 'Blok zakresu zawiera odnośnik do modernizacji');
  const wwwPackages = await page.locator('.package-card').count();
  assert(wwwPackages === 3, 'Strona WWW zawiera 3 pakiety');
  const wwwFaqCount = await page.locator('details').count();
  assert(wwwFaqCount === 5, `FAQ na stronach WWW zawiera 5 pytań (jest: ${wwwFaqCount})`);
  await page.screenshot({ path: 'docs/screenshots/current_strony_www_desktop.png', fullPage: true });

  // 3. O-MNIE
  console.log('\n--- Testowanie /o-mnie/ ---');
  await page.goto(`http://localhost:${port}/o-mnie/index.html`, { waitUntil: 'networkidle' });
  const aboutH1 = norm(await page.locator('h1').innerText());
  assert(aboutH1.includes('Krzysztof Krawczyk') && aboutH1.includes('od 2005'), 'H1 O mnie zachowany');
  const howIWork = await page.locator('h2:text("Jak pracuję")').count();
  assert(howIWork === 1, 'Sekcja "Jak pracuję" jest obecna');
  const drewmarCase = await page.locator('h2:text("Współpraca, która trwa od lat")').count();
  assert(drewmarCase === 1, 'Sekcja Drewmar jest obecna');
  const drewmarOpinion = await page.locator('.testimonial-card:has-text("Kazimierz Ogiński")').count();
  assert(drewmarOpinion === 1, 'Sekcja Drewmar zawiera 1 opinię Kazimierza Ogińskiego');
  const allOpinions = await page.locator('.testimonial-card').count();
  assert(allOpinions === 1, `Na /o-mnie/ jest tylko jedna opinia (jest: ${allOpinions})`);
  await page.screenshot({ path: 'docs/screenshots/current_o_mnie_desktop.png', fullPage: true });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'docs/screenshots/current_o_mnie_mobile.png', fullPage: true });

  // 4. BRANDING
  console.log('\n--- Testowanie /branding/ ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${port}/branding/index.html`, { waitUntil: 'networkidle' });
  const brandH1 = norm(await page.locator('h1').innerText());
  assert(brandH1.includes('Logo i identyfikacja wizualna'), 'H1 brandingu zaktualizowany');
  const brandPackages = await page.locator('.package-card').count();
  assert(brandPackages === 3, 'Branding zawiera 3 pakiety');
  const motionCallout = norm(await page.locator('.branding-motion-callout').innerText());
  assert(motionCallout.includes('Animacje i wideo') && motionCallout.includes('indywidualnie'), 'Motion callout z informacją o indywidualnej wycenie');
  const brandExamples = await page.locator('.branding-example').count();
  assert(brandExamples === 3, 'Sekcja przykładów zawiera 3 realizacje');
  await page.screenshot({ path: 'docs/screenshots/current_branding_desktop.png', fullPage: true });

  // 5. MODERNIZACJA
  console.log('\n--- Testowanie /modernizacja/ ---');
  await page.goto(`http://localhost:${port}/modernizacja/index.html`, { waitUntil: 'networkidle' });
  const modH1 = norm(await page.locator('h1').innerText());
  assert(modH1.includes('Modernizacja strony internetowej'), 'H1 modernizacji zaktualizowany');
  const whenRebuild = await page.locator('h2:text("Kiedy warto przebudować stronę")').count();
  assert(whenRebuild === 1, 'Sekcja "Kiedy warto przebudować stronę" jest obecna');
  const whatIncluded = await page.locator('h2:text("Co obejmuje modernizacja")').count();
  assert(whatIncluded === 1, 'Sekcja "Co obejmuje modernizacja" jest obecna');
  const priceBlock = norm(await page.locator('.modernisation-callout').innerText());
  assert(priceBlock.includes('od 2 500 zł') && priceBlock.includes('Wycenę przygotuję po sprawdzeniu'), 'Cena od 2 500 zł i harmonogram raz przy wycenie');
  await page.screenshot({ path: 'docs/screenshots/current_modernizacja_desktop.png', fullPage: true });

  console.log('\n=== PODSUMOWANIE TESTÓW ===');
  console.log(`Zaliczone: ${results.passed.length}`);
  console.log(`Niepowodzenia: ${results.failed.length}`);

} finally {
  await browser.close();
  server.close();
}
