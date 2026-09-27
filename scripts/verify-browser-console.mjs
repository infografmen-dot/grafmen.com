import { chromium } from 'playwright-core';

async function testConsoleAndNetwork() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console-error', text: msg.text(), url: page.url() });
    }
  });

  page.on('pageerror', err => {
    errors.push({ type: 'page-error', text: err.message, url: page.url() });
  });

  const failedRequests = [];
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  const testRoutes = [
    '/',
    '/portfolio/',
    '/strony-www/',
    '/branding/',
    '/modernizacja/',
    '/o-mnie/',
    '/kontakt/',
    '/blog/',
    '/blog/samo-logo-czy-identyfikacja-wizualna/',
    '/en/',
    '/en/portfolio/',
    '/en/contact/'
  ];

  console.log(`Rozpoczynam test konsoli i sieci dla ${testRoutes.length} stron...`);

  for (const route of testRoutes) {
    const response = await page.goto(`http://localhost:4321${route}`, { waitUntil: 'networkidle' });
    const status = response ? response.status() : 'no response';
    console.log(`[${status}] http://localhost:4321${route}`);
  }

  await browser.close();

  console.log('\n--- WYNIKI TESTÓW PRZEGLĄDARKI ---');
  console.log('Błędy konsoli:', errors.length);
  if (errors.length > 0) {
    console.log(errors);
  }
  console.log('Nieudane żądania sieciowe:', failedRequests.length);
  if (failedRequests.length > 0) {
    console.log(failedRequests);
  }
  if (errors.length === 0 && failedRequests.length === 0) {
    console.log('✅ WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE: 0 błędów w konsoli, 0 błędów sieciowych!');
  }
}

testConsoleAndNetwork().catch(console.error);
