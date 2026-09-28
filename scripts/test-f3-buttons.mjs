import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('--- TEST: F3 LINK EFFECT ON BRIEF BUTTONS ---');

  // Test PL Brief Strony WWW
  await page.goto('http://localhost:4321/brief-strony-www/', { waitUntil: 'networkidle' });

  // 1. Sprawdź referencyjny przycisk Kontakt w nagłówku
  const quoteBtn = page.locator('.tools .quote');
  const quoteChars = await quoteBtn.locator('.f3-char').count();
  const quoteArrow = await quoteBtn.locator('.f3-arrow').count();
  console.log(`[Reference .quote] f3-chars count: ${quoteChars}, f3-arrow count: ${quoteArrow}`);
  if (quoteChars === 0) {
    throw new Error('Reference .quote button is missing .f3-char elements!');
  }

  // 2. Sprawdź przycisk Dalej na kroku 1
  const btnNext = page.locator('#brief-btn-next');
  const btnNextHasF3 = await btnNext.evaluate(el => el.classList.contains('f3-link'));
  const btnNextChars = await btnNext.locator('.f3-char').allInnerTexts();
  const btnNextArrow = await btnNext.locator('.f3-arrow').innerText();
  console.log(`[Step 1 btnNext] has f3-link: ${btnNextHasF3}, chars: [${btnNextChars.join(',')}], arrow: ${btnNextArrow}`);

  if (!btnNextHasF3 || btnNextChars.length === 0) {
    throw new Error('btnNext on Step 1 is missing F3 structure!');
  }

  // Sprawdź style przed i po hover
  const charBeforeHover = await btnNext.locator('.f3-char').first().evaluate(el => {
    const cs = window.getComputedStyle(el);
    return {
      textShadow: cs.textShadow,
      transform: cs.transform,
      transition: cs.transition
    };
  });
  console.log('[Step 1 btnNext char before hover]', charBeforeHover);

  await btnNext.hover();
  await page.waitForTimeout(200);

  const charAfterHover = await btnNext.locator('.f3-char').first().evaluate(el => {
    const cs = window.getComputedStyle(el);
    return {
      textShadow: cs.textShadow,
      transform: cs.transform
    };
  });
  console.log('[Step 1 btnNext char after hover]', charAfterHover);

  // Wypełnij krok 1 i przejdź do kroku 2
  await page.locator('.tile-choice').first().click();
  await page.fill('#company-overview', 'Firma meblarska tworząca nowoczesne kuchnie.');
  await btnNext.click();
  await page.waitForTimeout(300);

  // Sprawdź przycisk Wstecz na kroku 2
  const btnPrev = page.locator('#brief-btn-prev');
  const btnPrevHasF3 = await btnPrev.evaluate(el => el.classList.contains('f3-link'));
  const btnPrevChars = await btnPrev.locator('.f3-char').allInnerTexts();
  const btnPrevArrow = await btnPrev.locator('.f3-arrow').innerText();
  console.log(`[Step 2 btnPrev] has f3-link: ${btnPrevHasF3}, chars: [${btnPrevChars.join(',')}], arrow: ${btnPrevArrow}`);

  if (!btnPrevHasF3 || btnPrevChars.length === 0 || btnPrevArrow !== '←') {
    throw new Error('btnPrev on Step 2 is missing left-arrow F3 structure!');
  }

  // Przejdź do kroku 3
  await btnNext.click();
  await page.waitForTimeout(300);

  // Na kroku 3 przycisk Dalej powinien mieć tekst "Przejdź do podsumowania" i F3
  const step3NextText = await btnNext.locator('.f3-char').allInnerTexts();
  console.log(`[Step 3 btnNext] chars: "${step3NextText.join('')}"`);
  if (step3NextText.join('') !== 'Przejdźdopodsumowania') {
    throw new Error(`Expected "Przejdź do podsumowania" but got "${step3NextText.join('')}"`);
  }

  // Wypełnij krok 3 i przejdź do podsumowania
  await page.fill('#contact-name', 'Jan Kowalski');
  await page.fill('#contact-email', 'jan@example.com');
  await btnNext.click();
  await page.waitForTimeout(300);

  // Na podsumowaniu sprawdź przycisk Wyślij brief
  const btnSubmit = page.locator('#brief-btn-submit');
  const btnSubmitVisible = await btnSubmit.isVisible();
  const btnSubmitHasF3 = await btnSubmit.evaluate(el => el.classList.contains('f3-link'));
  const btnSubmitChars = await btnSubmit.locator('.f3-char').allInnerTexts();
  console.log(`[Summary btnSubmit] visible: ${btnSubmitVisible}, f3-link: ${btnSubmitHasF3}, chars: "${btnSubmitChars.join('')}"`);

  if (!btnSubmitVisible || !btnSubmitHasF3 || btnSubmitChars.join('') !== 'Wyślijbrief') {
    throw new Error('btnSubmit on Summary is missing F3 structure!');
  }

  // TEST WERSJI ANGIELSKIEJ
  console.log('\n--- TESTING EN BRIEF ---');
  await page.goto('http://localhost:4321/en/brief-website/', { waitUntil: 'networkidle' });

  const enBtnNext = page.locator('#brief-btn-next');
  const enBtnNextChars = await enBtnNext.locator('.f3-char').allInnerTexts();
  console.log(`[EN Step 1 btnNext] chars: "${enBtnNextChars.join('')}"`);
  if (enBtnNextChars.join('') !== 'Continue' && enBtnNextChars.join('') !== 'Next') {
    console.log('EN Step 1 chars:', enBtnNextChars);
  }

  await page.locator('.tile-choice').first().click();
  await page.fill('#company-overview', 'Modern furniture studio in Poland.');
  await enBtnNext.click();
  await page.waitForTimeout(300);

  // Krok 2 -> Krok 3
  await enBtnNext.click();
  await page.waitForTimeout(300);

  const enStep3Chars = await enBtnNext.locator('.f3-char').allInnerTexts();
  console.log(`[EN Step 3 btnNext] chars: "${enStep3Chars.join('')}"`);
  if (enStep3Chars.join('') !== 'Reviewyouranswers') {
    throw new Error(`Expected "Review your answers" but got "${enStep3Chars.join('')}"`);
  }

  console.log('\n✅ ALL F3 BUTTON TESTS PASSED SUCCESSFULLY!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
