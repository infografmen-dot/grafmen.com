import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('Starting Playwright automated browser check for English version...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('  [404/Error Resource]:', resp.status(), resp.url());
    }
  });

  // 1. Check Homepage EN
  console.log('1. Checking http://localhost:4321/en/ (Desktop)...');
  await page.goto('http://localhost:4321/en/', { waitUntil: 'networkidle' });
  const titleEn = await page.title();
  const h1En = await page.$eval('.hero h1', el => el.innerText.trim());
  const headerEnLink = await page.$eval('.language-switch a', el => ({ text: el.innerText.trim(), href: el.getAttribute('href') }));
  const footerEnLink = await page.$eval('.footer-lang-switch a', el => ({ text: el.innerText.trim(), href: el.getAttribute('href') }));
  console.log('  Title:', titleEn);
  console.log('  H1:', h1En.replace(/\n+/g, ' '));
  console.log('  Header Lang Switch back to PL:', headerEnLink);
  console.log('  Footer Lang Switch back to PL:', footerEnLink);

  await page.screenshot({ path: 'test-en-home-desktop.png', fullPage: false });

  // 2. Click switch back to PL
  console.log('2. Clicking language switch link back to PL...');
  await page.click('.language-switch a');
  await page.waitForLoadState('networkidle');
  console.log('  Current URL after switch to PL:', page.url());
  const titlePl = await page.title();
  const headerPlLink = await page.$eval('.language-switch a', el => ({ text: el.innerText.trim(), href: el.getAttribute('href') }));
  console.log('  Title PL:', titlePl);
  console.log('  Header Lang Switch to EN:', headerPlLink);

  // 3. Check Websites page EN
  console.log('3. Checking http://localhost:4321/en/websites/ ...');
  await page.goto('http://localhost:4321/en/websites/', { waitUntil: 'networkidle' });
  const webH1 = await page.$eval('.service-hero h1', el => el.innerText.trim());
  const packagesTitle = await page.$eval('#packages-title', el => el.innerText.trim());
  const pkg1Price = await page.$eval('.package-card .package-price', el => el.innerText.trim());
  console.log('  H1:', webH1);
  console.log('  Packages Title:', packagesTitle);
  console.log('  First Package Price:', pkg1Price);
  const webPlSwitch = await page.$eval('.language-switch a', el => el.getAttribute('href'));
  console.log('  Language Switch URL on /en/websites/:', webPlSwitch);

  // 4. Check Contact page EN and form
  console.log('4. Checking http://localhost:4321/en/contact/ ...');
  await page.goto('http://localhost:4321/en/contact/', { waitUntil: 'networkidle' });
  const contactH1 = await page.$eval('.contact-hero h1', el => el.innerText.trim());
  console.log('  Contact H1:', contactH1);

  // Fill in form without actually navigating out
  await page.fill('input[name="name"]', 'John Smith');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Interested in a bespoke bilingual corporate website.');
  
  // Intercept form submit to prevent actual mailto navigation during test
  await page.evaluate(() => {
    const form = document.querySelector('#contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      // Let existing listener run first, then check status
    }, true);
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(100);
  const statusText = await page.$eval('#contact-status', el => el.innerText.trim());
  console.log('  Contact Status message:', statusText);

  // 5. Check Mobile Viewport on /en/
  console.log('5. Checking Mobile Viewport on http://localhost:4321/en/ (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4321/en/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-en-home-mobile.png', fullPage: false });
  console.log('  Mobile screenshot saved.');

  // 6. Check Console Errors
  console.log('\n--- Console Errors Audit ---');
  if (consoleErrors.length === 0) {
    console.log('✓ 0 console errors detected!');
  } else {
    console.log(`Found ${consoleErrors.length} console errors:`, consoleErrors);
  }

  await browser.close();
  console.log('Verification finished successfully.');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
