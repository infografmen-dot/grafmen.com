import { chromium } from 'playwright-core';

async function testBriefFlow(page, url, isEn) {
  console.log(`\n========================================`);
  console.log(`TESTING FLOW: ${url}`);
  console.log(`========================================`);

  await page.goto(`http://localhost:4321${url}`, { waitUntil: 'networkidle' });

  const btnPrev = page.locator('#brief-btn-prev');
  const btnNext = page.locator('#brief-btn-next');
  const btnSubmit = page.locator('#brief-btn-submit');

  const checkButtons = async (stepName, expectedPrev, expectedNext, expectedSubmit, expectedNextText) => {
    const prevVis = await btnPrev.isVisible();
    const nextVis = await btnNext.isVisible();
    const submitVis = await btnSubmit.isVisible();
    const nextChars = nextVis ? (await btnNext.locator('.f3-char').allInnerTexts()).join('') : '';

    console.log(`[${stepName}]`);
    console.log(`  Prev:   visible=${prevVis} (expected=${expectedPrev})`);
    console.log(`  Next:   visible=${nextVis} (expected=${expectedNext}), text="${nextChars}"`);
    console.log(`  Submit: visible=${submitVis} (expected=${expectedSubmit})`);

    if (prevVis !== expectedPrev) throw new Error(`[${stepName}] Prev visibility mismatch!`);
    if (nextVis !== expectedNext) throw new Error(`[${stepName}] Next visibility mismatch!`);
    if (submitVis !== expectedSubmit) throw new Error(`[${stepName}] Submit visibility mismatch!`);
    if (expectedNextText && nextChars !== expectedNextText) {
      throw new Error(`[${stepName}] Next text mismatch! Expected "${expectedNextText}", got "${nextChars}"`);
    }
  };

  // --- KROK 1 ---
  await checkButtons('KROK 1', false, true, false, isEn ? 'Next' : 'Dalej');

  // Wypełnij krok 1
  await page.locator('.tile-choice').first().click();
  const textarea = page.locator('.brief-step.is-active textarea').first();
  await textarea.fill('Testing company overview and project scope.');
  const textInput = page.locator('.brief-step.is-active input[type="text"]').first();
  if (await textInput.count() > 0 && await textInput.isVisible()) {
    await textInput.fill('Test Brand');
  }
  await btnNext.click();
  await page.waitForTimeout(300);

  // --- KROK 2 ---
  await checkButtons('KROK 2', true, true, false, isEn ? 'Next' : 'Dalej');

  // Przejdź do kroku 3
  await btnNext.click();
  await page.waitForTimeout(300);

  // --- KROK 3 ---
  await checkButtons('KROK 3', true, true, false, isEn ? 'Reviewyouranswers' : 'Przejdźdopodsumowania');

  // Wypełnij krok 3
  await page.fill('#contact-name', 'Jan Kowalski');
  await page.fill('#contact-email', 'jan@example.com');
  await btnNext.click();
  await page.waitForTimeout(300);

  // --- PODSUMOWANIE ---
  await checkButtons('PODSUMOWANIE', true, false, true, '');

  // Sprawdź powrót (kliknięcie Wstecz z podsumowania)
  console.log('Testing Back button from summary...');
  await btnPrev.click();
  await page.waitForTimeout(300);

  // Powrót do kroku 3
  await checkButtons('KROK 3 (after back)', true, true, false, isEn ? 'Reviewyouranswers' : 'Przejdźdopodsumowania');

  console.log(`✅ Flow ${url} passed with 100% accuracy!`);
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await testBriefFlow(page, '/brief-strony-www/', false);
  await testBriefFlow(page, '/brief-branding/', false);
  await testBriefFlow(page, '/en/brief-website/', true);
  await testBriefFlow(page, '/en/brief-branding/', true);

  console.log('\n🎉 ALL 4 BRIEF FLOWS TESTED & VERIFIED ACROSS ALL STEPS!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
