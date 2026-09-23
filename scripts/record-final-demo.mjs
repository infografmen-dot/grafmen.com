import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const recordDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\96cfd579-e6ac-4ff4-8ef2-cfb1b5054459\\scratch\\final_demo_video';
fs.mkdirSync(recordDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: recordDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();

  console.log('1. Loading Homepage...');
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Dismiss cookie banner if present
  try {
    const cookieBtn = page.locator('#cookie-accept, .cookie-btn.accept, .cookie-actions button').first();
    if (await cookieBtn.isVisible()) {
      await cookieBtn.click();
      await page.waitForTimeout(500);
    }
  } catch(e) {}

  // A. Demo pozycji menu głównego
  console.log('2. Demonstrating Menu Hover...');
  const navLinks = page.locator('#main-nav a');
  const count = await navLinks.count();
  for (let i = 0; i < count; i++) {
    const link = navLinks.nth(i);
    await link.hover();
    await page.waitForTimeout(600);
  }
  // Hover over header CTA
  const headerQuote = page.locator('.tools .quote');
  if (await headerQuote.isVisible()) {
    await headerQuote.hover();
    await page.waitForTimeout(800);
  }

  // B. Demo Czarnego CTA (Hero)
  console.log('3. Demonstrating Hero Black CTA Hover...');
  const heroCta = page.locator('.hero .actions .btn.dark');
  await heroCta.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await heroCta.hover();
  await page.waitForTimeout(800);
  // Unhover and hover again to show smooth return
  await page.mouse.move(100, 100);
  await page.waitForTimeout(400);
  await heroCta.hover();
  await page.waitForTimeout(800);

  // C. Demo linku czarnego: "Wszystkie realizacje →"
  console.log('4. Demonstrating Black Text Link Hover...');
  const allProjectsLink = page.locator('.portfolio-summary .all');
  if (await allProjectsLink.isVisible()) {
    await allProjectsLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await allProjectsLink.hover();
    await page.waitForTimeout(800);
    await page.mouse.move(100, 100);
    await page.waitForTimeout(400);
  }

  // D. Demo linku pomarańczowego: Drew-Art ("Otwórz stronę Drew-Art ↗")
  console.log('5. Demonstrating Orange Text Link (Drew-Art) Hover...');
  const drewArtCard = page.locator('.work.p5');
  await drewArtCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const drewArtLink = page.locator('.p5 .project-ext-link');
  if (await drewArtLink.isVisible()) {
    await drewArtLink.hover();
    await page.waitForTimeout(800);
    await page.mouse.move(100, 100);
    await page.waitForTimeout(400);
    await drewArtLink.hover();
    await page.waitForTimeout(800);
  }

  // E. Demo wejścia formularza na /kontakt/
  console.log('6. Navigating to /kontakt/ and demonstrating Scroll Reveal...');
  await page.goto('http://localhost:4321/kontakt/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Scroll smoothly down to contact section
  await page.evaluate(() => {
    window.scrollTo({ top: 350, behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  // Focus into form to test focus handling
  const nameInput = page.locator('#c-name');
  if (await nameInput.isVisible()) {
    await nameInput.focus();
    await page.waitForTimeout(800);
  }

  console.log('Finished demo interactions, finalizing video...');
  await page.waitForTimeout(1000);

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    console.log('Demo video recorded successfully at:', videoPath);
  }
}

run().catch(err => {
  console.error('Error during demo recording:', err);
  process.exit(1);
});
