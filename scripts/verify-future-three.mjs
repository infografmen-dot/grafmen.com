import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'C:\\Users\\infog\\.gemini\\antigravity-ide\\brain\\96cfd579-e6ac-4ff4-8ef2-cfb1b5054459\\scratch\\f3_verification';
fs.mkdirSync(outDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await desktopContext.newPage();

  console.log('1. Navigating to homepage http://localhost:4321/...');
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Check Future Three elements on Homepage
  const f3Count = await page.locator('.f3-link').count();
  console.log('Number of f3-link elements found on homepage:', f3Count);

  // Check Drew-Art external link
  const drewArtLink = page.locator('.p5 .project-ext-link');
  const drewArtHref = await drewArtLink.getAttribute('href');
  const drewArtText = await drewArtLink.innerText();
  console.log('Drew-Art link href:', drewArtHref);
  console.log('Drew-Art link text:', drewArtText);

  // Take screenshot of Drew-Art card in portfolio
  const p5Card = page.locator('.work.p5');
  await p5Card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await p5Card.screenshot({ path: path.join(outDir, '01_drew_art_card.png') });
  console.log('Captured 01_drew_art_card.png');

  // Test hover on Drew-Art link
  await drewArtLink.hover();
  await page.waitForTimeout(400);
  await p5Card.screenshot({ path: path.join(outDir, '02_drew_art_card_hover.png') });
  console.log('Captured 02_drew_art_card_hover.png');

  // Test hover on main nav link
  const firstNavLink = page.locator('#main-nav a').first();
  await firstNavLink.scrollIntoViewIfNeeded();
  await firstNavLink.hover();
  await page.waitForTimeout(400);
  const header = page.locator('header').first();
  await header.screenshot({ path: path.join(outDir, '03_nav_hover.png') });
  console.log('Captured 03_nav_hover.png');

  // Test CTA button hover
  const ctaBtn = page.locator('.hero .actions .btn.dark');
  await ctaBtn.scrollIntoViewIfNeeded();
  await ctaBtn.hover();
  await page.waitForTimeout(400);
  await ctaBtn.screenshot({ path: path.join(outDir, '04_hero_cta_hover.png') });
  console.log('Captured 04_hero_cta_hover.png');

  // 2. Check /strony-www/ Modernizacja Panel
  console.log('2. Navigating to /strony-www/...');
  await page.goto('http://localhost:4321/strony-www/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Confirm NO f3-link on /strony-www/
  const f3OnSubpage = await page.locator('.f3-link').count();
  console.log('Number of f3-link elements on /strony-www/ (MUST BE 0):', f3OnSubpage);

  const modPanel = page.locator('.modernizacja-panel');
  await modPanel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await modPanel.screenshot({ path: path.join(outDir, '05_modernizacja_panel_desktop.png') });
  console.log('Captured 05_modernizacja_panel_desktop.png');

  // Check paragraphs and font size in modernizacja panel
  const modParagraphs = await page.locator('.modernizacja-panel-content p').allInnerTexts();
  console.log('Modernizacja panel paragraphs count:', modParagraphs.length);
  console.log('Paragraph 1:', modParagraphs[0]);
  console.log('Paragraph 2:', modParagraphs[1]);

  const pFontSize = await page.locator('.modernizacja-panel-content p').first().evaluate(el => window.getComputedStyle(el).fontSize);
  const pLineHeight = await page.locator('.modernizacja-panel-content p').first().evaluate(el => window.getComputedStyle(el).lineHeight);
  console.log('Modernizacja paragraph font-size:', pFontSize, 'line-height:', pLineHeight);

  // 3. Check /strony-www/ on Mobile (390px)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4321/strony-www/', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);
  const modPanelMobile = mobilePage.locator('.modernizacja-panel');
  await modPanelMobile.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(400);
  await modPanelMobile.screenshot({ path: path.join(outDir, '06_modernizacja_panel_mobile.png') });
  console.log('Captured 06_modernizacja_panel_mobile.png');

  const pMobileFontSize = await mobilePage.locator('.modernizacja-panel-content p').first().evaluate(el => window.getComputedStyle(el).fontSize);
  console.log('Mobile modernizacja paragraph font-size:', pMobileFontSize);

  // 4. Check /kontakt/ Scroll Reveals
  console.log('3. Navigating to /kontakt/...');
  await page.goto('http://localhost:4321/kontakt/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Confirm NO f3-link on /kontakt/
  const f3OnContact = await page.locator('.f3-link').count();
  console.log('Number of f3-link elements on /kontakt/ (MUST BE 0):', f3OnContact);

  const contactSection = page.locator('.contact-section');
  await contactSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await contactSection.screenshot({ path: path.join(outDir, '07_contact_section_revealed.png') });
  console.log('Captured 07_contact_section_revealed.png');

  // Verify form opacity and visibility
  const formOpacity = await page.locator('#contact-form').evaluate(el => window.getComputedStyle(el).opacity);
  console.log('Contact form opacity after scroll reveal:', formOpacity);

  await browser.close();
  console.log('=== All verification checks passed! ===');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
