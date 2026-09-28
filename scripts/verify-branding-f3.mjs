import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('--- TEST: BRIEF BRANDING F3 BUTTONS ---');

  // PL Branding Brief
  await page.goto('http://localhost:4321/brief-branding/', { waitUntil: 'networkidle' });

  const btnNext = page.locator('#brief-btn-next');
  const btnNextHasF3 = await btnNext.evaluate(el => el.classList.contains('f3-link'));
  const btnNextChars = await btnNext.locator('.f3-char').allInnerTexts();
  console.log(`[PL Branding Step 1 btnNext] f3-link: ${btnNextHasF3}, chars: "${btnNextChars.join('')}"`);

  // Hover test
  await btnNext.hover();
  await page.waitForTimeout(200);
  const hoverTransform = await btnNext.locator('.f3-char').first().evaluate(el => window.getComputedStyle(el).transform);
  console.log(`[PL Branding Step 1 btnNext hover transform]: ${hoverTransform}`);

  // Fill step 1 (PL)
  await page.locator('.tile-choice').first().click();
  await page.fill('#brand-name', 'Nowa Marka');
  await page.fill('#brand-overview', 'Projekt nowej marki mebli autorskich.');
  await btnNext.click();
  await page.waitForTimeout(300);

  // Step 2: Back button
  const btnPrev = page.locator('#brief-btn-prev');
  const btnPrevHasF3 = await btnPrev.evaluate(el => el.classList.contains('f3-link'));
  const btnPrevChars = await btnPrev.locator('.f3-char').allInnerTexts();
  const btnPrevArrow = await btnPrev.locator('.f3-arrow').innerText();
  console.log(`[PL Branding Step 2 btnPrev] f3-link: ${btnPrevHasF3}, chars: "${btnPrevChars.join('')}", arrow: ${btnPrevArrow}`);

  // Step 2 -> Step 3
  await btnNext.click();
  await page.waitForTimeout(300);

  const step3NextText = await btnNext.locator('.f3-char').allInnerTexts();
  console.log(`[PL Branding Step 3 btnNext] chars: "${step3NextText.join('')}"`);

  // Step 3 fill
  await page.fill('#contact-name', 'Jan Kowalski');
  await page.fill('#contact-email', 'jan@example.com');
  await btnNext.click();
  await page.waitForTimeout(300);

  // Summary submit button
  const btnSubmit = page.locator('#brief-btn-submit');
  const btnSubmitHasF3 = await btnSubmit.evaluate(el => el.classList.contains('f3-link'));
  const btnSubmitChars = await btnSubmit.locator('.f3-char').allInnerTexts();
  console.log(`[PL Branding Summary btnSubmit] f3-link: ${btnSubmitHasF3}, chars: "${btnSubmitChars.join('')}"`);

  // EN Branding Brief
  console.log('\n--- TESTING EN BRANDING BRIEF ---');
  await page.goto('http://localhost:4321/en/brief-branding/', { waitUntil: 'networkidle' });

  const enBtnNext = page.locator('#brief-btn-next');
  const enBtnNextChars = await enBtnNext.locator('.f3-char').allInnerTexts();
  console.log(`[EN Branding Step 1 btnNext] chars: "${enBtnNextChars.join('')}"`);

  await page.locator('.tile-choice').first().click();
  await page.fill('#brand-name', 'Global Brand');
  await page.fill('#brand-overview', 'Design for a new luxury furniture brand.');
  await enBtnNext.click();
  await page.waitForTimeout(300);

  // Step 2 -> Step 3
  await enBtnNext.click();
  await page.waitForTimeout(300);

  const enStep3Chars = await enBtnNext.locator('.f3-char').allInnerTexts();
  console.log(`[EN Branding Step 3 btnNext] chars: "${enStep3Chars.join('')}"`);

  // Step 3 fill EN
  await page.fill('#contact-name', 'John Doe');
  await page.fill('#contact-email', 'john@example.com');
  await enBtnNext.click();
  await page.waitForTimeout(300);

  const enBtnSubmit = page.locator('#brief-btn-submit');
  const enBtnSubmitHasF3 = await enBtnSubmit.evaluate(el => el.classList.contains('f3-link'));
  const enBtnSubmitChars = await enBtnSubmit.locator('.f3-char').allInnerTexts();
  console.log(`[EN Branding Summary btnSubmit] f3-link: ${enBtnSubmitHasF3}, chars: "${enBtnSubmitChars.join('')}"`);

  console.log('\n✅ ALL BRANDING F3 BUTTON TESTS PASSED SUCCESSFULLY!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
