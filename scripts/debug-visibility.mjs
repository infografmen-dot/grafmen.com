import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto('http://localhost:4321/brief-strony-www/', { waitUntil: 'networkidle' });

  const btnPrevVis = await page.locator('#brief-btn-prev').isVisible();
  const btnNextVis = await page.locator('#brief-btn-next').isVisible();
  const btnSubmitVis = await page.locator('#brief-btn-submit').isVisible();

  const btnSubmitStyle = await page.locator('#brief-btn-submit').evaluate(el => ({
    display: el.style.display,
    computedDisplay: window.getComputedStyle(el).display,
    classes: el.className,
    outerHTML: el.outerHTML
  }));

  console.log('--- INITIAL STATE (STEP 1) ---');
  console.log('btnPrev visible:', btnPrevVis);
  console.log('btnNext visible:', btnNextVis);
  console.log('btnSubmit visible:', btnSubmitVis);
  console.log('btnSubmit info:', btnSubmitStyle);

  // Sprawdź krok 2
  await page.locator('.tile-choice').first().click();
  await page.fill('#company-overview', 'Test company');
  await page.click('#brief-btn-next');
  await page.waitForTimeout(300);

  const step2PrevVis = await page.locator('#brief-btn-prev').isVisible();
  const step2NextVis = await page.locator('#brief-btn-next').isVisible();
  const step2SubmitVis = await page.locator('#brief-btn-submit').isVisible();
  console.log('--- STEP 2 STATE ---');
  console.log('btnPrev visible:', step2PrevVis);
  console.log('btnNext visible:', step2NextVis);
  console.log('btnSubmit visible:', step2SubmitVis);

  await browser.close();
}

run().catch(console.error);
