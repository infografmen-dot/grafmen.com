import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

async function runAuditCheck() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = {
    headerChecks: [],
    cspViolations: [],
    consoleErrors: [],
    pagesTested: [],
    formMockTest: null,
    error404Test: null,
    sitemapCheck: null
  };

  const pagesToTest = [
    { url: 'http://localhost:4321/', name: 'Home PL' },
    { url: 'http://localhost:4321/strony-www/', name: 'Strony WWW PL' },
    { url: 'http://localhost:4321/branding/', name: 'Branding PL' },
    { url: 'http://localhost:4321/brief-strony-www/', name: 'Brief WWW PL' },
    { url: 'http://localhost:4321/brief-branding/', name: 'Brief Branding PL' },
    { url: 'http://localhost:4321/kontakt/', name: 'Kontakt PL' },
    { url: 'http://localhost:4321/portfolio/hiker/', name: 'Portfolio Hiker PL' },
    { url: 'http://localhost:4321/o-mnie/', name: 'O mnie PL' },
    { url: 'http://localhost:4321/polityka-prywatnosci/', name: 'Polityka Prywatności PL' },
    { url: 'http://localhost:4321/en/', name: 'Home EN' },
    { url: 'http://localhost:4321/en/websites/', name: 'Websites EN' },
    { url: 'http://localhost:4321/en/brief-website/', name: 'Brief Website EN' },
    { url: 'http://localhost:4321/en/privacy-policy/', name: 'Privacy Policy EN' }
  ];

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Monitor console errors and CSP violations
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      results.consoleErrors.push({ url: page.url(), text });
      if (text.toLowerCase().includes('content security policy') || text.toLowerCase().includes('violates')) {
        results.cspViolations.push({ url: page.url(), text });
      }
    }
  });

  page.on('pageerror', err => {
    results.consoleErrors.push({ url: page.url(), text: err.message });
  });

  console.log('=== 1. Testing Security Headers and Page Loads ===');
  for (const p of pagesToTest) {
    const res = await page.goto(p.url, { waitUntil: 'networkidle' });
    const status = res.status();
    const headers = res.headers();

    if (results.headerChecks.length === 0) {
      results.headerChecks.push({
        'content-security-policy': headers['content-security-policy'] || 'MISSING',
        'x-content-type-options': headers['x-content-type-options'] || 'MISSING',
        'x-frame-options': headers['x-frame-options'] || 'MISSING',
        'strict-transport-security': headers['strict-transport-security'] || 'MISSING',
        'x-robots-tag': headers['x-robots-tag'] || 'MISSING'
      });
    }

    results.pagesTested.push({ name: p.name, url: p.url, status });
  }

  console.log('=== 2. Testing Form Submission Interception (Mocking Web3Forms) ===');
  await page.goto('http://localhost:4321/brief-branding/', { waitUntil: 'networkidle' });

  let interceptedPayload = null;

  // Intercept Web3Forms API calls
  await page.route('https://api.web3forms.com/submit', async route => {
    const postData = route.request().postData();
    interceptedPayload = postData;
    console.log('Successfully intercepted Web3Forms POST request!');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Submission successful (mocked)' })
    });
  });

  // Step 1
  await page.fill('#brand-name', 'Audyt Test Brand');
  await page.fill('#brand-overview', 'Opis profilu marki testowej');
  await page.click('.tile-choice:has-text("Nowe logo")');
  await page.click('#brief-btn-next');
  await page.waitForTimeout(300);

  // Step 2
  await page.click('.tile-choice:has-text("Internet i social media")');
  await page.click('#brief-btn-next');
  await page.waitForTimeout(300);

  // Step 3
  await page.fill('#contact-name', 'Jan Testowy');
  await page.fill('#contact-email', 'jan@example.com');
  await page.click('#brief-btn-next');
  await page.waitForTimeout(300);

  // Step 4: Summary & Submit
  const submitBtn = page.locator('#brief-btn-submit');
  await submitBtn.click();
  await page.waitForTimeout(600);

  const successScreenVisible = await page.locator('.brief-success-screen').isVisible();
  results.formMockTest = {
    intercepted: !!interceptedPayload,
    successScreenRendered: successScreenVisible
  };

  console.log('Form mock test result:', results.formMockTest);

  console.log('=== 3. Testing 404 Response and Error Page ===');
  const errorRes = await page.goto('http://localhost:4321/non-existing-test-path-12345/', { waitUntil: 'networkidle' });
  results.error404Test = {
    status: errorRes.status(),
    hasErrorMessage: await page.locator('h1, h2, p').first().isVisible()
  };
  console.log('404 Test Result:', results.error404Test);

  console.log('=== 4. Testing Sitemap Output ===');
  const sitemapPath = path.resolve('dist/sitemap-0.xml');
  if (fs.existsSync(sitemapPath)) {
    const content = fs.readFileSync(sitemapPath, 'utf8');
    results.sitemapCheck = {
      contains404: content.includes('404'),
      urlCount: (content.match(/<url>/g) || []).length
    };
  }
  console.log('Sitemap check:', results.sitemapCheck);

  await browser.close();

  console.log('\n=== FINAL SUMMARY RESULTS ===');
  console.log('Total Console Errors:', results.consoleErrors.length);
  console.log('Total CSP Violations:', results.cspViolations.length);
  console.log('Header Checks:', results.headerChecks);
  console.log('All tests finished successfully.');

  fs.writeFileSync('scratch/audit-results.json', JSON.stringify(results, null, 2));
}

runAuditCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
