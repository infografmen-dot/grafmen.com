import { chromium } from 'playwright-core';

async function checkNetwork() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();

  page.on('request', req => {
    if (req.url().includes('api') || req.url().includes('keystatic')) {
      console.log('REQ:', req.method(), req.url());
    }
  });

  page.on('response', async res => {
    if (res.url().includes('api') || res.url().includes('keystatic')) {
      console.log('RES:', res.status(), res.url(), res.headers()['content-type']);
      if (res.status() !== 200) {
        try {
          const text = await res.text();
          console.log('RES BODY (err):', text.slice(0, 200));
        } catch (e) {}
      }
    }
  });

  console.log('Navigating to /keystatic/ ...');
  await page.goto('http://127.0.0.1:4321/keystatic/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Clicking Artykuły Bloga...');
  await page.click('text=Artykuły Bloga');
  await page.waitForTimeout(2000);

  await browser.close();
}

checkNetwork().catch(console.error);
