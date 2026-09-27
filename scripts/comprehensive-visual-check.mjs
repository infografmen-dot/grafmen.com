import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const outDir = 'scripts/visual-qa';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

async function runVisualQA() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const results = {
    horizontalScrollChecks: [],
    errorsCaptured: [],
    screenshotsTaken: []
  };

  // Helper to check horizontal scroll
  const checkScroll = async (page, url, vpName) => {
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    results.horizontalScrollChecks.push({ url, viewport: vpName, hasHorizontalScroll: hasScroll });
    if (hasScroll) {
      console.warn(`[WARNING] Horizontal scroll on ${url} at ${vpName}!`);
    }
  };

  console.log('--- 1. Testing Callout Sections Under Packages ---');
  for (const vp of [viewports[1], viewports[3]]) { // 390 and 1440
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const url of ['/strony-www/', '/branding/', '/en/websites/', '/en/branding/']) {
      await page.goto(`http://localhost:4321${url}`, { waitUntil: 'networkidle' });
      await checkScroll(page, url, vp.name);

      const callout = page.locator('.packages-brief-callout');
      if (await callout.count() > 0) {
        await callout.scrollIntoViewIfNeeded();
        const snapPath = path.join(outDir, `callout-${url.replace(/\//g, '_')}-${vp.name}.png`);
        await callout.screenshot({ path: snapPath });
        results.screenshotsTaken.push(snapPath);
      }
    }
    await context.close();
  }

  console.log('--- 2. Testing Brief Strony WWW (PL) All Steps & Error States ---');
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto('http://localhost:4321/brief-strony-www/', { waitUntil: 'networkidle' });
    await checkScroll(page, '/brief-strony-www/', vp.name);

    // Krok 1 initial
    const snapKrok1 = path.join(outDir, `brief-www-step1-${vp.name}.png`);
    await page.screenshot({ path: snapKrok1, fullPage: false });
    results.screenshotsTaken.push(snapKrok1);

    // Sprawdź walidację: kliknij Dalej bez zaznaczenia
    if (vp.name === 'desktop-1440' || vp.name === 'mobile-390') {
      await page.click('#brief-btn-next');
      await page.waitForTimeout(150);
      const snapErr = path.join(outDir, `brief-www-step1-err-${vp.name}.png`);
      await page.screenshot({ path: snapErr, fullPage: false });
      results.screenshotsTaken.push(snapErr);
    }

    // Wypełnij krok 1 poprawnie
    await page.locator('.tile-choice:has-text("Nowa strona internetowa")').click();
    await page.fill('#company-overview', 'Producent mebli biurowych i gabinetowych dla firm.');
    await page.locator('.tile-choice:has-text("Pozyskiwanie zapytań")').click();

    // Przejdź do kroku 2
    await page.click('#brief-btn-next');
    await page.waitForTimeout(200);

    const snapKrok2 = path.join(outDir, `brief-www-step2-${vp.name}.png`);
    await page.screenshot({ path: snapKrok2, fullPage: false });
    results.screenshotsTaken.push(snapKrok2);

    // Zaznacz funkcje w kroku 2
    await page.locator('.tile-choice:has-text("Prezentacja oferty")').click();
    await page.locator('.tile-choice:has-text("Portfolio / realizacje")').click();
    await page.locator('.tile-choice:has-text("Logo / branding")').click();

    // Przejdź do kroku 3
    await page.click('#brief-btn-next');
    await page.waitForTimeout(200);

    const snapKrok3 = path.join(outDir, `brief-www-step3-${vp.name}.png`);
    await page.screenshot({ path: snapKrok3, fullPage: false });
    results.screenshotsTaken.push(snapKrok3);

    // Sprawdź krok 3: wstecz do kroku 2 i z powrotem
    await page.click('#brief-btn-prev');
    await page.waitForTimeout(200);
    // Potwierdź, że opcje w kroku 2 są zachowane
    const isFeaturesPreserved = await page.locator('input[name="features"][value="Prezentacja oferty i usług"]').isChecked();
    if (!isFeaturesPreserved) {
      console.error('ERROR: Features choice not preserved on back button!');
    }
    await page.click('#brief-btn-next');
    await page.waitForTimeout(200);

    // Wypełnij krok 3
    await page.locator('.tile-choice:has-text("W ciągu miesiąca")').click();
    await page.locator('.tile-choice:has-text("3 000 – 6 000 zł")').click();
    await page.fill('#contact-name', 'Anna Nowak');
    await page.fill('#contact-email', 'anna@przyklad.pl');

    // Przejdź do kroku 4 (podsumowanie)
    await page.click('#brief-btn-next');
    await page.waitForTimeout(250);

    const snapKrok4 = path.join(outDir, `brief-www-step4-summary-${vp.name}.png`);
    await page.screenshot({ path: snapKrok4, fullPage: false });
    results.screenshotsTaken.push(snapKrok4);

    await context.close();
  }

  console.log('--- 3. Testing Brief Branding (PL & EN) ---');
  for (const vp of [viewports[1], viewports[3]]) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // PL Branding
    await page.goto('http://localhost:4321/brief-branding/', { waitUntil: 'networkidle' });
    await checkScroll(page, '/brief-branding/', vp.name);
    const snapBrandingPL = path.join(outDir, `brief-branding-step1-${vp.name}.png`);
    await page.screenshot({ path: snapBrandingPL, fullPage: false });
    results.screenshotsTaken.push(snapBrandingPL);

    // EN Branding
    await page.goto('http://localhost:4321/en/brief-branding/', { waitUntil: 'networkidle' });
    await checkScroll(page, '/en/brief-branding/', vp.name);
    const snapBrandingEN = path.join(outDir, `brief-branding-en-step1-${vp.name}.png`);
    await page.screenshot({ path: snapBrandingEN, fullPage: false });
    results.screenshotsTaken.push(snapBrandingEN);

    // EN Website
    await page.goto('http://localhost:4321/en/brief-website/', { waitUntil: 'networkidle' });
    await checkScroll(page, '/en/brief-website/', vp.name);
    const snapWebEN = path.join(outDir, `brief-website-en-step1-${vp.name}.png`);
    await page.screenshot({ path: snapWebEN, fullPage: false });
    results.screenshotsTaken.push(snapWebEN);

    await context.close();
  }

  await browser.close();
  console.log('--- VISUAL QA COMPLETE ---');
  console.log('Total Screenshots:', results.screenshotsTaken.length);
  console.log('Horizontal Scroll Issues:', results.horizontalScrollChecks.filter(c => c.hasHorizontalScroll).length);
  return results;
}

runVisualQA().catch(console.error);
