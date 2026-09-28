import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const screenshotsDir = path.resolve('public/test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runTests() {
  console.log('--- Rozpoczynam pełne testy Keystatic CMS i podglądu ---');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Dashboard
  await page.goto('http://127.0.0.1:4321/keystatic/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, '01_keystatic_dashboard.png'), fullPage: true });

  // 2. Collection list
  await page.click('text=Artykuły Bloga');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '02_keystatic_blog_list.png'), fullPage: true });

  // 3. Existing article
  const existingItem = page.locator('text=samo-logo-czy-identyfikacja-wizualna').or(page.locator('text=Samo logo czy identyfikacja')).first();
  if (await existingItem.isVisible()) {
    await existingItem.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '03_keystatic_existing_article.png'), fullPage: true });
  }

  // 4. Draft preview on desktop with scroll
  console.log('Sprawdzam podgląd artykułu-szkicu...');
  await page.goto('http://127.0.0.1:4321/blog/jak-przygotowac-brief-na-strone-www/', { waitUntil: 'networkidle' });
  // Scroll down to trigger scrollTrigger animations
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 2);
    await new Promise(r => setTimeout(r, 400));
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 400));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '05_draft_preview_desktop.png'), fullPage: true });

  // 5. Mobile draft preview
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:4321/blog/jak-przygotowac-brief-na-strone-www/', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 2);
    await new Promise(r => setTimeout(r, 400));
    window.scrollTo(0, 0);
  });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, '06_draft_preview_mobile.png'), fullPage: true });

  await browser.close();
  console.log('--- Zakończono pomyślnie i zapisano zaktualizowane zrzuty ekranu ---');
}

runTests().catch(console.error);
