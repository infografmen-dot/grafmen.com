import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\2d8b0158-30f5-401b-a173-32a9b1f8bbfb';
const baseUrl = 'http://localhost:4321';

async function run() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  console.log('🚀 Browser launched.');

  // ==========================================
  // TEST 1: HERO PAUSE BUTTON
  // ==========================================
  console.log('\n--- TEST 1: HERO PAUSE BUTTON ---');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  // Wait for video/button to initialize
  await page.waitForTimeout(800);

  const btn = page.locator('#hero-cubes-pause');
  const isVisible = await btn.isVisible();
  console.log('Pause button visible at 1440px:', isVisible);

  if (isVisible) {
    const box = await btn.boundingBox();
    console.log(`Button bounding box: width=${box.width}px, height=${box.height}px, x=${box.x}, y=${box.y}`);

    const styles = await btn.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return {
        background: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        border: cs.border,
        display: cs.display,
        color: cs.color,
        svgWidth: el.querySelector('svg')?.getAttribute('width'),
        svgHeight: el.querySelector('svg')?.getAttribute('height')
      };
    });
    console.log('Button computed styles:', styles);

    const initialAria = await btn.getAttribute('aria-label');
    const initialTitle = await btn.getAttribute('title');
    console.log(`Initial aria-label: "${initialAria}", title: "${initialTitle}"`);

    // Click pause
    await btn.click();
    await page.waitForTimeout(200);
    const pausedAria = await btn.getAttribute('aria-label');
    const pausedTitle = await btn.getAttribute('title');
    const pausedPressed = await btn.getAttribute('aria-pressed');
    console.log(`Paused: aria-label="${pausedAria}", title="${pausedTitle}", aria-pressed="${pausedPressed}"`);

    // Click resume
    await btn.click();
    await page.waitForTimeout(200);
    const resumedAria = await btn.getAttribute('aria-label');
    console.log(`Resumed: aria-label="${resumedAria}"`);

    // Screenshot of pause button in context
    const heroSec = page.locator('#hero-section');
    await heroSec.screenshot({ path: path.join(outputDir, 'hero-pause-button.png') });
    console.log('📸 Saved hero-pause-button.png');

    // Test breakpoints for collisions
    for (const w of [1200, 1280, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(200);
      const bBox = await btn.boundingBox();
      const metaBox = await page.locator('.meta01').boundingBox();
      const bottomBox = await page.locator('.hero-bottom').boundingBox();
      console.log(`At ${w}px: Button y=${bBox?.y?.toFixed(1)}, Meta bottom=${(metaBox?.y + metaBox?.height)?.toFixed(1)}, Hero-bottom y=${bottomBox?.y?.toFixed(1)}`);
      if (bBox && bottomBox) {
        const overlapBottom = (bBox.y + bBox.height) > bottomBox.y && bBox.y < (bottomBox.y + bottomBox.height);
        console.log(`  -> Overlap with hero-bottom: ${overlapBottom ? 'COLLISION!' : 'OK (No collision)'}`);
      }
    }

    // Test mobile breakpoint (< 1200px)
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.waitForTimeout(200);
    const mobDisplay = await btn.evaluate(el => window.getComputedStyle(el).display);
    console.log(`At 1100px (tablet/mobile): display=${mobDisplay} (expected 'none')`);
  } else {
    console.error('ERROR: #hero-cubes-pause not visible!');
  }
  await page.close();

  // Test prefers-reduced-motion for Hero
  const prmPage = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });
  await prmPage.emulateMedia({ reducedMotion: 'reduce' });
  await prmPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await prmPage.waitForTimeout(400);
  const prmBtnVisible = await prmPage.locator('#hero-cubes-pause').isVisible();
  console.log('Pause button with prefers-reduced-motion:reduce is visible:', prmBtnVisible, '(expected false)');
  await prmPage.close();

  // ==========================================
  // TEST 2: ANIMACJA GŁÓWNYCH NAGŁÓWKÓW 6 PODSTRON
  // ==========================================
  console.log('\n--- TEST 2: ANIMACJA GŁÓWNYCH NAGŁÓWKÓW 6 PODSTRON ---');
  const subpages = [
    { name: 'Strony WWW', path: '/strony-www/', expectedText: 'Strony internetowe, które jasno pokazują ofertę Twojej firmy.' },
    { name: 'Branding', path: '/branding/', expectedText: 'Logo i identyfikacja wizualna dla Twojej firmy.' },
    { name: 'Portfolio', path: '/portfolio/', expectedText: 'Realizacje, które zatrzymują uwagę.' },
    { name: 'O mnie', path: '/o-mnie/', expectedText: 'Krzysztof Krawczyk. Twój grafik, od 2005.' },
    { name: 'Blog', path: '/blog/', expectedText: 'O projektowaniu stron i wizerunku firm.' },
    { name: 'Kontakt', path: '/kontakt/', expectedText: 'Opowiedz mi o swoim projekcie.' }
  ];

  for (const sp of subpages) {
    console.log(`\nTesting ${sp.name} (${sp.path})...`);
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`${baseUrl}${sp.path}`, { waitUntil: 'domcontentloaded' });

    // Selector matching both .service-hero h1 and .portfolio-head h1
    const h1 = p.locator('.service-hero h1, .portfolio-head h1').first();
    await h1.waitFor({ state: 'attached', timeout: 5000 });

    // Check during or right after animation
    await p.waitForTimeout(100);
    const ariaLabel = await h1.getAttribute('aria-label');
    console.log(`  aria-label: "${ariaLabel}" (matches expected: ${ariaLabel?.includes(sp.expectedText.slice(0, 15))})`);

    // Wait for animation to finish (~0.85s)
    await p.waitForTimeout(1000);

    const isVisible = await h1.isVisible();
    const finalHtml = await h1.innerHTML();
    const computedOpacity = await h1.evaluate(el => window.getComputedStyle(el).opacity);
    const plainText = (await h1.textContent()).replace(/\s+/g, ' ').trim();

    console.log(`  Visible: ${isVisible}, Opacity: ${computedOpacity}`);
    console.log(`  Final Text: "${plainText}"`);
    console.log(`  Clean HTML restored: ${!finalHtml.includes('hero-wipe-brand') ? 'YES' : 'NO'}`);

    // Screenshot of the subpage hero
    const filename = `subpage-${sp.path.replace(/\//g, '') || 'home'}.png`;
    const heroSection = p.locator('.service-hero, .portfolio-head').first();
    await heroSection.screenshot({ path: path.join(outputDir, filename) });
    console.log(`  📸 Screenshot saved: ${filename}`);

    await p.close();
  }

  // Test reduced motion on subpage
  console.log('\nTesting subpage with prefers-reduced-motion:reduce (/branding/)...');
  const rmPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await rmPage.emulateMedia({ reducedMotion: 'reduce' });
  await rmPage.goto(`${baseUrl}/branding/`, { waitUntil: 'domcontentloaded' });
  const rmH1 = rmPage.locator('.service-hero h1').first();
  const rmVisible = await rmH1.isVisible();
  const rmOpacity = await rmH1.evaluate(el => window.getComputedStyle(el).opacity);
  console.log(`  Reduced-motion H1 immediately visible: ${rmVisible}, Opacity: ${rmOpacity}`);
  await rmPage.close();

  await browser.close();
  console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
